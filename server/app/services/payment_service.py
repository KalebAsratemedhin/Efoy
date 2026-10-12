import stripe
from typing import Optional, Dict, Any
from datetime import datetime
from fastapi import HTTPException, status
from app.db.models.payment import Payment, PaymentStatus
from app.db.models.booking import Booking
from app.db.models.user import User
from app.schemas.payment import (
    CreatePaymentIntentRequest,
    CreateCheckoutSessionRequest,
    PaymentIntentResponse,
    CheckoutSessionResponse
)
from beanie import PydanticObjectId
from app.core.config import get_settings

# Load settings first so .env is loaded (pydantic-settings), then initialize Stripe
settings = get_settings()
if not settings.STRIPE_SECRET_KEY:
    raise ValueError("STRIPE_SECRET_KEY environment variable is required")
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    async def create_payment_intent(request: CreatePaymentIntentRequest, current_user: User) -> PaymentIntentResponse:
        """Create a Stripe payment intent"""
        try:
            # Verify booking exists and belongs to user
            booking = await Booking.get(request.bookingId, fetch_links=True)
            if not booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            if booking.patientId.id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to booking")

            # Use the booking's payment amount instead of request amount
            payment_amount = booking.paymentAmount
            payment_currency = booking.paymentCurrency
            
            # Use centralized defaults if not set
            if not payment_amount:
                payment_amount = settings.DEFAULT_PAYMENT_AMOUNT
            if not payment_currency:
                payment_currency = settings.DEFAULT_PAYMENT_CURRENCY
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(payment_amount * 100),  # Convert to cents
                currency=payment_currency.lower(),
                description=request.description or f"Appointment payment for booking {request.bookingId}",
                metadata={
                    "bookingId": request.bookingId,
                    "patientId": str(current_user.id),
                    "doctorId": str(booking.doctorId.id),
                    **(request.metadata or {})
                }
            )

            # Create payment record
            payment = Payment(
                bookingId=booking,
                patientId=current_user,
                doctorId=booking.doctorId,
                amount=payment_amount,
                currency=payment_currency,
                status=PaymentStatus.PENDING,
                stripePaymentIntentId=intent.id,
                description=request.description,
                metadata=request.metadata
            )
            await payment.insert()

            return PaymentIntentResponse(
                id=intent.id,
                amount=request.amount,
                currency=request.currency,
                status=intent.status,
                clientSecret=intent.client_secret,
                created=datetime.fromtimestamp(intent.created)
            )

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create payment intent: {str(e)}")

    @staticmethod
    async def create_checkout_session(request: CreateCheckoutSessionRequest, current_user: User) -> CheckoutSessionResponse:
        """Create a Stripe checkout session"""
        try:
            import logging
            logging.info(f"Creating checkout session for booking {request.bookingId}")
            
            # Verify booking exists and belongs to user
            booking = await Booking.get(request.bookingId, fetch_links=True)
            if not booking:
                logging.error(f"Booking {request.bookingId} not found")
                raise HTTPException(status_code=404, detail="Booking not found")
            
            if booking.patientId.id != current_user.id:
                logging.error(f"Unauthorized access to booking {request.bookingId} by user {current_user.id}")
                raise HTTPException(status_code=403, detail="Unauthorized access to booking")

            # Get user and doctor details for metadata
            doctor = await User.get(booking.doctorId.id)

            # Extract payment amount and currency from booking
            payment_amount = booking.paymentAmount
            payment_currency = booking.paymentCurrency
            
            # Use centralized defaults if not set
            if not payment_amount:
                payment_amount = settings.DEFAULT_PAYMENT_AMOUNT
            if not payment_currency:
                payment_currency = settings.DEFAULT_PAYMENT_CURRENCY
            
            logging.info(f"Payment details: amount={payment_amount}, currency={payment_currency}")

            # Get the origin from settings
            origin = settings.CLIENT_URL
            logging.info(f"Frontend URL: {origin}")
            
            # Create checkout session
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': payment_currency.lower(),
                        'product_data': {
                            'name': f"Appointment with Dr. {doctor.fullName if doctor else 'Unknown'}",
                            'description': request.description or f"Appointment on {booking.appointmentDate} at {booking.time}",
                        },
                        'unit_amount': int(payment_amount * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{origin}/payment/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{origin}/payment/cancel",
                metadata={
                    "bookingId": request.bookingId,
                    "patientId": str(current_user.id),
                    "doctorId": str(booking.doctorId.id),
                    "patientName": current_user.fullName,
                    "doctorName": doctor.fullName if doctor else "Unknown",
                    **(request.metadata or {})
                }
            )
            
            logging.info(f"Stripe checkout session created: {session.id}")

            # Create payment record
            payment = Payment(
                bookingId=booking,
                patientId=current_user,
                doctorId=booking.doctorId,
                amount=payment_amount,
                currency=payment_currency,
                status=PaymentStatus.PENDING,
                stripeSessionId=session.id,
                description=request.description,
                metadata=request.metadata
            )
            await payment.insert()
            logging.info(f"Payment record created: {payment.id}")

            return CheckoutSessionResponse(
                sessionId=session.id,
                url=session.url,
                expiresAt=datetime.fromtimestamp(session.expires_at) if session.expires_at else None
            )

        except stripe.error.StripeError as e:
            logging.error(f"Stripe error creating checkout session: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            logging.error(f"Unexpected error creating checkout session: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

    @staticmethod
    async def confirm_payment(payment_intent_id: str, current_user: User) -> Dict[str, Any]:
        """Confirm a payment intent"""
        try:
            # Get payment record
            payment = await Payment.find_one(Payment.stripePaymentIntentId == payment_intent_id)
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            if payment.patientId.id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to payment")

            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                # Update payment status
                payment.status = PaymentStatus.COMPLETED
                payment.paidAt = datetime.utcnow()
                await payment.save()
                
                # Update booking status if needed
                booking = await Booking.get(payment.bookingId.id, fetch_links=True)
                if booking:
                    booking.paymentStatus = 'paid'
                    booking.paymentId = str(payment.id)
                    if booking.status == 'pending':
                        booking.status = 'confirmed'
                    await booking.save()
                    from app.services.notification_service import NotificationService
                    payload = {
                        "bookingId": str(booking.id),
                        "paymentId": str(payment.id),
                        "amount": payment.amount,
                        "currency": payment.currency,
                    }
                    await NotificationService.notify(
                        recipient_id=booking.patientId.id,
                        type="payment_paid",
                        title="Payment successful",
                        message="Your appointment payment was received. The booking is confirmed.",
                        actor_id=current_user.id,
                        data=payload,
                    )
                    await NotificationService.notify(
                        recipient_id=booking.doctorId.id,
                        type="booking_confirmed",
                        title="Appointment confirmed",
                        message=(
                            f"Payment received for appointment on "
                            f"{booking.appointmentDate} at {booking.time}."
                        ),
                        actor_id=current_user.id,
                        data=payload,
                    )

                return {
                    "success": True,
                    "message": "Payment confirmed successfully",
                    "paymentId": str(payment.id),
                    "amount": payment.amount,
                    "currency": payment.currency
                }
            else:
                raise HTTPException(status_code=400, detail=f"Payment not successful. Status: {intent.status}")

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to confirm payment: {str(e)}")

    @staticmethod
    async def get_payment_status(session_id: str, current_user: User) -> Dict[str, Any]:
        """Get payment status by session ID"""
        try:
            # Get payment record
            payment = await Payment.find_one(Payment.stripeSessionId == session_id)
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            if payment.patientId.id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to payment")

            # Get session from Stripe
            session = stripe.checkout.Session.retrieve(session_id)
            
            return {
                "paymentId": str(payment.id),
                "bookingId": str(payment.bookingId.id),
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status.value,
                "stripeStatus": session.payment_status,
                "createdAt": payment.created_at.isoformat(),
                "paidAt": payment.paidAt.isoformat() if payment.paidAt else None
            }

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to get payment status: {str(e)}")

    @staticmethod
    async def refund_payment(session_id: str, current_user: User, reason: Optional[str] = None, amount: Optional[float] = None) -> Dict[str, Any]:
        """Refund a payment"""
        try:
            # Get payment record
            payment = await Payment.find_one(Payment.stripeSessionId == session_id)
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            if payment.patientId.id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized access to payment")

            if payment.status != PaymentStatus.COMPLETED:
                raise HTTPException(status_code=400, detail="Payment cannot be refunded")

            # Create refund in Stripe
            refund_params = {
                "payment_intent": payment.stripePaymentIntentId,
                "reason": "requested_by_customer"
            }
            
            if amount:
                refund_params["amount"] = int(amount * 100)  # Convert to cents
            
            if reason:
                refund_params["metadata"] = {"reason": reason}

            refund = stripe.Refund.create(**refund_params)

            # Update payment status
            payment.status = PaymentStatus.REFUNDED
            await payment.save()

            from app.services.notification_service import NotificationService
            await NotificationService.notify(
                recipient_id=current_user.id,
                type="payment_refunded",
                title="Payment refunded",
                message="Your refund request was processed successfully.",
                data={
                    "paymentId": str(payment.id),
                    "refundId": refund.id,
                    "bookingId": str(payment.bookingId.id)
                    if hasattr(payment.bookingId, "id")
                    else str(payment.bookingId),
                },
            )

            return {
                "success": True,
                "refundId": refund.id,
                "amount": refund.amount / 100,  # Convert from cents
                "currency": refund.currency,
                "status": refund.status
            }

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Stripe error: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to refund payment: {str(e)}")

    @staticmethod
    async def handle_webhook(event_data: Dict[str, Any]) -> bool:
        """Handle Stripe webhook events"""
        try:
            import logging
            event_type = event_data.get('type')
            logging.info(f"Processing webhook event: {event_type}")
            
            if event_type == 'checkout.session.completed':
                session = event_data.get('data', {}).get('object', {})
                session_id = session.get('id')
                logging.info(f"Processing checkout.session.completed for session: {session_id}")
                
                if session_id:
                    # Update payment status
                    payment = await Payment.find_one(Payment.stripeSessionId == session_id, fetch_links=True)
                    if payment:
                        logging.info(f"Found payment record: {payment.id}")
                        payment.status = PaymentStatus.COMPLETED
                        payment.paidAt = datetime.utcnow()
                        await payment.save()
                        logging.info(f"Updated payment status to completed")
                        
                        # Update booking status and payment info
                        booking = await Booking.get(payment.bookingId.id, fetch_links=True)
                        if booking:
                            logging.info(f"Updating booking {booking.id} payment status and confirming appointment")
                            booking.paymentStatus = 'paid'
                            booking.paymentId = str(payment.id)
                            if booking.status == 'pending':
                                booking.status = 'confirmed'
                            await booking.save()
                            logging.info(f"Updated booking payment status to paid and status to confirmed")

                            from app.services.notification_service import NotificationService
                            patient_id = booking.patientId.id
                            doctor_id = booking.doctorId.id
                            payload = {
                                "bookingId": str(booking.id),
                                "paymentId": str(payment.id),
                                "amount": payment.amount,
                                "currency": payment.currency,
                            }
                            await NotificationService.notify(
                                recipient_id=patient_id,
                                type="payment_paid",
                                title="Payment successful",
                                message="Your appointment payment was received. The booking is confirmed.",
                                data=payload,
                            )
                            await NotificationService.notify(
                                recipient_id=doctor_id,
                                type="booking_confirmed",
                                title="Appointment confirmed",
                                message=(
                                    f"Payment received for appointment on "
                                    f"{booking.appointmentDate} at {booking.time}."
                                ),
                                data=payload,
                            )
                        else:
                            logging.error(f"Booking not found for payment: {payment.bookingId.id}")
                    else:
                        logging.warning(f"No payment record found for session: {session_id}")
                
                return True
                
            elif event_type == 'charge.refunded':
                charge = event_data.get('data', {}).get('object', {})
                payment_intent_id = charge.get('payment_intent')
                
                if payment_intent_id:
                    # Update payment status
                    payment = await Payment.find_one(
                        Payment.stripePaymentIntentId == payment_intent_id,
                        fetch_links=True,
                    )
                    if payment:
                        payment.status = PaymentStatus.REFUNDED
                        await payment.save()
                        from app.services.notification_service import NotificationService
                        patient_id = payment.patientId.id if hasattr(payment.patientId, "id") else payment.patientId
                        await NotificationService.notify(
                            recipient_id=patient_id,
                            type="payment_refunded",
                            title="Payment refunded",
                            message="A refund for your appointment payment was processed.",
                            data={
                                "paymentId": str(payment.id),
                                "bookingId": str(payment.bookingId.id)
                                if hasattr(payment.bookingId, "id")
                                else str(payment.bookingId),
                            },
                        )
                
                return True
            
            return True

        except Exception as e:
            import logging
            logging.error(f"Webhook handling error: {str(e)}")
            return False 
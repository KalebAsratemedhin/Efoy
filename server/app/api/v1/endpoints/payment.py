from fastapi import APIRouter, Depends, HTTPException, Request, status
from typing import Dict, Any
import stripe
import os
from app.services.payment_service import PaymentService
from app.core.config import get_settings
from app.schemas.payment import (
    CreatePaymentIntentRequest,
    CreateCheckoutSessionRequest,
    ConfirmPaymentRequest,
    RefundPaymentRequest
)
from app.core.security import get_current_user
from app.db.models.user import User

router = APIRouter()

@router.post("/create-payment-intent")
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe payment intent"""
    return await PaymentService.create_payment_intent(request, current_user)

@router.post("/create-checkout-session")
async def create_checkout_session(
    request: CreateCheckoutSessionRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a Stripe checkout session"""
    import logging
    logging.info(f"Received checkout session request: {request}")
    logging.info(f"Current user: {current_user.id}")
    
    try:
        result = await PaymentService.create_checkout_session(request, current_user)
        logging.info(f"Checkout session created successfully: {result}")
        return result
    except Exception as e:
        logging.error(f"Error in create_checkout_session endpoint: {str(e)}")
        raise

@router.post("/confirm-payment/{payment_intent_id}")
async def confirm_payment(
    payment_intent_id: str,
    request: ConfirmPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Confirm a payment intent"""
    return await PaymentService.confirm_payment(payment_intent_id, current_user)

@router.get("/status/{session_id}")
async def get_payment_status(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get payment status by session ID"""
    return await PaymentService.get_payment_status(session_id, current_user)

@router.post("/refund/{session_id}")
async def refund_payment(
    session_id: str,
    request: RefundPaymentRequest,
    current_user: User = Depends(get_current_user)
):
    """Refund a payment"""
    return await PaymentService.refund_payment(
        session_id, 
        current_user,
        request.reason,
        request.amount
    )

@router.get("/test-webhook")
async def test_webhook():
    """Test endpoint to verify webhook is working"""
    return {"message": "Webhook endpoint is accessible", "status": "ok"}

@router.get("/debug-config")
async def debug_config():
    """Debug endpoint to check Stripe configuration"""
    import os
    from app.core.config import get_settings
    settings = get_settings()
    
    return {
        "stripe_key_configured": bool(os.getenv("STRIPE_SECRET_KEY")),
        "stripe_key_length": len(os.getenv("STRIPE_SECRET_KEY", "")) if os.getenv("STRIPE_SECRET_KEY") else 0,
        "client_url": settings.CLIENT_URL,
        "webhook_secret_configured": bool(get_settings().STRIPE_WEBHOOK_SECRET),
        "webhook_secret_length": len(get_settings().STRIPE_WEBHOOK_SECRET or "")
    }

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    import logging
    
    try:
        logging.info("Webhook received")
        
        # Get the webhook secret from settings (loads from .env)
        webhook_secret = get_settings().STRIPE_WEBHOOK_SECRET
        if not webhook_secret:
            logging.error("STRIPE_WEBHOOK_SECRET not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Webhook secret not configured"
            )

        # Get the raw body and signature
        body = await request.body()
        signature = request.headers.get("stripe-signature")
        
        logging.info(f"Webhook signature: {signature[:20] if signature else 'None'}...")

        if not signature:
            logging.error("Missing stripe-signature header")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing stripe-signature header"
            )

        try:
            # Verify the webhook signature
            event = stripe.Webhook.construct_event(
                body, signature, webhook_secret
            )
            logging.info(f"Webhook signature verified, event type: {event.get('type')}")
        except ValueError as e:
            logging.error(f"Invalid webhook payload: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payload"
            )
        except stripe.error.SignatureVerificationError as e:
            logging.error(f"Invalid webhook signature: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid signature"
            )

        # Handle the event
        success = await PaymentService.handle_webhook(event)
        
        if success:
            logging.info("Webhook processed successfully")
            return {"received": True}
        else:
            logging.error("Failed to process webhook")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to process webhook"
            )

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Unexpected webhook error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Webhook error: {str(e)}"
        ) 
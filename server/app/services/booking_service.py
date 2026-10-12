from app.db.models.booking import Booking
from app.db.models.user import User
from app.db.models.doctor import Doctor
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut
from beanie import PydanticObjectId
from datetime import date, datetime, timedelta
from fastapi import HTTPException, status
from typing import List, Optional, Set
from beanie.operators import And
import re
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import get_settings
from app.core.websocket_manager import websocket_manager
from app.services.notification_service import NotificationService
from zoneinfo import ZoneInfo

settings = get_settings()

BOOKING_STATUSES = {"pending", "confirmed", "finished", "cancelled"}
BOOKING_PAYMENT_STATUSES = {"paid", "unpaid", "refunded"}
BOOKING_APPOINTMENT_TYPES = {"in_person", "virtual"}
BOOKING_SORT_OPTIONS = {"date_desc", "date_asc"}


def _empty_booking_page(page: int, limit: int) -> dict:
    return {
        "items": [],
        "total": 0,
        "page": page,
        "limit": limit,
        "total_pages": 0,
        "has_next": False,
        "has_prev": False,
    }


def _link_id(link) -> PydanticObjectId:
    if hasattr(link, "ref"):
        return link.ref.id
    return link.id


def _parse_object_id(value: str, field_name: str) -> PydanticObjectId:
    try:
        return PydanticObjectId(value)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}")


class BookingService:
    @staticmethod
    def _get_day_name(appointment_date: date) -> str:
        """Convert date to day name for working hours lookup"""
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        return days[appointment_date.weekday()]

    @staticmethod
    def _is_within_working_hours(doctor_working_hours: dict, day: str, time: str) -> bool:
        """Check if the appointment time is within doctor's working hours"""
        if day not in doctor_working_hours:
            return False
        
        day_hours = doctor_working_hours[day]
        start_time = day_hours.get("start", "08:00")
        end_time = day_hours.get("end", "17:00")
        
        return start_time <= time <= end_time

    @staticmethod
    def _doctor_data_dict(doctor: Doctor) -> dict:
        return {
            "id": str(doctor.id),
            "rating": doctor.rating,
            "orgID": doctor.orgID,
            "speciality": doctor.speciality,
            "experience": doctor.experience,
            "educationLevel": doctor.educationLevel,
            "sessionPrice": doctor.sessionPrice,
            "workingHours": doctor.workingHours,
            "created_at": doctor.created_at,
            "updated_at": doctor.updated_at,
        }

    @staticmethod
    async def find_all_user_bookings(
        current_user: User,
        page: int = 1,
        limit: int = 10,
        search: Optional[str] = None,
        status: Optional[str] = None,
        appointment_type: Optional[str] = None,
        payment_status: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        speciality: Optional[str] = None,
        min_rating: Optional[float] = None,
        sort: str = "date_desc",
        doctor_id: Optional[str] = None,
        patient_id: Optional[str] = None,
        exclude_id: Optional[str] = None,
    ) -> dict:
        if current_user.role not in ("patient", "doctor"):
            raise HTTPException(status_code=403, detail="No such role")

        if sort not in BOOKING_SORT_OPTIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid sort. Allowed: {', '.join(sorted(BOOKING_SORT_OPTIONS))}",
            )
        if status and status not in BOOKING_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Allowed: {', '.join(sorted(BOOKING_STATUSES))}",
            )
        if payment_status and payment_status not in BOOKING_PAYMENT_STATUSES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid payment_status. Allowed: {', '.join(sorted(BOOKING_PAYMENT_STATUSES))}",
            )
        if appointment_type and appointment_type not in BOOKING_APPOINTMENT_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid appointment_type. Allowed: {', '.join(sorted(BOOKING_APPOINTMENT_TYPES))}",
            )
        if date_from and date_to and date_from > date_to:
            raise HTTPException(status_code=400, detail="date_from cannot be after date_to")

        if (speciality or min_rating is not None) and current_user.role != "patient":
            raise HTTPException(
                status_code=400,
                detail="speciality and min_rating filters are only available for patients",
            )

        if doctor_id is not None and current_user.role != "patient":
            raise HTTPException(
                status_code=400,
                detail="doctor_id filter is only available for patients",
            )
        if patient_id is not None and current_user.role != "doctor":
            raise HTTPException(
                status_code=400,
                detail="patient_id filter is only available for doctors",
            )

        conditions = []
        if current_user.role == "patient":
            conditions.append(Booking.patientId.id == current_user.id)
        else:
            conditions.append(Booking.doctorId.id == current_user.id)

        if doctor_id is not None:
            conditions.append(Booking.doctorId.id == _parse_object_id(doctor_id, "doctor_id"))
        if patient_id is not None:
            conditions.append(Booking.patientId.id == _parse_object_id(patient_id, "patient_id"))
        if exclude_id is not None:
            conditions.append(Booking.id != _parse_object_id(exclude_id, "exclude_id"))

        if status:
            conditions.append(Booking.status == status)
        if appointment_type:
            conditions.append(Booking.appointmentType == appointment_type)
        if payment_status:
            conditions.append(Booking.paymentStatus == payment_status)
        if date_from:
            conditions.append(Booking.appointmentDate >= date_from)
        if date_to:
            conditions.append(Booking.appointmentDate <= date_to)

        doctor_user_ids: Optional[Set[PydanticObjectId]] = None

        if speciality or min_rating is not None:
            doctor_filter: dict = {}
            if speciality:
                doctor_filter["speciality"] = {
                    "$regex": f"^{re.escape(speciality.strip())}$",
                    "$options": "i",
                }
            if min_rating is not None:
                doctor_filter["rating"] = {"$gte": min_rating}
            matching_doctors = await Doctor.find(doctor_filter).to_list()
            doctor_user_ids = {_link_id(d.userId) for d in matching_doctors}

        if search and search.strip():
            term = search.strip()
            if current_user.role == "patient":
                name_users = await User.find({
                    "role": "doctor",
                    "fullName": {"$regex": re.escape(term), "$options": "i"},
                }).to_list()
                search_ids = {u.id for u in name_users}
                doctor_user_ids = (
                    search_ids if doctor_user_ids is None else doctor_user_ids & search_ids
                )
            else:
                name_users = await User.find({
                    "role": "patient",
                    "fullName": {"$regex": re.escape(term), "$options": "i"},
                }).to_list()
                patient_ids = [u.id for u in name_users]
                if not patient_ids:
                    return _empty_booking_page(page, limit)
                conditions.append({"patientId.id": {"$in": patient_ids}})

        if doctor_user_ids is not None:
            if not doctor_user_ids:
                return _empty_booking_page(page, limit)
            # If doctor_id was also provided, intersect
            if doctor_id is not None:
                pair_doctor = _parse_object_id(doctor_id, "doctor_id")
                doctor_user_ids = {oid for oid in doctor_user_ids if oid == pair_doctor}
                if not doctor_user_ids:
                    return _empty_booking_page(page, limit)
            conditions.append({"doctorId.id": {"$in": list(doctor_user_ids)}})

        find_filter = And(*conditions) if len(conditions) > 1 else conditions[0]
        sort_criteria = (
            [("appointmentDate", 1), ("time", 1)]
            if sort == "date_asc"
            else [("appointmentDate", -1), ("time", -1)]
        )
        skip = (page - 1) * limit

        total_bookings = await Booking.find(find_filter).count()
        bookings = await Booking.find(find_filter).sort(sort_criteria).skip(skip).limit(limit).to_list()

        user_bookings_out = []
        for b in bookings:
            booking_full = await Booking.get(b.id, fetch_links=True)
            doctor = await Doctor.find_one(
                Doctor.userId.id == booking_full.doctorId.id,
                fetch_links=False,
            )
            booking_dict = booking_full.model_dump()
            if doctor:
                booking_dict["doctorData"] = BookingService._doctor_data_dict(doctor)
            user_bookings_out.append(BookingOut.model_validate(booking_dict))

        total_pages = (total_bookings + limit - 1) // limit if total_bookings else 0
        return {
            "items": user_bookings_out,
            "total": total_bookings,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        }

    @staticmethod
    async def find_recent_booking(current_user: User) -> dict:
        if current_user.role == "patient":
            booking = await Booking.find(Booking.patientId.id == current_user.id).sort([("appointmentDate", 1), ("time", 1)]).first_or_none()
        else:
            booking = await Booking.find(Booking.doctorId.id == current_user.id).sort([("appointmentDate", 1), ("time", 1)]).first_or_none()
        if not booking:
            raise HTTPException(status_code=404, detail="No recent booking found")
        booking_full = await Booking.get(booking.id, fetch_links=True)
        
        # Get doctor data for this booking (same as find_all_user_bookings)
        doctor = await Doctor.find_one(Doctor.userId.id == booking_full.doctorId.id, fetch_links=False)
        booking_dict = booking_full.model_dump()
        if doctor:
            # Extract doctor data without the nested userId structure
            doctor_data = {
                'id': str(doctor.id),
                'rating': doctor.rating,
                'orgID': doctor.orgID,
                'speciality': doctor.speciality,
                'experience': doctor.experience,
                'educationLevel': doctor.educationLevel,
                'workingHours': doctor.workingHours,
                'created_at': doctor.created_at,
                'updated_at': doctor.updated_at
            }
            booking_dict['doctorData'] = doctor_data
        
        return BookingOut.model_validate(booking_dict)

    @staticmethod
    async def find_one_booking(id: str) -> dict:
        booking = await Booking.get(PydanticObjectId(id), fetch_links=True)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        # Get doctor data for this booking
        doctor = await Doctor.find_one(Doctor.userId.id == booking.doctorId.id, fetch_links=False)
        booking_dict = booking.model_dump()
        if doctor:
            # Extract doctor data without the nested userId structure
            doctor_data = {
                'id': str(doctor.id),
                'rating': doctor.rating,
                'orgID': doctor.orgID,
                'speciality': doctor.speciality,
                'experience': doctor.experience,
                'educationLevel': doctor.educationLevel,
                'sessionPrice': doctor.sessionPrice,
                'workingHours': doctor.workingHours,
                'created_at': doctor.created_at,
                'updated_at': doctor.updated_at
            }
            booking_dict['doctorData'] = doctor_data
        return BookingOut.model_validate(booking_dict)

    @staticmethod
    async def find_available_time_slots(doctorId: str, date_: date) -> List[str]:
        def generate_time_slots(start, end, interval):
            slots = []
            current = datetime.strptime(start, "%H:%M")
            end_time = datetime.strptime(end, "%H:%M")
            while current <= end_time:
                slots.append(current.strftime("%H:%M"))
                current += timedelta(minutes=interval)
            return slots
        
        # Get doctor's working hours
        doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(doctorId))
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        
        day_name = BookingService._get_day_name(date_)
        working_hours = doctor.workingHours.get(day_name, {"start": "08:00", "end": "17:00"})
        
        all_slots = generate_time_slots(working_hours["start"], working_hours["end"], 20)

        # Filter out past slots if today
        hospital_tz = ZoneInfo("Africa/Addis_Ababa")
        now = datetime.now(tz=hospital_tz)
        is_today = (date_ == now.date())
        if is_today:
            current_time_str = now.strftime("%H:%M")
            all_slots = [slot for slot in all_slots if slot >= current_time_str]

        bookings = await Booking.find(
            And(
                Booking.doctorId.id == PydanticObjectId(doctorId),
                Booking.appointmentDate == date_
            )
        ).to_list()
        booked_slots = [b.time for b in bookings]
        return [slot for slot in all_slots if slot not in booked_slots]

    @staticmethod
    async def create_booking_with_transaction(booking_in: BookingCreate, current_user: User) -> dict:
        """Create booking with database transaction for data integrity"""
        client = AsyncIOMotorClient(settings.MONGO_URI)
        database = client.get_default_database()
        
        async with await client.start_session() as session:
            async with session.start_transaction():
                try:
                    # Validate date
                    if booking_in.appointmentDate < date.today():
                        raise HTTPException(status_code=400, detail="Appointment date cannot be in the past.")
                    
                    # Validate time format (HH:MM)
                    if not re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", booking_in.time):
                        raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM.")
                    
                    # Get doctor and check working hours
                    doctor = await Doctor.find_one(Doctor.userId.id == PydanticObjectId(booking_in.doctorId))
                    if not doctor:
                        raise HTTPException(status_code=404, detail="Doctor not found")
                    
                    day_name = BookingService._get_day_name(booking_in.appointmentDate)
                    if not BookingService._is_within_working_hours(doctor.workingHours, day_name, booking_in.time):
                        working_hours = doctor.workingHours.get(day_name, {"start": "08:00", "end": "17:00"})
                        raise HTTPException(
                            status_code=400, 
                            detail=f"Appointment time is outside doctor's working hours for {day_name} ({working_hours['start']} - {working_hours['end']})"
                        )
                    
                    # Check for existing booking with transaction
                    existing = await Booking.find(
                        And(
                            Booking.doctorId.id == PydanticObjectId(booking_in.doctorId),
                            Booking.appointmentDate == booking_in.appointmentDate,
                            Booking.time == booking_in.time
                        )
                    ).to_list()
                    if existing:
                        raise HTTPException(status_code=402, detail="Time slot is unavailable.")
                    
                    # Create booking
                    booking = Booking(
                        patientId=current_user,
                        doctorId=PydanticObjectId(booking_in.doctorId),
                        appointmentDate=booking_in.appointmentDate,
                        time=booking_in.time,
                        reason=booking_in.reason,
                        status="pending",
                        appointmentType=booking_in.appointmentType,
                        paymentAmount=doctor.sessionPrice,
                        paymentCurrency="ETB"
                    )
                    await booking.insert()
                    await booking.fetch_link(Booking.doctorId)
                    await booking.fetch_link(Booking.patientId)
                    
                    await session.commit_transaction()
                    print('booking', booking)
                    
                    # Broadcast slot update to all connected clients
                    try:
                        available_slots = await BookingService.find_available_time_slots(
                            str(booking.doctorId.id), 
                            booking.appointmentDate
                        )
                        await websocket_manager.broadcast_slot_update(
                            str(booking.doctorId.id), 
                            booking.appointmentDate, 
                            available_slots
                        )
                    except Exception as e:
                        print(f"Failed to broadcast slot update: {e}")

                    await NotificationService.notify(
                        recipient_id=booking.doctorId.id,
                        type="booking_created",
                        title="New appointment request",
                        message=(
                            f"{current_user.fullName} booked an appointment on "
                            f"{booking.appointmentDate} at {booking.time}."
                        ),
                        actor_id=current_user.id,
                        data={
                            "bookingId": str(booking.id),
                            "appointmentDate": str(booking.appointmentDate),
                            "time": booking.time,
                            "appointmentType": booking.appointmentType,
                        },
                    )
                    
                    # Convert to dict and add doctorData
                    booking_dict = booking.model_dump()
                    
                    # Get doctor data and flatten it
                    doctor = await Doctor.find_one(Doctor.userId.id == booking.doctorId.id)
                    if doctor:
                        doctor_data = {
                            "id": str(doctor.id),
                            "speciality": doctor.speciality,
                            "experience": doctor.experience,
                            "educationLevel": doctor.educationLevel,
                            "rating": doctor.rating,
                            "orgID": doctor.orgID,
                            "sessionPrice": doctor.sessionPrice,
                            'workingHours': doctor.workingHours,
                            'created_at': doctor.created_at,
                            'updated_at': doctor.updated_at
                        }
                        booking_dict['doctorData'] = doctor_data
                    
                    return BookingOut.model_validate(booking_dict)
                    
                except Exception as e:
                    # await session.abort_transaction()
                    raise e
                finally:
                    client.close()

    @staticmethod
    async def create_booking(booking_in: BookingCreate, current_user: User) -> dict:
        # Use transaction for better data integrity
        return await BookingService.create_booking_with_transaction(booking_in, current_user)

    @staticmethod
    async def update_booking(id: str, booking_update: BookingUpdate) -> dict:
        booking = await Booking.get(PydanticObjectId(id), fetch_links=True)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        update_data = booking_update.model_dump(exclude_unset=True)
        
        # Prevent status changes for unpaid appointments (except to 'cancelled')
        if "status" in update_data and update_data["status"] != "cancelled":
            if booking.paymentStatus != "paid":
                raise HTTPException(
                    status_code=402, 
                    detail="Payment required. Please complete payment before confirming this appointment."
                )
        
        # Validate appointment date if being updated
        if "appointmentDate" in update_data and update_data["appointmentDate"] < date.today():
            raise HTTPException(status_code=400, detail="Appointment date cannot be in the past.")
        
        # Validate time format if being updated
        if "time" in update_data and not re.match(r"^([01]\d|2[0-3]):([0-5]\d)$", update_data["time"]):
            raise HTTPException(status_code=400, detail="Invalid time format. Use HH:MM.")
        
        # Check working hours if date or time is being updated
        if "appointmentDate" in update_data or "time" in update_data:
            appointment_date = update_data.get("appointmentDate", booking.appointmentDate)
            appointment_time = update_data.get("time", booking.time)
            
            # Get doctor and check working hours
            # Use the correct way to access linked document ID
            doctor = await Doctor.find_one(Doctor.userId.id == booking.doctorId.id)
            if doctor:
                day_name = BookingService._get_day_name(appointment_date)
                if not BookingService._is_within_working_hours(doctor.workingHours, day_name, appointment_time):
                    working_hours = doctor.workingHours.get(day_name, {"start": "08:00", "end": "17:00"})
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Appointment time is outside doctor's working hours for {day_name} ({working_hours['start']} - {working_hours['end']})"
                    )
        
        # Check for conflicts if date or time is being updated
        if "appointmentDate" in update_data or "time" in update_data:
            new_date = update_data.get("appointmentDate", booking.appointmentDate)
            new_time = update_data.get("time", booking.time)
            
            existing = await Booking.find(
                And(
                    Booking.doctorId.id == booking.doctorId.id,
                    Booking.appointmentDate == new_date,
                    Booking.time == new_time,
                    Booking.id != booking.id
                )
            ).to_list()
            if existing:
                raise HTTPException(status_code=402, detail="Time slot is unavailable.")
        
        previous_status = booking.status
        for field, value in update_data.items():
            setattr(booking, field, value)
        
        await booking.save()

        patient_id = booking.patientId.id
        doctor_id = booking.doctorId.id
        booking_data = {
            "bookingId": str(booking.id),
            "appointmentDate": str(booking.appointmentDate),
            "time": booking.time,
            "status": booking.status,
        }

        if update_data.get("status") == "cancelled" and previous_status != "cancelled":
            for recipient in (patient_id, doctor_id):
                await NotificationService.notify(
                    recipient_id=recipient,
                    type="booking_cancelled",
                    title="Appointment cancelled",
                    message=(
                        f"Appointment on {booking.appointmentDate} at {booking.time} was cancelled."
                    ),
                    data=booking_data,
                )
        else:
            # Notify the other party about schedule/details changes
            await NotificationService.notify(
                recipient_id=doctor_id,
                type="booking_updated",
                title="Appointment updated",
                message=(
                    f"An appointment was updated to {booking.appointmentDate} at {booking.time}."
                ),
                data=booking_data,
            )
            await NotificationService.notify(
                recipient_id=patient_id,
                type="booking_updated",
                title="Appointment updated",
                message=(
                    f"Your appointment was updated to {booking.appointmentDate} at {booking.time}."
                ),
                data=booking_data,
            )

         # Convert to dict and add doctorData
        booking_dict = booking.model_dump()
        
        # Get doctor data and flatten it
        doctor = await Doctor.find_one(Doctor.userId.id == booking.doctorId.id)
        if doctor:
            doctor_data = {
                "id": str(doctor.id),
                "speciality": doctor.speciality,
                "experience": doctor.experience,
                "educationLevel": doctor.educationLevel,
                "rating": doctor.rating,
                "orgID": doctor.orgID,
                'workingHours': doctor.workingHours,
                'created_at': doctor.created_at,
                'updated_at': doctor.updated_at
            }
            booking_dict['doctorData'] = doctor_data
        
        return BookingOut.model_validate(booking_dict)

    @staticmethod
    async def mark_booking_finished(id: str, current_user: User) -> dict:
        booking = await Booking.get(PydanticObjectId(id), fetch_links=True)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        print('booking to be marked', booking)
        
        # Fetch the doctor link to get the actual doctor data
        await booking.fetch_link(Booking.doctorId)
        
        # Check if current user is the doctor for this booking
        if booking.doctorId.id != current_user.id:
            print('current_user', current_user)
            print('booking.doctorId.id', booking.doctorId.id)
            raise HTTPException(status_code=403, detail="Only the assigned doctor can mark booking as finished")
        
        # Update status to finished
        booking.status = "finished"
        await booking.save()

        await booking.fetch_link(Booking.patientId)
        await NotificationService.notify(
            recipient_id=booking.patientId.id,
            type="booking_finished",
            title="Appointment completed",
            message=(
                f"Your appointment on {booking.appointmentDate} at {booking.time} was marked finished."
            ),
            actor_id=current_user.id,
            data={"bookingId": str(booking.id)},
        )
        
        # Fetch patient data for response
        await booking.fetch_link(Booking.patientId)
        
        # Convert to dict and add doctorData
        booking_dict = booking.model_dump()
        
        # Convert id to string
        
        # Get doctor data and flatten it
        doctor = await Doctor.find_one(Doctor.userId.id == booking.doctorId.id)
        if doctor:
            doctor_data = {
                    'id': str(doctor.id),
                    'rating': doctor.rating,
                    'orgID': doctor.orgID,
                    'speciality': doctor.speciality,
                    'experience': doctor.experience,
                    'educationLevel': doctor.educationLevel,
                    'workingHours': doctor.workingHours,
                    'created_at': doctor.created_at,
                    'updated_at': doctor.updated_at
                }
            booking_dict['doctorData'] = doctor_data
        
        return BookingOut.model_validate(booking_dict)

    @staticmethod
    async def delete_booking(id: str) -> None:
        booking = await Booking.get(PydanticObjectId(id), fetch_links=True)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Store IDs before deleting
        doctor_id = str(booking.doctorId.id)
        patient_id = str(booking.patientId.id)
        appointment_date = booking.appointmentDate
        booking_id = str(booking.id)
        booking_time = booking.time
        
        await booking.delete()

        await NotificationService.notify(
            recipient_id=doctor_id,
            type="booking_cancelled",
            title="Appointment removed",
            message=f"An appointment on {appointment_date} at {booking_time} was removed.",
            data={"bookingId": booking_id, "appointmentDate": str(appointment_date), "time": booking_time},
        )
        await NotificationService.notify(
            recipient_id=patient_id,
            type="booking_cancelled",
            title="Appointment removed",
            message=f"Your appointment on {appointment_date} at {booking_time} was removed.",
            data={"bookingId": booking_id, "appointmentDate": str(appointment_date), "time": booking_time},
        )
        
        # Broadcast slot update to all connected clients
        try:
            available_slots = await BookingService.find_available_time_slots(
                doctor_id, 
                appointment_date
            )
            await websocket_manager.broadcast_slot_update(
                doctor_id, 
                appointment_date, 
                available_slots
            )
        except Exception as e:
            print(f"Failed to broadcast slot update after deletion: {e}")

    @staticmethod
    async def doctor_summary(doctorId: str) -> List[int]:
        bookings = await Booking.find(Booking.doctorId.id == PydanticObjectId(doctorId)).to_list()
        data = [0] * 12
        for booking in bookings:
            month = booking.appointmentDate.month - 1
            data[month] += 1
        return data

    @staticmethod
    async def patient_summary(patientId: str) -> List[int]:
        bookings = await Booking.find(Booking.patientId.id == PydanticObjectId(patientId)).to_list()
        data = [0] * 12
        for booking in bookings:
            month = booking.appointmentDate.month - 1
            data[month] += 1
        return data 
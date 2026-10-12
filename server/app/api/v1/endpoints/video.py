from fastapi import APIRouter, Depends, HTTPException, status
from app.core.security import get_current_user
from app.db.models.user import User
from app.db.models.booking import Booking
from app.services.stream_video_service import StreamVideoService
from app.schemas.booking import BookingOut
from app.core.config import get_settings
from beanie import PydanticObjectId
from datetime import datetime
from typing import Dict, Any

router = APIRouter()
settings = get_settings()

@router.post("/generate-token")
async def generate_video_token(current_user: User = Depends(get_current_user)) -> Dict[str, Any]:
    """Generate a Stream Video token for the authenticated user"""
    try:
        token = StreamVideoService.generate_user_token(
            user_id=str(current_user.id),
            user_name=current_user.fullName,
            user_role=current_user.role
        )
        
        return {
            "token": token,
            "api_key": settings.STREAM_API_KEY,
            "user_id": str(current_user.id),
            "user_name": current_user.fullName
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate video token: {str(e)}"
        )

@router.post("/join-call/{booking_id}")
async def join_video_call(
    booking_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Join a video call for a specific booking"""
    try:
        # Get the booking with links fetched
        booking = await Booking.get(PydanticObjectId(booking_id), fetch_links=True)
        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Check if user has permission to join this call
        if not StreamVideoService.validate_call_permission(current_user.id, booking):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to join this call"
            )
        
        # Check if it's a virtual appointment
        if booking.appointmentType != "virtual":
            raise HTTPException(
                status_code=400,
                detail="This appointment is not a virtual appointment"
            )
        
        # Check if it's time for the call
        # Temporarily disabled for testing
        # if not StreamVideoService.is_call_time(
        #     str(booking.appointmentDate),
        #     booking.time
        # ):
        #     raise HTTPException(
        #         status_code=400,
        #         detail="It's not time for this video call yet"
        #     )
        
        # Generate or get existing call ID
        if not booking.streamCallId:
            call_id = StreamVideoService.generate_call_id(
                str(booking.id),
                str(booking.patientId.id),  # Now properly accessible with fetch_links=True
                str(booking.doctorId.id)    # Now properly accessible with fetch_links=True
            )
            booking.streamCallId = call_id
            await booking.save()
        
        # Generate user token
        token = StreamVideoService.generate_user_token(
            user_id=str(current_user.id),
            user_name=current_user.fullName,
            user_role=current_user.role
        )
        
        # Record call start time if this is the first person joining
        if not booking.callStartedAt:
            booking.callStartedAt = datetime.now()
            await booking.save()
            from app.services.notification_service import NotificationService
            other_party = (
                booking.doctorId.id
                if str(current_user.id) == str(booking.patientId.id)
                else booking.patientId.id
            )
            await NotificationService.notify(
                recipient_id=other_party,
                type="call_started",
                title="Video call started",
                message=f"{current_user.fullName} joined the video call.",
                actor_id=current_user.id,
                data={
                    "bookingId": str(booking.id),
                    "streamCallId": booking.streamCallId,
                },
            )
        
        return {
            "call_id": booking.streamCallId,
            "token": token,
            "api_key": settings.STREAM_API_KEY,
            "user_id": str(current_user.id),
            "user_name": current_user.fullName,
            "booking": {
                "id": str(booking.id),
                "appointmentDate": booking.appointmentDate,
                "time": booking.time,
                "reason": booking.reason,
                "status": booking.status
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to join video call: {str(e)}"
        )

@router.post("/end-call/{booking_id}")
async def end_video_call(
    booking_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """End a video call and update booking status"""
    try:
        # Get the booking with links fetched
        booking = await Booking.get(PydanticObjectId(booking_id), fetch_links=True)
        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Check if user has permission to end this call
        if not StreamVideoService.validate_call_permission(str(current_user.id), booking.model_dump()):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to end this call"
            )
        
        # Check if call is active
        if not booking.callStartedAt:
            raise HTTPException(
                status_code=400,
                detail="No active call to end"
            )
        
        # Calculate call duration
        if booking.callStartedAt:
            end_time = datetime.now()
            duration = int((end_time - booking.callStartedAt).total_seconds() / 60)
            booking.callEndedAt = end_time
            booking.callDuration = duration
            booking.status = "finished"
            await booking.save()
            from app.services.notification_service import NotificationService
            other_party = (
                booking.doctorId.id
                if str(current_user.id) == str(booking.patientId.id)
                else booking.patientId.id
            )
            await NotificationService.notify(
                recipient_id=other_party,
                type="call_ended",
                title="Video call ended",
                message=f"The video call ended ({booking.callDuration or 0} min).",
                actor_id=current_user.id,
                data={
                    "bookingId": str(booking.id),
                    "callDuration": booking.callDuration,
                },
            )
        
        return {
            "message": "Call ended successfully",
            "call_duration_minutes": booking.callDuration,
            "booking_status": booking.status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to end video call: {str(e)}"
        )

@router.get("/call-status/{booking_id}")
async def get_call_status(
    booking_id: str,
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    """Get the current status of a video call"""
    try:
        # Get the booking with links fetched
        booking = await Booking.get(PydanticObjectId(booking_id), fetch_links=True)
        if not booking:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )
        
        # Check if user has permission to view this call
        if not StreamVideoService.validate_call_permission(str(current_user.id), booking.model_dump()):
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to view this call"
            )
        
        return {
            "booking_id": str(booking.id),
            "appointment_type": booking.appointmentType,
            "call_id": booking.streamCallId,
            "call_started": booking.callStartedAt,
            "call_ended": booking.callEndedAt,
            "call_duration_minutes": booking.callDuration,
            "status": booking.status,
            "can_join": (
                booking.appointmentType == "virtual" and
                not booking.callEndedAt
                # Temporarily disabled for testing
                # and StreamVideoService.is_call_time(
                #     str(booking.appointmentDate),
                #     booking.time
                # )
            )
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get call status: {str(e)}"
        ) 
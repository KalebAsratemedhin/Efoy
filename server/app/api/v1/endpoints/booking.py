from fastapi import APIRouter, Depends, HTTPException, status, Query, WebSocket, WebSocketDisconnect
from typing import List, Optional
from app.schemas.booking import BookingCreate, BookingUpdate, BookingOut, BookingPaginatedResponse
from app.db.models.user import User
from app.core.security import get_current_user
from app.core.websocket_manager import websocket_manager
from datetime import date
from app.services.booking_service import BookingService
import json

router = APIRouter()

@router.websocket("/ws/slots/{doctor_id}/{appointment_date}")
async def websocket_slots(websocket: WebSocket, doctor_id: str, appointment_date: str):
    """WebSocket endpoint for real-time slot availability updates - No authentication required"""
    try:
        # Parse the appointment date
        parsed_date = date.fromisoformat(appointment_date)
        
        # Connect the client (no authentication needed for public slot info)
        await websocket_manager.connect(websocket, doctor_id, parsed_date)
        
        # Send initial slot availability
        available_slots = await BookingService.find_available_time_slots(doctor_id, parsed_date)
        await websocket.send_text(json.dumps({
            "type": "initial_slots",
            "doctor_id": doctor_id,
            "appointment_date": appointment_date,
            "available_slots": available_slots
        }))
        
        # Keep connection alive and handle disconnection
        try:
            while True:
                # Wait for any message (ping/pong or disconnect)
                data = await websocket.receive_text()
                # You can add ping/pong logic here if needed
        except WebSocketDisconnect:
            websocket_manager.disconnect(websocket, doctor_id, parsed_date)
            
    except ValueError:
        await websocket.close(code=4000, reason="Invalid date format")
    except Exception as e:
        await websocket.close(code=4001, reason=f"Error: {str(e)}")

@router.get('/', response_model=BookingPaginatedResponse)
async def find_all_user_bookings(
    current_user: User = Depends(get_current_user),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    appointment_type: Optional[str] = None,
    payment_status: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    speciality: Optional[str] = None,
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    sort: str = Query("date_desc"),
    doctor_id: Optional[str] = None,
    patient_id: Optional[str] = None,
    exclude_id: Optional[str] = None,
):
    return await BookingService.find_all_user_bookings(
        current_user=current_user,
        page=page,
        limit=limit,
        search=search,
        status=status,
        appointment_type=appointment_type,
        payment_status=payment_status,
        date_from=date_from,
        date_to=date_to,
        speciality=speciality,
        min_rating=min_rating,
        sort=sort,
        doctor_id=doctor_id,
        patient_id=patient_id,
        exclude_id=exclude_id,
    )

@router.get('/recent', response_model=BookingOut)
async def find_recent_booking(current_user: User = Depends(get_current_user)):
    return await BookingService.find_recent_booking(current_user)

@router.get('/doctor/{doctorId}', response_model=List[int])
async def doctor_summary(doctorId: str, current_user: User = Depends(get_current_user)):
    return await BookingService.doctor_summary(doctorId)

@router.get('/patient/{patientId}', response_model=List[int])
async def patient_summary(patientId: str, current_user: User = Depends(get_current_user)):
    return await BookingService.patient_summary(patientId) 


@router.put('/{id}/finish', response_model=BookingOut)
async def mark_booking_finished(id: str, current_user: User = Depends(get_current_user)):
    print(f"Endpoint hit: mark_booking_finished with id: {id}")
    return await BookingService.mark_booking_finished(id, current_user)

@router.get('/{id}', response_model=BookingOut)
async def find_one_booking(id: str, current_user: User = Depends(get_current_user)):
    return await BookingService.find_one_booking(id)

@router.post('/', response_model=BookingOut, status_code=status.HTTP_201_CREATED)
async def create_booking(booking_in: BookingCreate, current_user: User = Depends(get_current_user)):
    return await BookingService.create_booking(booking_in, current_user)

@router.put('/{id}', response_model=BookingOut)
async def update_booking(id: str, booking_update: BookingUpdate, current_user: User = Depends(get_current_user)):
    return await BookingService.update_booking(id, booking_update)

@router.delete('/{id}', status_code=status.HTTP_204_NO_CONTENT)
async def delete_booking(id: str, current_user: User = Depends(get_current_user)):
    await BookingService.delete_booking(id)
    return

from app.db.models.booking import Booking
from app.db.models.user import User
from app.db.models.doctor import Doctor
from beanie import PydanticObjectId
from datetime import date, datetime
from fastapi import HTTPException
from typing import List, Dict
from beanie.operators import And, Or
from app.core.config import get_settings

settings = get_settings()

class DashboardService:
    UPCOMING_STATUSES = ["pending", "confirmed", "approved"]

    @staticmethod
    async def get_doctor_dashboard(doctor_id: str) -> dict:
        """Get all dashboard data for a doctor in one call"""
        
        # Get all required data in parallel
        total_appointments = await Booking.find(Booking.doctorId.id == PydanticObjectId(doctor_id)).count()
        pending_appointments = await Booking.find(
            And(
                Booking.doctorId.id == PydanticObjectId(doctor_id),
                Booking.status == "pending"
            )
        ).count()
        
        today_appointments = await Booking.find(
            And(
                Booking.doctorId.id == PydanticObjectId(doctor_id),
                Booking.appointmentDate == date.today()
            )
        ).count()
        
        # Get single next upcoming appointment
        upcoming_appointment = await Booking.find(
            And(
                Booking.doctorId.id == PydanticObjectId(doctor_id),
                Booking.appointmentDate >= date.today(),
                Or(*[Booking.status == s for s in DashboardService.UPCOMING_STATUSES])
            ), fetch_links=True
        ).sort([("appointmentDate", 1), ("time", 1)]).first_or_none()
        
        # Get monthly stats
        current_month = datetime.now().month
        monthly_appointments = await Booking.find(
            And(
                Booking.doctorId.id == PydanticObjectId(doctor_id),
                Booking.appointmentDate.month == current_month
            )
        ).count()
        
        # Calculate completion rate
        completion_rate = 0
        if total_appointments > 0:
            completion_rate = ((total_appointments - pending_appointments) / total_appointments) * 100
        
        # Get monthly chart data (last 12 months)
        monthly_chart_data = await DashboardService._get_monthly_chart_data(doctor_id, "doctor")
        
        return {
            "stats": {
                "total_appointments": total_appointments,
                "pending_appointments": pending_appointments,
                "today_appointments": today_appointments,
                "monthly_appointments": monthly_appointments,
                "completion_rate": round(completion_rate, 1)
            },
            "upcoming_appointment": upcoming_appointment,
            "monthly_chart_data": monthly_chart_data
        }

    @staticmethod
    async def get_patient_dashboard(patient_id: str) -> dict:
        """Get all dashboard data for a patient in one call"""
        
        # Get all required data in parallel
        total_bookings = await Booking.find(Booking.patientId.id == PydanticObjectId(patient_id)).count()
        upcoming_bookings = await Booking.find(
            And(
                Booking.patientId.id == PydanticObjectId(patient_id),
                Booking.appointmentDate >= date.today(),
                Or(*[Booking.status == s for s in DashboardService.UPCOMING_STATUSES]),
            )
        ).count()
        
        completed_bookings = await Booking.find(
            And(
                Booking.patientId.id == PydanticObjectId(patient_id),
                Booking.status == "finished"
            )
        ).count()
        
        cancelled_bookings = await Booking.find(
            And(
                Booking.patientId.id == PydanticObjectId(patient_id),
                Booking.status == "rejected"
            )
        ).count()
        
        # Get single next upcoming booking
        upcoming_booking = await Booking.find(
            And(
                Booking.patientId.id == PydanticObjectId(patient_id),
                Booking.appointmentDate >= date.today(),
                Or(*[Booking.status == s for s in DashboardService.UPCOMING_STATUSES])

            ), fetch_links=True
        ).sort([("appointmentDate", 1), ("time", 1)]).first_or_none()
        
        # Get monthly chart data (last 12 months)
        monthly_chart_data = await DashboardService._get_monthly_chart_data(patient_id, "patient")
        
        return {
            "stats": {
                "total_bookings": total_bookings,
                "upcoming_bookings": upcoming_bookings,
                "completed_bookings": completed_bookings,
                "cancelled_bookings": cancelled_bookings
            },
            "upcoming_booking": upcoming_booking,
            "monthly_chart_data": monthly_chart_data
        }

    @staticmethod
    async def _get_monthly_chart_data(user_id: str, user_type: str = "doctor") -> dict:
        """Get monthly appointment/booking data for the last 12 months"""
        from datetime import timedelta
        
        labels = []
        data = []
        
        for i in range(12):
            target_date = datetime.now() - timedelta(days=30*i)
            month_start = target_date.replace(day=1)
            month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            
            # Build query based on user type
            if user_type == "doctor":
                query = And(
                    Booking.doctorId.id == PydanticObjectId(user_id),
                    Booking.appointmentDate >= month_start.date(),
                    Booking.appointmentDate <= month_end.date()
                )
            else:  # patient
                query = And(
                    Booking.patientId.id == PydanticObjectId(user_id),
                    Booking.appointmentDate >= month_start.date(),
                    Booking.appointmentDate <= month_end.date()
                )
            
            count = await Booking.find(query).count()
            
            labels.insert(0, month_start.strftime("%b %Y"))
            data.insert(0, count)
        
        return {
            "labels": labels,
            "data": data
        } 
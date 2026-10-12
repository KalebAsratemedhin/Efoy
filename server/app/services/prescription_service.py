from app.db.models.prescription import Prescription
from app.db.models.booking import Booking
from app.db.models.user import User
from app.schemas.prescription import PrescriptionCreate, PrescriptionUpdate, PrescriptionOut, PrescriptionPaginatedResponse
from beanie import PydanticObjectId
from beanie.operators import And
from datetime import datetime
from fastapi import HTTPException, status
from typing import List, Optional, Union

class PrescriptionService:
    @staticmethod
    async def create_prescription(prescription_data: PrescriptionCreate, current_user: User) -> PrescriptionOut:
        """Create a new prescription"""
        try:
            # Verify the booking exists and current user is the doctor
            booking = await Booking.get(PydanticObjectId(prescription_data.bookingId), fetch_links=True)
            if not booking:
                raise HTTPException(status_code=404, detail="Booking not found")
            
            if str(booking.doctorId.id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="Only the assigned doctor can create prescriptions")
            
            # Check if prescription already exists for this booking
            existing_prescription = await Prescription.find_one(Prescription.bookingId.id == PydanticObjectId(prescription_data.bookingId))
            if existing_prescription:
                raise HTTPException(status_code=400, detail="Prescription already exists for this booking")
            
            # Create prescription
            prescription = Prescription(
                bookingId=booking, # This is correct for Beanie Link
                doctorId=current_user,
                patientId=booking.patientId,
                medications=prescription_data.medications,
                diagnosis=prescription_data.diagnosis,
                notes=prescription_data.notes,
                expiryDate=prescription_data.expiryDate,
                digitalSignature=prescription_data.digitalSignature
            )
            
            await prescription.insert()

            from app.services.notification_service import NotificationService
            await NotificationService.notify(
                recipient_id=booking.patientId.id,
                type="prescription_created",
                title="New prescription",
                message=f"Dr. {current_user.fullName} issued a prescription for your appointment.",
                actor_id=current_user.id,
                data={
                    "prescriptionId": str(prescription.id),
                    "bookingId": str(booking.id),
                },
            )
            
            # Convert to response format
            prescription_dict = prescription.model_dump()
            prescription_dict['id'] = str(prescription.id)
            prescription_dict['bookingId'] = str(booking.id)  # Extract ID from Link field
            prescription_dict['doctorId'] = {
                'id': str(current_user.id),
                'fullName': current_user.fullName,
                'email': current_user.email,
                'role': current_user.role
            }
            prescription_dict['patientId'] = {
                'id': str(booking.patientId.id),
                'fullName': booking.patientId.fullName,
                'email': booking.patientId.email,
                'role': booking.patientId.role
            }
            
            return PrescriptionOut.model_validate(prescription_dict)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to create prescription: {str(e)}"
            )
    
    @staticmethod
    def _parse_object_id(value: str, field_name: str) -> PydanticObjectId:
        try:
            return PydanticObjectId(value)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid {field_name}")

    @staticmethod
    async def find_patient_prescriptions(
        current_user: User,
        page: int = 1,
        limit: int = 10,
        doctor_id: Optional[str] = None,
    ) -> PrescriptionPaginatedResponse:
        """Get prescriptions for the current patient user"""
        try:
            skip = (page - 1) * limit
            conditions = [Prescription.patientId.id == current_user.id]
            if doctor_id is not None:
                conditions.append(
                    Prescription.doctorId.id
                    == PrescriptionService._parse_object_id(doctor_id, "doctor_id")
                )
            find_filter = And(*conditions) if len(conditions) > 1 else conditions[0]

            prescriptions = await Prescription.find(find_filter).skip(skip).limit(limit).to_list()
            total_prescriptions = await Prescription.find(find_filter).count()
            
            # Fetch linked data
            prescriptions_with_links = []
            for prescription in prescriptions:
                await prescription.fetch_link(Prescription.doctorId)
                await prescription.fetch_link(Prescription.patientId)
                await prescription.fetch_link(Prescription.bookingId)


                prescription_dict = prescription.model_dump()
                prescription_dict['id'] = str(prescription.id)
                prescription_dict['bookingId'] = str(prescription.bookingId.id)  # Extract ID from Link field
                prescription_dict['doctorId'] = {
                    'id': str(prescription.doctorId.id),
                    'fullName': prescription.doctorId.fullName,
                    'email': prescription.doctorId.email,
                    'role': prescription.doctorId.role
                }
                prescription_dict['patientId'] = {
                    'id': str(current_user.id),
                    'fullName': current_user.fullName,
                    'email': current_user.email,
                    'role': current_user.role
                }
                prescriptions_with_links.append(PrescriptionOut.model_validate(prescription_dict))

            total_pages = (total_prescriptions + limit - 1) // limit if total_prescriptions else 0
            return PrescriptionPaginatedResponse(
                items=prescriptions_with_links,
                total=total_prescriptions,
                page=page,
                limit=limit,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_prev=page > 1
            )
            
        except HTTPException:
            raise
        except Exception as e:
            print('getting patient prescriptions', e)
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch prescriptions: {str(e)}"
            )
    
    @staticmethod
    async def find_doctor_prescriptions(
        current_user: User,
        page: int = 1,
        limit: int = 10,
        patient_id: Optional[str] = None,
    ) -> PrescriptionPaginatedResponse:
        """Get prescriptions created by the current doctor user"""
        try:
            skip = (page - 1) * limit
            conditions = [Prescription.doctorId.id == current_user.id]
            if patient_id is not None:
                conditions.append(
                    Prescription.patientId.id
                    == PrescriptionService._parse_object_id(patient_id, "patient_id")
                )
            find_filter = And(*conditions) if len(conditions) > 1 else conditions[0]

            prescriptions = await Prescription.find(find_filter).skip(skip).limit(limit).to_list()
            total_prescriptions = await Prescription.find(find_filter).count()
            
            # Fetch linked data
            prescriptions_with_links = []
            for prescription in prescriptions:
                await prescription.fetch_link(Prescription.doctorId)
                await prescription.fetch_link(Prescription.patientId)
                await prescription.fetch_link(Prescription.bookingId)
                
                prescription_dict = prescription.model_dump()
                prescription_dict['id'] = str(prescription.id)
                prescription_dict['bookingId'] = str(prescription.bookingId.id)  # Extract ID from Link field
                prescription_dict['doctorId'] = {
                    'id': str(current_user.id),
                    'fullName': current_user.fullName,
                    'email': current_user.email,
                    'role': current_user.role
                }
                prescription_dict['patientId'] = {
                    'id': str(prescription.patientId.id),
                    'fullName': prescription.patientId.fullName,
                    'email': prescription.patientId.email,
                    'role': prescription.patientId.role
                }
                prescriptions_with_links.append(PrescriptionOut.model_validate(prescription_dict))

            total_pages = (total_prescriptions + limit - 1) // limit if total_prescriptions else 0
            return PrescriptionPaginatedResponse(
                items=prescriptions_with_links,
                total=total_prescriptions,
                page=page,
                limit=limit,
                total_pages=total_pages,
                has_next=page < total_pages,
                has_prev=page > 1
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch prescriptions: {str(e)}"
            )
    
    @staticmethod
    async def find_one_prescription(id: str, current_user: User) -> PrescriptionOut:
        """Get a specific prescription by ID"""
        try:
            prescription = await Prescription.get(PydanticObjectId(id), fetch_links=True)
            if not prescription:
                raise HTTPException(status_code=404, detail="Prescription not found")
            
            # Check if user has access to this prescription
            if (str(prescription.patientId.id) != str(current_user.id) and 
                str(prescription.doctorId.id) != str(current_user.id)):
                raise HTTPException(status_code=403, detail="Access denied")
            
            # Convert to response format
            prescription_dict = prescription.model_dump()
            prescription_dict['id'] = str(prescription.id)
            prescription_dict['bookingId'] = str(prescription.bookingId.id)  # Extract ID from Link field
            prescription_dict['doctorId'] = {
                'id': str(prescription.doctorId.id),
                'fullName': prescription.doctorId.fullName,
                'email': prescription.doctorId.email,
                'role': prescription.doctorId.role
            }
            prescription_dict['patientId'] = {
                'id': str(prescription.patientId.id),
                'fullName': prescription.patientId.fullName,
                'email': prescription.patientId.email,
                'role': prescription.patientId.role
            }
            
            return PrescriptionOut.model_validate(prescription_dict)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to fetch prescription: {str(e)}"
            )
    
    @staticmethod
    async def update_prescription(id: str, prescription_update: PrescriptionUpdate, current_user: User) -> PrescriptionOut:
        """Update a prescription (only by the prescribing doctor)"""
        try:
            prescription = await Prescription.get(PydanticObjectId(id))
            if not prescription:
                raise HTTPException(status_code=404, detail="Prescription not found")
            
            # Only the prescribing doctor can update
            if str(prescription.doctorId.id) != str(current_user.id):
                raise HTTPException(status_code=403, detail="Only the prescribing doctor can update this prescription")
            
            # Update fields
            update_data = prescription_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(prescription, field, value)
            
            await prescription.save()
            
            # Convert to response format
            prescription_dict = prescription.model_dump()
            prescription_dict['id'] = str(prescription.id)
            prescription_dict['bookingId'] = str(prescription.bookingId.id)  # Extract ID from Link field
            prescription_dict['doctorId'] = {
                'id': str(current_user.id),
                'fullName': current_user.fullName,
                'email': current_user.email,
                'role': current_user.role
            }
            prescription_dict['patientId'] = {
                'id': str(prescription.patientId.id),
                'fullName': prescription.patientId.fullName,
                'email': prescription.patientId.email,
                'role': prescription.patientId.role
            }
            
            return PrescriptionOut.model_validate(prescription_dict)
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to update prescription: {str(e)}"
            ) 
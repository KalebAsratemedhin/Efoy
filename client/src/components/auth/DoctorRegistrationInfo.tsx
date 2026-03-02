import { FieldErrors, UseFormRegister } from 'react-hook-form'

interface FormData{
    password: string;
    fullName: string;
    email: string;
    role: string;
    phoneNumber: string;
    speciality?: string;
    orgID?: string;
    experience?: string;
    educationLevel?: string;
}

const DoctorRegistrationInfo = ({register, errors}: {register: UseFormRegister<FormData>, errors: FieldErrors<FormData>}) => {
  return (
    <div>
        <div className="w-full my-4">
            <label className="text-gray-500" htmlFor="speciality">Speciality</label>
                <input className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12" id="speciality" type="text" {...register('speciality', {
                    required: "Speciality is required"
                })} />
            
            <p className="text-red-500 text-base mt-1">{errors.speciality?.message}</p>
        </div>
        <div className="w-full my-4">
            <label className="text-gray-500" htmlFor="orgID">Organization ID</label>
                <input className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12" id="orgID" type="text" {...register('orgID', {
                    required: "OrgID is required",
                    validate: (value) => {
                    if(!value)
                        return false

                    if(value.length < 6)
                        return "OrgId should not be shorter than six characters."

                    return /[a-zA-Z]{2,}/.test(value) || 'OrgID must contain at least two letters'
                    

                    }
                })} />
            
            <p className="text-red-500 text-base mt-1">{errors.orgID?.message}</p>
        </div>
        <div className="w-full my-4">
            <label className="text-gray-500" htmlFor="experience"> Experience </label>
                <input className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12" id="experience" type="text" {...register('experience', {
                    required: "Experience is required",
                    
                })} />
            
            <p className="text-red-500 text-base mt-1">{errors.experience?.message}</p>
        </div>
        <div className="w-full my-4">
            <label className="text-gray-500" htmlFor="educationLevel"> EducationLevel </label>
                <input className="w-full block border rounded-xl px-2 focus:outline-none focus:ring-purple-400 focus:ring-2 border-gray-300 h-12" id="educationLevel" type="text" {...register('educationLevel', {
                    required: "EducationLevel is required",
                    
                })} />
            
            <p className="text-red-500 text-base mt-1">{errors.educationLevel?.message}</p>
        </div>
        <button type='submit' className="w-full  bg-purple-700 text-lg font-semibold hover:shadow-md text-white py-2 rounded-full">Submit</button> 
    
    </div>
  )
}

export default DoctorRegistrationInfo
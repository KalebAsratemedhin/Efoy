import { useSearchParams } from "react-router-dom"
import DoctorsList from "../components/doctors/DoctorsList"
import DoctorsSearch from "../components/doctors/DoctorsSearch"

const Doctors = () => {
  const [searchParams] = useSearchParams()
  const searchTerm = searchParams.get('search')

  return (
    <div className="max-w-7xl mx-auto">
      {searchTerm ? (
        <DoctorsSearch searchTerm={searchTerm} />
      ) : (
        <DoctorsList />
      )}
    </div>
  )
}

export default Doctors
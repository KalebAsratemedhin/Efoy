import { useSelector } from "react-redux"
import DoctorDashboard from "../components/dashboard/DoctorDashboard"
import { RootState } from '../redux/store'
import NotFound from "../components/utils/NotFound"
import PatientDashboard from "../components/dashboard/PatientDashboard"
import Error from "../components/utils/Error"
import AdminDashboard from "../components/dashboard/AdminDashboard"

const DashboardPage = () => {
  const authState = useSelector((state: RootState) => state.auth)
  let dashboard;

  switch (authState.role){
    case "patient":
      dashboard = <PatientDashboard /> 
      break
    case "doctor":
      dashboard = <DoctorDashboard /> 
      break

    case "admin":
      dashboard = <AdminDashboard /> 
      break

    default:
      dashboard = <Error error={"Not accessible."} /> 


  }

  
  if(!authState.id)
    return <NotFound />

  return (
    <div className="w-full h-full">
       
        {dashboard }
       
    </div>
  )
}

export default DashboardPage
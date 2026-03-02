import { useParams } from "react-router-dom"
import BookingList from "../components/appointments/BookingList"
import BookingDetails from "../components/appointments/BookingDetails"

const Appointments = () => {
  const {id} = useParams()
  return (
    <div>
      {id ? 
      <BookingDetails />
      :
      <BookingList />

    }
    </div>
  )
}

export default Appointments
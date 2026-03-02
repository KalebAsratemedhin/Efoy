import { useDispatch, useSelector } from "react-redux"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { authSelector, getAuth } from "./redux/slices/authSlice"
import { useEffect } from "react"

import Layout from "./components/Layout/Layout"
import Home from "./pages/Home"
import SignupPage from "./pages/Signup"
import SigninPage from "./pages/Signin"
import DashboardPage from "./pages/Dashboard"
import NotFound from "./components/utils/NotFound"
import Settings from "./pages/Settings"
import Doctors from "./pages/Doctors"
import Book from "./pages/Book"
import Appointments from "./pages/Appointments"
import DoctorDetails from "./components/doctors/DoctorDetails"
import ContactPage from "./pages/Contact"
import AboutPage from "./pages/About"
import GoogleAuth from "./pages/GoogleAuth"
import AuthSetup from "./components/auth/AuthSetup"
import CalendarPage from "./pages/Calendar"
import AdminCreateDoctor from "./components/dashboard/AdminCreateDoctor";
import VerifyEmail from "./pages/VerifyEmail";
import VideoCallPage from "./components/appointments/VideoCallPage";
import PrescriptionList from "./components/appointments/PrescriptionList";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";

const AppRoutes = () => {
    const dispatch = useDispatch()
    const authState = useSelector(authSelector)
  
    useEffect(() => {
      if(!authState.id)
        dispatch(getAuth())  
  
    }, [getAuth, authState])


 
    
    return (
      <>
      <Router>
          <Routes>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signin" element={<SigninPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/google-auth" element={<GoogleAuth />} />

                <Route element={<AuthSetup />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/doctors" element={<Doctors />} />
                    <Route path="/doctors/:id" element={<DoctorDetails />} />

                    <Route path="/book/:id" element={<Book />} />
                    <Route path="/appointments" element={<Appointments />} />
                    <Route path="/appointments/:id" element={<Appointments />} />
                    <Route path="/calendar" element={<CalendarPage />} />
                    <Route path="/admin/doctors/create" element={<AdminCreateDoctor />} />
                    <Route path="/prescriptions" element={<PrescriptionList />} />
                    <Route path="/payment/:bookingId" element={<Payment />} />
                    <Route path="/payment/success" element={<PaymentSuccess />} />
                    <Route path="/payment/cancel" element={<Payment />} />
                </Route>




            </Route>

            {/* Video call route - accessible directly */}
            <Route path="/video-call/:bookingId" element={<VideoCallPage />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          
        </Router>
      </>
    )
  }

  export default AppRoutes;
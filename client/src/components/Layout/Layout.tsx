import { Outlet, useLocation } from "react-router-dom"
import Footer from "./Footer"
import Header from "./Header"
import Sidebar from "./Sidebar"
import { useState } from "react"
import { useSelector } from "react-redux"
import { authSelector } from "../../redux/slices/authSlice"

const Layout = () => {
  const { pathname } = useLocation()
  const authState = useSelector(authSelector)
  const [isOpen, setIsOpen] = useState(true)

  const handleSidebarToggle = () => {
    setIsOpen(!isOpen)
  }

  const isAppLayout = pathname !== "/" && authState.id;

  return (
    <div className="h-screen flex">
      {isAppLayout && isOpen && (
        <div className="h-screen">
          <Sidebar isOpen={isOpen} onSidebarToggle={handleSidebarToggle} />
        </div>
      )}

      <div className="flex flex-col flex-grow overflow-auto">
        <Header onSidebarToggle={handleSidebarToggle} />
        <div
          className={`flex-grow ${isAppLayout ? "bg-slate-50 p-6" : ""}`}
        >
          <Outlet />
        </div>
        {!isAppLayout && <Footer />}
      </div>
    </div>
  )
}

export default Layout

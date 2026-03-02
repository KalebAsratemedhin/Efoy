import { Link, useLocation, useNavigate } from "react-router-dom"
import { TfiSearch } from "react-icons/tfi";
import { FaKeyboard } from "react-icons/fa";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import { CgMenuLeftAlt } from "react-icons/cg";
import AuthHeaderInfo from "./AuthHeaderInfo";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const appPageTitles: { path: string; title: string }[] = [
  { path: "/dashboard", title: "Dashboard" },
  { path: "/settings", title: "Settings" },
  { path: "/doctors", title: "Doctors" },
  { path: "/appointments", title: "Appointments" },
  { path: "/calendar", title: "Calendar" },
  { path: "/prescriptions", title: "Prescriptions" },
  { path: "/admin/doctors/create", title: "Create Doctor" },
  { path: "/payment/success", title: "Payment Success" },
];
function getAppPageTitle(pathname: string): string | null {
  if (pathname.startsWith("/payment/")) return "Payment";
  if (pathname.startsWith("/book/")) return "Book Appointment";
  if (pathname.startsWith("/doctors/")) return "Doctor";
  if (pathname.startsWith("/appointments/")) return "Appointment";
  const exact = appPageTitles.find(({ path }) => pathname === path);
  return exact ? exact.title : null;
}

const Header = ({onSidebarToggle}: {onSidebarToggle: () => void}) => {
  const {pathname} = useLocation()
  const authState = useSelector(authSelector)  
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isAppLayout = pathname !== "/" && !!authState.id;
  const pageTitle = isAppLayout ? getAppPageTitle(pathname) : null;
  
  const handleSearch = () => {
    if (searchTerm.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }



  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    } else if (e.key === 'Escape') {
      setSearchTerm('')
      searchInputRef.current?.blur()
    }
  }

  // Keyboard shortcut for search (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <nav className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <CgMenuLeftAlt
              onClick={onSidebarToggle}
              className="w-6 h-6 sm:hidden mr-4 text-ink hover:text-accent transition-colors cursor-pointer"
            />
            {pageTitle ? (
              <h1 className="text-xl font-bold font-display text-ink truncate max-w-[200px] sm:max-w-none">
                {pageTitle}
              </h1>
            ) : (
              <Link to="/" className="flex-shrink-0">
                <h1 className="text-2xl font-bold font-display text-ink hover:text-accent transition-colors">
                  Efoy
                </h1>
              </Link>
            )}
          </div>

          {pathname === "/" && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <Link
                  to="/"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-accent transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/doctors"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-accent transition-colors"
                >
                  Doctors
                </Link>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-4 justify-around w-full">
            {/* Enhanced Search Bar */}
            <div className="hidden md:flex relative max-w-md w-full">
              <motion.div
                className={`relative flex items-center w-full rounded-xl border-2 transition-all duration-300 ${
                  isSearchFocused
                    ? "border-accent/50 bg-white shadow-md"
                    : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Search Icon */}
                <div className="absolute left-4 text-slate-400">
                  <TfiSearch className="text-lg" />
                </div>

                {/* Search Input */}
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-20 py-3 bg-transparent focus:outline-none text-sm font-medium text-ink placeholder-slate-500"
                  placeholder="Search doctors by name or specialty..."
                />



                {/* Search Button */}
                <motion.button
                  onClick={handleSearch}
                  disabled={!searchTerm.trim()}
                  className={`absolute right-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    searchTerm.trim()
                      ? "bg-accent text-white hover:bg-accent-hover shadow-md"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                  whileHover={searchTerm.trim() ? { scale: 1.05 } : {}}
                  whileTap={searchTerm.trim() ? { scale: 0.95 } : {}}
                  title="Search (Enter)"
                >
                  Search
                </motion.button>
              </motion.div>

              {/* Keyboard Shortcut Hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isSearchFocused ? 1 : 0 }}
                className="absolute -bottom-8 left-0 text-xs text-slate-500 flex items-center gap-1"
              >
                <FaKeyboard className="text-xs" />
                <span>Ctrl+K to focus</span>
              </motion.div>
            </div>

            {authState.id ? (
              <AuthHeaderInfo />
            ) : (
              <div className="flex items-center space-x-4 justify-end">
                <Link
                  to="/signin"
                  className="px-4 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-md text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
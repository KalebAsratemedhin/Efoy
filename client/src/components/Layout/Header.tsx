import { Link, useLocation, useNavigate } from "react-router-dom"
import { TfiSearch } from "react-icons/tfi";
import { FaKeyboard, FaHospital } from "react-icons/fa";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";
import { CgMenuLeftAlt } from "react-icons/cg";
import AuthHeaderInfo from "./AuthHeaderInfo";
import NotificationBell from "../notifications/NotificationBell";
import { useState, useRef, useEffect } from "react";

const Header = ({
  onSidebarToggle,
  showBrandLogo = true,
}: {
  onSidebarToggle: () => void
  /** Hide when sidebar already shows the brand (desktop app chrome). */
  showBrandLogo?: boolean
}) => {
  const {pathname} = useLocation()
  const authState = useSelector(authSelector)  
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const isAppLayout = pathname !== "/" && !!authState.id;

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
      <div className={`${isAppLayout ? "px-4 sm:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}`}>
        <div className="flex items-center h-16 gap-3 sm:gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <CgMenuLeftAlt
              onClick={onSidebarToggle}
              className="w-6 h-6 sm:hidden text-ink hover:text-accent transition-colors cursor-pointer shrink-0"
            />
            {showBrandLogo && (
              <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                  <FaHospital className="text-accent text-sm" />
                </div>
                <h1 className="text-xl font-bold font-display text-ink group-hover:text-accent transition-colors">
                  Efoy
                </h1>
              </Link>
            )}
          </div>

          {pathname === "/" && (
            <div className="hidden md:flex items-center gap-6 shrink-0">
              <Link
                to="/"
                className="px-1 py-2 text-sm font-medium text-slate-700 hover:text-accent transition-colors"
              >
                Home
              </Link>
              <Link
                to="/doctors"
                className="px-1 py-2 text-sm font-medium text-slate-700 hover:text-accent transition-colors"
              >
                Doctors
              </Link>
            </div>
          )}

          {/* Search — left-aligned after brand / nav */}
          <div className="hidden md:flex relative flex-1 max-w-md min-w-0">
            <div
              className={`relative flex items-center w-full rounded-xl border transition-all duration-200 ${
                isSearchFocused
                  ? "border-accent/50 bg-white shadow-sm ring-2 ring-accent/20"
                  : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <TfiSearch className="text-base" />
              </div>

              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={handleKeyPress}
                className="w-full pl-10 pr-20 py-2.5 bg-transparent focus:outline-none text-sm font-medium text-ink placeholder-slate-500"
                placeholder="Search doctors…"
              />

              <button
                type="button"
                onClick={handleSearch}
                disabled={!searchTerm.trim()}
                className={`absolute right-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  searchTerm.trim()
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                title="Search (Enter)"
              >
                Search
              </button>
            </div>

            {isSearchFocused && (
              <div className="absolute -bottom-7 left-0 text-xs text-slate-500 flex items-center gap-1">
                <FaKeyboard className="text-xs" />
                <span>Ctrl+K to focus</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            {authState.id ? (
              <>
                <NotificationBell />
                <AuthHeaderInfo />
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/signin"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-accent transition-colors"
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

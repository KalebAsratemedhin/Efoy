import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authSelector, clearAuth } from "../../redux/slices/authSlice";
import { useSignoutMutation } from "../../redux/api/authAPI";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import {
  FaHome,
  FaUserMd,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaHospital,
  FaClipboardList,
  FaArrowLeft,
  FaPills,
} from "react-icons/fa";

interface SidebarProps {
  isOpen: boolean;
  onSidebarToggle: () => void;
}

const Sidebar = ({ isOpen, onSidebarToggle }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authState = useSelector(authSelector);
  const [signout, { isLoading }] = useSignoutMutation();
  const { data: currentUser } = useGetCurrentUserQuery();

  const handleSignout = async () => {
    try {
      await signout().unwrap();
      dispatch(clearAuth());
      navigate('/');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const navigation = authState.role === "admin" 
    ? [
        { name: "Home", href: "/", icon: FaHome },
        { name: "Dashboard", href: "/dashboard", icon: FaUser },
        { name: "Applications", href: "/applications", icon: FaClipboardList },
        { name: "Doctors", href: "/doctors", icon: FaUserMd },
        { name: "Settings", href: "/settings", icon: FaCog },
      ]
    : authState.role === "doctor"
    ? [
        { name: "Home", href: "/", icon: FaHome },
        { name: "Dashboard", href: "/dashboard", icon: FaUser },
        { name: "Appointments", href: "/appointments", icon: FaCalendarAlt },
        { name: "Calendar", href: "/calendar", icon: FaCalendarAlt },
        { name: "Doctors", href: "/doctors", icon: FaUserMd },
        { name: "Prescriptions", href: "/prescriptions", icon: FaPills },
        { name: "Settings", href: "/settings", icon: FaCog },
      ]
    : [
        { name: "Home", href: "/", icon: FaHome },
        { name: "Dashboard", href: "/dashboard", icon: FaUser },
        { name: "Appointments", href: "/appointments", icon: FaCalendarAlt },
        { name: "Calendar", href: "/calendar", icon: FaCalendarAlt },
        { name: "Doctors", href: "/doctors", icon: FaUserMd },
        { name: "Prescriptions", href: "/prescriptions", icon: FaPills },
        { name: "Settings", href: "/settings", icon: FaCog },
      ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={onSidebarToggle}
          aria-hidden="true"
        />
      )}
      <div
        className={`fixed sm:relative h-screen w-[260px] bg-white border-r border-slate-200 shadow-sm z-50 flex flex-col sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo and Brand */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <FaHospital className="text-xl text-accent" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display text-ink">Efoy</h1>
              <p className="text-xs text-slate-500">Hospital</p>
            </div>
          </Link>
          <button
            onClick={onSidebarToggle}
            className="sm:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-ink transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-slate-600 hover:bg-slate-50 hover:text-accent"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-accent" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User & Sign out */}
        <div className="p-4 border-t border-slate-200 shrink-0">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <FaUser className="text-accent w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink truncate">
                {currentUser?.fullName || (authState.role === "admin" ? "Administrator" : "User")}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">{authState.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignout}
            disabled={isLoading}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <FaSignOutAlt className="w-4 h-4 shrink-0" />
            <span>{isLoading ? "Signing out..." : "Sign out"}</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FaUserCircle, FaThLarge, FaCog, FaSignOutAlt } from "react-icons/fa";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { useSignoutMutation } from "../../redux/api/authAPI";
import { clearAuth } from "../../redux/slices/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

const AuthHeaderInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: currentUser } = useGetCurrentUserQuery(undefined, {
    skip: !localStorage.getItem("accessToken"),
  });
  const [signout] = useSignoutMutation();

  const handleSignout = async () => {
    try {
      await signout().unwrap();
      dispatch(clearAuth());
      navigate("/");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink",
            "hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:ring-offset-1",
            "transition-colors"
          )}
        >
          {currentUser?.profilePic ? (
            <img
              src={currentUser.profilePic}
              alt={currentUser.fullName || "User"}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
            />
          ) : (
            <FaUserCircle className="w-7 h-7 text-slate-500" />
          )}
          <span className="hidden sm:inline max-w-[120px] truncate">
            {currentUser?.fullName || "User"}
          </span>
          <svg
            className="w-3.5 h-3.5 text-slate-400 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <FaThLarge className="w-4 h-4 text-slate-500" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <FaCog className="w-4 h-4 text-slate-500" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignout}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FaSignOutAlt className="w-4 h-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AuthHeaderInfo;

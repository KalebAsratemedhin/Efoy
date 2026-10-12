import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "../../redux/api/userAPI";
import { PageLoader } from "../utils/Spinner";
import { useErrorToast } from "../../hooks/useErrorToast";

const AuthSetup = () => {
  const hasToken = Boolean(localStorage.getItem("accessToken"));
  const {
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
  } = useGetCurrentUserQuery(undefined, {
    skip: !hasToken,
  });

  useErrorToast(isUserError, userError, "auth-setup");

  if (!hasToken) {
    return <Navigate to="/signin" replace />;
  }

  if (isUserLoading) return <PageLoader label="Loading…" />;

  if (isUserError) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default AuthSetup;

import LineChart from "./LineChart";
import Spinner from "../utils/Spinner";
import Error from "../utils/Error";
import { useSelector } from "react-redux";
import { authSelector } from "../../redux/slices/authSlice";

interface MonthlyReportProps {
  dashboardData?: any;
  isLoading?: boolean;
  error?: any;
}

const MonthlyReport = ({ dashboardData, isLoading, error }: MonthlyReportProps) => {
  const authState = useSelector(authSelector);

  if (isLoading) return <Spinner size="sm" className="py-8" />;
  if (error) return <Error error={error} />;

  if (dashboardData?.monthly_chart_data) {
    const isPatient = authState.role === "patient";
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <LineChart
          label={isPatient ? "Bookings" : "Patients"}
          data={dashboardData.monthly_chart_data.data}
          title={isPatient ? "Monthly bookings" : "Monthly patients"}
          labels={dashboardData.monthly_chart_data.labels}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-center py-10 text-center">
      <p className="text-ink font-medium">No monthly data yet</p>
      <p className="text-slate-500 text-sm mt-1">Charts will appear as activity builds up.</p>
    </div>
  );
};

export default MonthlyReport;

import LineChart from "./LineChart"
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
  const authState = useSelector(authSelector)

  if (isLoading) return <Spinner />;
  if (error) return <Error error={error} />;

  // For both doctors and patients, use the monthly chart data from dashboard
  if (dashboardData?.monthly_chart_data) {
    const isPatient = authState.role === "patient";
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col">
        <LineChart 
          label={isPatient ? 'Bookings' : 'Patients'} 
          data={dashboardData.monthly_chart_data.data} 
          title={isPatient ? "Monthly Bookings Report" : "Monthly Patients Report"} 
          labels={dashboardData.monthly_chart_data.labels}
        />
      </div>
    )
  } else {
    return (
      <div className="w-full flex-1 min-h-0 flex flex-col justify-center">
        <div className="text-center py-8">
          <p className="text-slate-500">No monthly data available yet.</p>
        </div>
      </div>
    )
  }
}

export default MonthlyReport
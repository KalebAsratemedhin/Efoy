import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale } from "chart.js";
import StatTile from "./StatTile";
import SectionCard from "./SectionCard";
import { FaUserMd, FaUsers, FaCalendarCheck } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

interface AdminStatsProps {
  doctorsCount: number;
  patientsCount: number;
  appointmentsCount: number;
}

const AdminStats = ({ doctorsCount, patientsCount, appointmentsCount }: AdminStatsProps) => {
  const pieData = {
    labels: ["Doctors", "Patients", "Appointments"],
    datasets: [
      {
        label: "Count",
        data: [doctorsCount, patientsCount, appointmentsCount],
        backgroundColor: ["#0891b2", "#10b981", "#f59e0b"],
        hoverBackgroundColor: ["#0e7490", "#059669", "#d97706"],
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile
          label="Doctors"
          value={doctorsCount}
          icon={<FaUserMd className="w-4 h-4" />}
          tint="accent"
        />
        <StatTile
          label="Patients"
          value={patientsCount}
          icon={<FaUsers className="w-4 h-4" />}
          tint="emerald"
        />
        <StatTile
          label="Appointments"
          value={appointmentsCount}
          icon={<FaCalendarCheck className="w-4 h-4" />}
          tint="amber"
        />
      </div>

      <SectionCard title="Overview">
        <div className="w-full max-w-xs mx-auto py-2">
          <Pie
            data={pieData}
            options={{
              plugins: {
                legend: {
                  position: "bottom",
                  labels: { boxWidth: 12, padding: 16, color: "#475569" },
                },
              },
            }}
          />
        </div>
      </SectionCard>
    </div>
  );
};

export default AdminStats;

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale);

const AdminStats = ({ doctorsCount, patientsCount, appointmentsCount }: {doctorsCount: number, patientsCount: number, appointmentsCount: number}) => {
  const pieData = {
    labels: ['Doctors', 'Patients', 'Appointments'],
    datasets: [
      {
        label: '# of Entities',
        data: [doctorsCount, patientsCount, appointmentsCount],
        backgroundColor: ['#64748b', '#10b981', '#f59e0b'],
        hoverBackgroundColor: ['#475569', '#059669', '#d97706'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Doctors</p>
          <p className="text-xl font-semibold text-ink mt-1">{doctorsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Patients</p>
          <p className="text-xl font-semibold text-ink mt-1">{patientsCount}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Appointments</p>
          <p className="text-xl font-semibold text-ink mt-1">{appointmentsCount}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Entity Distribution</h2>
        <div className="w-full md:w-1/2 lg:w-1/3 mx-auto">
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default AdminStats;

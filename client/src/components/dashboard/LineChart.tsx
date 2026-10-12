import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: number[];
  title: string;
  label: string;
  labels?: string[];
}

const ACCENT = "#0891b2";

const LineChart = ({ data, title, label, labels }: LineChartProps) => {
  const monthLabels =
    labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartData = monthLabels.map((month, index) => ({
    month,
    value: data[index] || 0,
  }));

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col">
      <div className="shrink-0 mb-4">
        <h3 className="text-lg font-semibold text-ink">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">Monthly statistics for {label.toLowerCase()}</p>
      </div>
      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgb(15 23 42 / 0.06)",
                padding: "10px 12px",
              }}
              labelStyle={{ color: "#0f172a", fontWeight: 600, marginBottom: 4 }}
              itemStyle={{ color: "#334155", fontSize: 13 }}
            />
            <Line
              type="monotone"
              dataKey="value"
              name={label}
              stroke={ACCENT}
              strokeWidth={2.5}
              dot={{ fill: ACCENT, strokeWidth: 2, r: 3.5, stroke: "#fff" }}
              activeDot={{ r: 6, fill: ACCENT, stroke: "#fff", strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;

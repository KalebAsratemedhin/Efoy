import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface LineChartProps {
  data: number[];
  title: string;
  label: string;
  labels?: string[];
}

const LineChart = ({ data, title, label, labels }: LineChartProps) => {
  const { isDarkMode } = useTheme();
  
  // Use provided labels or fallback to default months
  const monthLabels = labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const chartData = monthLabels.map((month, index) => ({
    month,
    value: data[index] || 0,
  }));

  const textColor = '#000000';
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
  const lineColor = '#7b10b0';
  const tooltipBg = isDarkMode ? '#1F2937' : '#FFFFFF';
  const gradientId = 'lineGradient';

  return (
    <div className="w-full  h-[300px]">
      <div className="px-6 ">
        <h3 className="text-2xl font-bold" style={{ color: textColor }}>{title}</h3>
        <p className="text-sm mt-2" style={{ color: isDarkMode ? '#9CA3AF' : '#6B7280' }}>
          Monthly statistics for {label.toLowerCase()}
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%" className="py-6 pr-6">
        <RechartsLineChart
          data={chartData}
          
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={gridColor} 
            vertical={false}
            opacity={0.5}
          />
          <XAxis 
            dataKey="month" 
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <YAxis 
            stroke={textColor}
            tick={{ fill: textColor, fontSize: 12 }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: tooltipBg,
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              padding: '12px',
            }}
            labelStyle={{ 
              color: textColor,
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '8px'
            }}
            itemStyle={{ 
              color: textColor,
              fontSize: '13px',
              padding: '0 0'
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            name={label}
            stroke={lineColor}
            strokeWidth={3}
            dot={{ 
              fill: lineColor, 
              strokeWidth: 2,
              r: 4,
              stroke: '#fff'
            }}
            activeDot={{ 
              r: 8, 
              fill: lineColor,
              stroke: '#fff',
              strokeWidth: 2
            }}
            fill={`url(#${gradientId})`}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart; 
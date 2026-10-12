import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa";

const CountDown = ({ eventDate }: { eventDate: Date }) => {
  const calculateTimeLeft = () => {
    const diff = Math.max(0, eventDate.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor(diff / (1000 * 60 * 60)) % 24,
      minutes: Math.floor(diff / (1000 * 60)) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [eventDate]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-500">
        <FaClock className="h-3.5 w-3.5" />
        <span className="text-xs font-medium">Time until appointment</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {Object.entries(timeLeft).map(([interval, value]) => (
          <div key={interval} className="flex flex-col items-center">
            <div className="w-full aspect-square max-h-14 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <span className="text-lg font-bold tabular-nums">{value}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-500 mt-1.5 uppercase tracking-wide">
              {interval}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CountDown;

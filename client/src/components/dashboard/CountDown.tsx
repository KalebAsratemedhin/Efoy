import { useState, useEffect } from 'react';
import { FaClock } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme';

const CountDown = ({ eventDate }: { eventDate: Date }) => {
  const { isDarkMode } = useTheme();
  const now = new Date();
  
  const calculateTimeLeft = () => {
    const diffInMilliseconds: number = eventDate.getTime() - now.getTime();
    return {
      'days': Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)),
      'hours': Math.floor(diffInMilliseconds / (1000 * 60 * 60)) % 24,
      'minutes': Math.floor(diffInMilliseconds / (1000 * 60)) % 60,
      'seconds': Math.floor(diffInMilliseconds / 1000) % 60,
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  const secondaryTextColor = isDarkMode ? '#9CA3AF' : '#6B7280';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [now]);

  const timerComponents = Object.entries(timeLeft).map(([interval, value]) => (
    <div key={interval} className="flex flex-col items-center">
      <div 
        className="w-16 h-16 bg-purple-50 rounded-lg flex items-center justify-center mb-2"
        style={{ color: '#7b10b0' }}
      >
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <div 
        className="text-sm font-medium"
        style={{ color: secondaryTextColor }}
      >
        {interval.charAt(0).toUpperCase() + interval.slice(1)}
      </div>
    </div>
  ));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2" style={{ color: secondaryTextColor }}>
        <FaClock className="h-4 w-4" />
        <span className="text-sm font-medium">Time until appointment</span>
      </div>
      
      <div className="flex justify-between">
        {timerComponents.length ? timerComponents : <span>Time's up!</span>}
      </div>

      <div 
        className="text-sm text-center mt-4"
        style={{ color: secondaryTextColor }}
      >
        Appointment scheduled for {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
};

export default CountDown;
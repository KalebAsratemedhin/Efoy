import React, { useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

interface RealtimeSlotsProps {
  doctorId: string;
  appointmentDate: string;
}

const RealtimeSlots: React.FC<RealtimeSlotsProps> = ({ doctorId, appointmentDate }) => {
  const [selectedDate, setSelectedDate] = useState(appointmentDate);
  
  const { isConnected, availableSlots, error } = useWebSocket({
    doctorId,
    appointmentDate: selectedDate,
    onSlotUpdate: (slots) => {
      console.log('Real-time slot update received:', slots);
    }
  });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Real-time Available Slots</h3>
      
      {/* Connection Status */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>

      {/* Date Selector */}
      <div className="mb-4">
        <label htmlFor="date-selector" className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <input
          id="date-selector"
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Available Slots */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Available Time Slots:</h4>
        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {availableSlots.map((slot, index) => (
              <div
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-center text-sm font-medium"
              >
                {slot}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No available slots for this date</p>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-800">
          💡 This component shows real-time slot availability. When someone books or cancels an appointment, 
          the available slots will update automatically for all connected users.
        </p>
      </div>
    </div>
  );
};

export default RealtimeSlots; 
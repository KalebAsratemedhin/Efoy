import { useAvailableTimeSlotsQuery } from "../../redux/api/doctorAPI";
import { useWebSocket } from "../../hooks/useWebSocket";
import { FaCalendarAlt, FaClock, FaWifi, FaTimes } from "react-icons/fa";
import { useEffect, useState, useMemo, useCallback } from "react";
import { formatTime } from "../../utils/timeUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

interface TimeDateProps {
    register: any,
    errors: any, 
    watch: any, 
    setValue: any,
    doctorId: string,
    currentTime?: string // Add current time prop
}

const TimeDate = ({register, errors, watch, setValue, doctorId, currentTime}: TimeDateProps) => {
    const selectedDate = watch('appointmentDate')
    const [slots, setSlots] = useState<string[]>([]);
    
    // Memoize the WebSocket parameters to prevent unnecessary reconnections
    const wsParams = useMemo(() => ({
        doctorId,
        appointmentDate: selectedDate
    }), [doctorId, selectedDate]);
    
    // Only make the API call when we have both doctorId and selectedDate
    const { data: availableSlots } = useAvailableTimeSlotsQuery(
        { doctorId: doctorId, date: selectedDate },
        { skip: !doctorId || !selectedDate }
    );

    // WebSocket for real-time updates
    const { isConnected, availableSlots: realtimeSlots, error: wsError } = useWebSocket({
        ...wsParams,
        onSlotUpdate: useCallback((newSlots: string[]) => {
            setSlots(newSlots);
            console.log('Real-time slot update received:', newSlots);
        }, [])
    });

    // Combine API data with real-time updates
    useEffect(() => {
        if (availableSlots) {
            setSlots(availableSlots);
        }
    }, [availableSlots]);

    // Use real-time slots if available, fallback to API slots
    const displaySlots = useMemo(() => {
        return realtimeSlots.length > 0 ? realtimeSlots : slots;
    }, [realtimeSlots, slots]);

   // Set the current time when available slots are loaded and current time is provided
   useEffect(() => {
    if (displaySlots && currentTime && displaySlots.includes(currentTime)) {
        setValue('time', currentTime);
    }
   }, [displaySlots, currentTime, setValue]);

    const inputClass = "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                    <label htmlFor="appointmentDate" className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                        <FaCalendarAlt className="text-slate-500 w-4 h-4" />
                        Date
                    </label>
                    <input
                        type="date"
                        id="appointmentDate"
                        {...register("appointmentDate", { required: "Date is required" })}
                        min={new Date().toISOString().split("T")[0]}
                        className={`${inputClass} ${errors.appointmentDate ? "border-red-500" : ""}`}
                    />
                    {errors.appointmentDate && (
                        <p className="text-red-500 text-sm mt-1">{errors.appointmentDate.message}</p>
                    )}
                </div>

                <div className="lg:col-span-3">
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
                        <FaClock className="text-slate-500 w-4 h-4" />
                        Time
                        {isConnected ? (
                            <FaWifi className="text-green-500 text-xs" title="Live updates" />
                        ) : (
                            <FaTimes className="text-slate-400 text-xs" title="Cached" />
                        )}
                    </label>
                    {isConnected && (
                        <p className="text-green-700 text-xs mb-2 flex items-center gap-1">
                            <FaWifi className="text-green-500" /> Live slot updates
                        </p>
                    )}
                    {wsError && (
                        <p className="text-amber-700 text-xs mb-2">Showing cached slots</p>
                    )}

                    <div className="space-y-3">
                        {displaySlots && displaySlots.length > 0 ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        type="button"
                                        className={cn(
                                            "w-full min-w-[10rem] flex items-center justify-between gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-left",
                                            "hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent",
                                            "transition-colors"
                                        )}
                                    >
                                        <span className={watch("time") ? "text-ink" : "text-slate-500"}>
                                            {watch("time") ? formatTime(watch("time")) : "Select time"}
                                        </span>
                                        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="max-h-[16rem] overflow-y-auto min-w-[10rem]">
                                    {displaySlots.map((slot: string) => (
                                        <DropdownMenuItem
                                            key={slot}
                                            onClick={() => setValue("time", slot)}
                                            className="cursor-pointer"
                                        >
                                            {formatTime(slot)}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                                <FaClock className="text-slate-400 text-2xl mx-auto mb-2" />
                                <p className="text-slate-600 text-sm">No slots for this date</p>
                                <p className="text-slate-400 text-xs mt-0.5">Pick another date</p>
                            </div>
                        )}

                        <input type="hidden" {...register("time", { required: "Time is required" })} />
                    </div>

                    {errors.time && (
                        <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TimeDate;


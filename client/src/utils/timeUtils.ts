/**
 * Utility functions for time formatting
 */

/**
 * Converts 24-hour time format (HH:MM) to 12-hour format with AM/PM
 * @param time - Time in HH:MM format (e.g., "14:30")
 * @returns Formatted time in 12-hour format (e.g., "2:30 PM")
 */
export const formatTime12Hour = (time: string): string => {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

/**
 * Converts 24-hour time format (HH:MM) to 12-hour format with AM/PM
 * Alternative name for backward compatibility
 */
export const formatTime = formatTime12Hour; 
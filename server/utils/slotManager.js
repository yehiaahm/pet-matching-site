/**
 * Generate time slots for a given time range
 * @param {string} startTime - Start time in HH:MM format (e.g., "09:00")
 * @param {string} endTime - End time in HH:MM format (e.g., "17:00")
 * @param {number} durationMinutes - Duration of each slot in minutes
 * @returns {string[]} - Array of time slots in HH:MM format
 */
export const generateTimeSlots = (startTime, endTime, durationMinutes) => {
  const slots = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  
  for (let minutes = startMinutes; minutes + durationMinutes <= endMinutes; minutes += durationMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`);
  }
  
  return slots;
};

/**
 * Check if a time slot is available
 * @param {string} timeSlot - Time slot in HH:MM format
 * @param {string[]} bookedSlots - Array of already booked time slots
 * @returns {boolean} - True if available, false otherwise
 */
export const isSlotAvailable = (timeSlot, bookedSlots) => {
  return !bookedSlots.includes(timeSlot);
};

/**
 * Parse time string to minutes since midnight
 * @param {string} timeString - Time in HH:MM format
 * @returns {number} - Minutes since midnight
 */
export const timeToMinutes = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 * @param {number} minutes - Minutes since midnight
 * @returns {string} - Time in HH:MM format
 */
export const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

/**
 * Check if booking time has passed
 * @param {Date} bookingDate - Booking date
 * @param {string} timeSlot - Time slot in HH:MM format
 * @returns {boolean} - True if time has passed
 */
export const hasTimePassed = (bookingDate, timeSlot) => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const appointmentDateTime = new Date(bookingDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  return appointmentDateTime < new Date();
};

/**
 * Get hours until appointment
 * @param {Date} bookingDate - Booking date
 * @param {string} timeSlot - Time slot in HH:MM format
 * @returns {number} - Hours until appointment (negative if passed)
 */
export const getHoursUntilAppointment = (bookingDate, timeSlot) => {
  const [hours, minutes] = timeSlot.split(':').map(Number);
  const appointmentDateTime = new Date(bookingDate);
  appointmentDateTime.setHours(hours, minutes, 0, 0);
  
  const now = new Date();
  return (appointmentDateTime - now) / (1000 * 60 * 60);
};

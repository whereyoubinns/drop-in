// Utility functions for time tracking

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getTimeOnCourt = (onCourtAt?: number): number => {
  if (!onCourtAt) return 0;
  return Date.now() - onCourtAt;
};

export const getTimeStatus = (milliseconds: number, sessionDuration: number = 20): 'good' | 'warning' | 'overtime' => {
  const minutes = milliseconds / (1000 * 60);
  const warningThreshold = sessionDuration * 0.75; // 75% of session time

  if (minutes < warningThreshold) return 'good';
  if (minutes < sessionDuration) return 'warning';
  return 'overtime';
};

export const isOvertime = (onCourtAt?: number, sessionDuration: number = 20): boolean => {
  if (!onCourtAt) return false;
  const timeOnCourt = getTimeOnCourt(onCourtAt);
  return timeOnCourt > sessionDuration * 60 * 1000;
};

export const formatClockTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
};

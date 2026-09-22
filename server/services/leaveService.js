export const calculateLeaveDays = (startDate, endDate, dayType) => {
  if (dayType === 'half') return 0.5;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(diff, 1);
};

export const datesOverlap = (start1, end1, start2, end2) => {
  return new Date(start1) <= new Date(end2) && new Date(end1) >= new Date(start2);
};

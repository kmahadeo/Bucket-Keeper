export const HOLIDAYS = [
  { date: '2025-01-01', name: 'New Year\'s Day', type: 'global' },
  { date: '2025-01-14', name: 'Makar Sankranti / Pongal', type: 'indian' },
  { date: '2025-01-26', name: 'Republic Day', type: 'indian' },
  { date: '2025-02-14', name: 'Valentine\'s Day', type: 'global' },
  { date: '2025-03-14', name: 'Holi', type: 'indian' },
  { date: '2025-05-26', name: 'Memorial Day', type: 'american' },
  { date: '2025-07-04', name: 'Independence Day (USA)', type: 'american' },
  { date: '2025-08-15', name: 'Independence Day (India)', type: 'indian' },
  { date: '2025-09-02', name: 'Labor Day', type: 'american' },
  { date: '2025-10-20', name: 'Diwali', type: 'indian' },
  { date: '2025-11-27', name: 'Thanksgiving', type: 'american' },
  { date: '2025-12-25', name: 'Christmas', type: 'global' },
];

export function getUpcomingHolidays(days = 30) {
  const today = new Date();
  const future = new Date();
  future.setDate(today.getDate() + days);

  // Simple mock implementation for demo purposes assuming 2025 dates for next cycle
  return HOLIDAYS.filter(h => {
    const hDate = new Date(h.date);
    return hDate >= today && hDate <= future;
  });
}

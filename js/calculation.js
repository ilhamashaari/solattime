// Convert a time string such as "05:58" (or "05:58 (+08)") into a Date object
// addDays = 1 means tomorrow
function timeToDate(timeStr, addDays = 0) {
  // Remove any timezone text, then split into hours and minutes
  const [h, m] = timeStr.split(' ')[0].split(':').map(Number);
  const d = new Date();
  d.setDate(d.getDate() + addDays);
  d.setHours(h, m, 0, 0);
  return d;
}

// Find the next upcoming prayer
function getNextPrayer(timings) {
  const now = new Date();
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Return the first prayer whose time is later than now
  for (const name of prayers) {
    const t = timeToDate(timings[name]);
    if (t > now) return { name, time: t };
  }
  // Boundary case: after Isha, the next prayer is tomorrow's Fajr
  return { name: 'Fajr', time: timeToDate(timings['Fajr'], 1) };
}

// Convert milliseconds into a readable "Xh Ym Zs" string
function formatRemaining(ms) {
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h}h ${m}m ${s}s`;
}
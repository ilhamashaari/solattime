// Show a message to the user (red for errors, green for success)
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.style.color = type === 'error' ? 'red' : 'green';
}

// Remove the timezone text, e.g. "05:58 (+08)" becomes "05:58"
const cleanTime = (t) => t.split(' ')[0];

// Build the monthly table from the API data
function displayCalendar(days) {
  const table = document.getElementById('calendarTable');
  table.innerHTML = ''; // clear old table (DOM manipulation)

  // Header row
  const header = table.insertRow();
  ['Date', 'Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    header.appendChild(th);
  });

  const today = new Date().getDate();

  // One row per day
  days.forEach(d => {
    const row = table.insertRow();
    const cells = [
      d.date.gregorian.date,
      cleanTime(d.timings.Fajr),
      cleanTime(d.timings.Dhuhr),
      cleanTime(d.timings.Asr),
      cleanTime(d.timings.Maghrib),
      cleanTime(d.timings.Isha)
    ];
    cells.forEach(text => {
      const td = row.insertCell();
      td.textContent = text;
    });
    // Highlight today's row
    if (Number(d.date.gregorian.day) === today) {
      row.style.backgroundColor = '#c8f7c5';
    }
  });
}

// Event: user clicks the load button
document.getElementById('loadBtn').addEventListener('click', async () => {
  const city = document.getElementById('city').value.trim();
  const country = document.getElementById('country').value.trim();

  // Input validation: both fields are required
  if (city === '' || country === '') {
    showMessage('Please enter both city and country.', 'error');
    return;
  }

  showMessage('Loading...', 'success');
  const now = new Date();
  const days = await getMonthlyCalendar(city, country, now.getFullYear(), now.getMonth() + 1);

  if (days && days.length > 0) {
    displayCalendar(days);
    showMessage(`Calendar loaded for ${city}.`, 'success');
  } else if (days) {
    // Empty result
    showMessage('No calendar data found for this city.', 'error');
  }
});
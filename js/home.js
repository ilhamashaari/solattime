// Holds the countdown timer so it can be stopped and restarted
let countdownTimer = null;

// Remember the last suggestion so we only save when it changes
let lastSuggestionText = '';

// The city currently being shown
let currentCity = '';

// Show a message to the user (red for errors, green for success)
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.style.color = type === 'error' ? 'red' : 'green';
}

// Clear old results so wrong data is not left on screen after a failed search
function clearResults() {
  clearInterval(countdownTimer);
  ['hijri', 'countdown', 'qibla', 'suggestion', 'asma'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
  document.getElementById('timesList').innerHTML = '';
}

// Display the 5 daily prayer times in a list
function displayTimes(timings) {
  const list = document.getElementById('timesList');
  list.innerHTML = ''; // clear old results first (DOM manipulation)

  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  prayers.forEach(name => {
    const li = document.createElement('li');
    li.textContent = `${name}: ${timings[name]}`;
    list.appendChild(li);
  });
}

// Show the latest 5 saved suggestions from Local Storage
function displaySuggestionHistory() {
  const list = document.getElementById('suggestionHistory');
  list.innerHTML = '';
  const history = loadSuggestions().slice(0, 5);

  // Empty state message
  if (history.length === 0) {
    list.innerHTML = '<li>No suggestions saved yet.</li>';
    return;
  }

  history.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `[${s.savedAt}] ${s.period} (${s.city}): ${s.text}`;
    list.appendChild(li);
  });
}

// Show the current suggestion, and save it only when it has changed
function updateSuggestion(timings) {
  const s = getSuggestion(timings);
  document.getElementById('suggestion').textContent = `${s.period}: ${s.text}`;

  if (s.text !== lastSuggestionText) {
    lastSuggestionText = s.text;
    saveSuggestion({
      period: s.period,
      text: s.text,
      city: currentCity,
      savedAt: new Date().toLocaleString()
    });
    displaySuggestionHistory();
  }
}

// Start the countdown to the next prayer, updating every second
function startCountdown(timings) {
  clearInterval(countdownTimer); // stop any old timer to avoid overlapping

  function update() {
    const next = getNextPrayer(timings);
    const remaining = next.time - new Date(); // difference in milliseconds
    document.getElementById('countdown').textContent =
      `Next prayer: ${next.name} in ${formatRemaining(remaining)}`;
    updateSuggestion(timings); // refresh suggestion when the period changes
  }

  update(); // show immediately, do not wait one second
  countdownTimer = setInterval(update, 1000);
}

// Load and display the extra APIs (Hijri date, Qibla, Name of Allah)
// Each one has its own fallback message so one failure does not break the page
async function loadExtras(meta) {
  // API 2: Hijri date
  const hijri = await getHijriDate();
  document.getElementById('hijri').textContent = hijri
    ? `Hijri date: ${hijri.day} ${hijri.month.en} ${hijri.year} AH`
    : 'Hijri date is not available right now.';

  // API 3: Qibla direction, using the coordinates returned by API 1
  const direction = await getQibla(meta.latitude, meta.longitude);
  document.getElementById('qibla').textContent = direction !== null
    ? `Qibla direction: ${Number(direction).toFixed(1)}° from North (clockwise)`
    : 'Qibla direction is not available right now.';

  // API 5: pick one of the 99 names based on today's date
  const names = await getAsmaAlHusna();
  if (names && names.length > 0) {
    const a = names[(new Date().getDate() - 1) % names.length];
    document.getElementById('asma').textContent =
      `${a.number}. ${a.name} (${a.transliteration}) - ${a.en.meaning}`;
  } else {
    document.getElementById('asma').textContent = 'Name of Allah is not available right now.';
  }
}

// Event: user clicks the search button
document.getElementById('searchBtn').addEventListener('click', async () => {
  const city = document.getElementById('city').value.trim();
  const country = document.getElementById('country').value.trim();

  // Input validation: both fields are required
  if (city === '' || country === '') {
    clearResults();
    showMessage('Please enter both city and country.', 'error');
    return;
  }

  showMessage('Loading...', 'success');
  const data = await getPrayerData(city, country);

  // Only update the page if the request succeeded
  if (data) {
    currentCity = city;
    lastSuggestionText = ''; // force a fresh suggestion for the new city
    displayTimes(data.timings);
    startCountdown(data.timings);
    showMessage(`Prayer times loaded for ${data.placeName}.`, 'success');
    loadExtras(data.meta); // load the other APIs without blocking the page
  } else {
    clearResults(); // the error message was already shown by getPrayerData
  }
});

// Show previously saved suggestions when the page loads
displaySuggestionHistory();
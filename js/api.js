// Helper: fetch a URL and return the "data" part of the Aladhan JSON response
async function fetchJson(url) {
  const res = await fetch(url);
  // Handle failed responses such as server errors
  if (!res.ok) throw new Error('Server error (' + res.status + ')');
  const json = await res.json();
  return json.data;
}

// Helper: today's date in the DD-MM-YYYY format that Aladhan expects
function todayString() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${dd}-${mm}-${now.getFullYear()}`;
}

// Find a real place by name using the Open-Meteo geocoding API
// Returns the place (with latitude/longitude) or null if it does not exist
async function findPlace(city, country) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location service error (' + res.status + ')');
  const json = await res.json();

  // When nothing matches, the API sends no "results" at all
  const results = json.results || [];

  // Keep only the place whose country matches what the user typed
  const wanted = country.toLowerCase();
  const match = results.find(p =>
    (p.country && p.country.toLowerCase() === wanted) ||
    (p.country_code && p.country_code.toLowerCase() === wanted)
  );
  return match || null;
}

// API 1: prayer times for a verified city (method 17 = JAKIM Malaysia)
// Returns { timings, meta, date, placeName } or null if it fails
async function getPrayerData(city, country) {
  try {
    // Step 1: confirm the city really exists in that country
    const place = await findPlace(city, country);
    if (!place) throw new Error(`"${city}" was not found in ${country}`);

    // Step 2: get prayer times using the exact coordinates
    const url = `https://api.aladhan.com/v1/timings/${todayString()}?latitude=${place.latitude}&longitude=${place.longitude}&method=17`;
    const data = await fetchJson(url);

    // Empty result: the API answered but sent no prayer times
    if (!data || !data.timings) throw new Error('No prayer times found for this city');

    // Add a readable place name, e.g. "Kuala Lumpur, Kuala Lumpur, Malaysia"
    data.placeName = `${place.name}${place.admin1 ? ', ' + place.admin1 : ''}, ${place.country}`;
    return data;
  } catch (err) {
    showMessage('Failed to load prayer times: ' + err.message, 'error');
    return null;
  }
}

// API 2: convert today's Gregorian date to the Hijri date
async function getHijriDate() {
  try {
    const data = await fetchJson(`https://api.aladhan.com/v1/gToH/${todayString()}`);
    return data.hijri;
  } catch (err) {
    return null; // the caller shows a "not available" message
  }
}

// API 3: Qibla direction (degrees from North) for given coordinates
async function getQibla(lat, lng) {
  try {
    const data = await fetchJson(`https://api.aladhan.com/v1/qibla/${lat}/${lng}`);
    return data.direction;
  } catch (err) {
    return null;
  }
}

// API 4: prayer times for every day of a month (also uses the verified city)
async function getMonthlyCalendar(city, country, year, month) {
  try {
    const place = await findPlace(city, country);
    if (!place) throw new Error(`"${city}" was not found in ${country}`);

    const url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${place.latitude}&longitude=${place.longitude}&method=17`;
    return await fetchJson(url); // an array with one item per day
  } catch (err) {
    showMessage('Failed to load calendar: ' + err.message, 'error');
    return null;
  }
}

// API 5: the 99 Names of Allah (Asma al-Husna)
async function getAsmaAlHusna() {
  try {
    return await fetchJson('https://api.aladhan.com/v1/asmaAlHusna'); // an array of 99 items
  } catch (err) {
    return null;
  }
}
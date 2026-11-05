// The key used to store reminders in Local Storage
const KEY = 'reminders';

// The key used to store suggestion history in Local Storage
const SUGGEST_KEY = 'suggestions';

// Read all records from Local Storage (empty array if nothing saved yet)
const load = () => JSON.parse(localStorage.getItem(KEY)) || [];

// Save the full list to Local Storage as a JSON string
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));

// CREATE: add a new record with a unique id
function createReminder(r) {
  const list = load();
  list.push({ id: Date.now(), ...r });
  save(list);
}

// UPDATE: change the record that has the matching id
function updateReminder(id, changes) {
  const list = load().map(r => r.id === id ? { ...r, ...changes } : r);
  save(list);
}

// DELETE: keep every record except the one with the matching id
function deleteReminder(id) {
  const list = load().filter(r => r.id !== id);
  save(list);
}

// Read the saved suggestion history (newest first)
const loadSuggestions = () => JSON.parse(localStorage.getItem(SUGGEST_KEY)) || [];

// Save a new suggestion at the top of the history (keep the latest 20 only)
function saveSuggestion(entry) {
  const list = loadSuggestions();
  list.unshift({ id: Date.now(), ...entry });
  localStorage.setItem(SUGGEST_KEY, JSON.stringify(list.slice(0, 20)));
}
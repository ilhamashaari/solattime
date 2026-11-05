// null = add mode, an id value = edit mode
let editingId = null;

// Show a message to the user (red for errors, green for success)
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.style.color = type === 'error' ? 'red' : 'green';
}

// Go back to add mode and clear the form
function resetForm() {
  editingId = null;
  document.getElementById('title').value = '';
  document.getElementById('note').value = '';
  document.getElementById('addBtn').textContent = 'Add Reminder';
  document.getElementById('cancelBtn').style.display = 'none';
}

// READ: display all records, each with Edit and Delete buttons
function displayReminders() {
  const list = document.getElementById('list');
  list.innerHTML = ''; // clear the old list first
  const reminders = load();

  // Empty state message
  if (reminders.length === 0) {
    list.innerHTML = '<li>No reminders yet.</li>';
    return;
  }

  reminders.forEach(r => {
    const li = document.createElement('li');
    li.textContent = `${r.title} (${r.prayer}) ${r.note ? '- ' + r.note : ''} `;

    // Edit button: load this record into the form
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEdit(r));

    // Delete button: ask for confirmation, then remove the record
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn-delete'; // red button style from style.css
    delBtn.addEventListener('click', () => {
      if (confirm('Delete this reminder?')) {
        deleteReminder(r.id);
        if (editingId === r.id) resetForm(); // avoid editing a deleted record
        showMessage('Reminder deleted.', 'success');
        displayReminders();
      }
    });

    li.appendChild(editBtn);
    li.appendChild(delBtn);
    list.appendChild(li);
  });
}

// Fill the form with an existing record so the user can edit it
function startEdit(r) {
  editingId = r.id;
  document.getElementById('title').value = r.title;
  document.getElementById('prayer').value = r.prayer;
  document.getElementById('note').value = r.note;
  document.getElementById('addBtn').textContent = 'Save Changes';
  document.getElementById('cancelBtn').style.display = 'inline';
  showMessage('Editing reminder...', 'success');
}

// Event: CREATE or UPDATE depending on editingId
document.getElementById('addBtn').addEventListener('click', () => {
  const title = document.getElementById('title').value.trim();
  const prayer = document.getElementById('prayer').value;
  const note = document.getElementById('note').value.trim();

  // Input validation: title is required
  if (title === '') {
    showMessage('Please enter a title.', 'error');
    return;
  }

  if (editingId === null) {
    createReminder({ title, prayer, note });
    showMessage('Reminder added!', 'success');
  } else {
    updateReminder(editingId, { title, prayer, note });
    showMessage('Reminder updated!', 'success');
  }

  resetForm();
  displayReminders();
});

// Event: cancel editing
document.getElementById('cancelBtn').addEventListener('click', () => {
  resetForm();
  showMessage('Edit cancelled.', 'success');
});

// Show saved reminders when the page loads
displayReminders();
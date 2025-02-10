document.getElementById('task-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const taskDetails = document.getElementById('task-details').value;
  const taskDeadline = document.getElementById('task-deadline').value;
  const phoneNumber = document.getElementById('phone-number').value;

  if (taskDetails && taskDeadline && phoneNumber) {
      await addTask(taskDetails, taskDeadline, phoneNumber);
      document.getElementById('task-form').reset();
      await fetchTasks();
  } else {
      alert('Please fill out all fields.');
  }
});

async function addTask(details, deadline, phoneNumber) {
  try {
      const response = await fetch('/add-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ details, deadline, phoneNumber })
      });

      if (!response.ok) {
          throw new Error('Failed to add task');
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

async function fetchTasks() {
  try {
      const response = await fetch('/tasks');
      if (!response.ok) {
          throw new Error('Failed to fetch tasks');
      }

      const tasks = await response.json();
      renderTasks(tasks);
  } catch (error) {
      console.error('Error:', error);
  }
}

function renderTasks(tasks) {
  const taskList = document.getElementById('task-list');
  taskList.innerHTML = '';

  tasks.forEach((task) => {
      const li = document.createElement('li');
      li.innerHTML = `
          <span>${task.details} (Deadline: ${new Date(task.deadline).toLocaleString()})</span>
          <button class="edit-btn" onclick="editTask('${task.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteTask('${task.id}')">Delete</button>
      `;

      const now = new Date();
      const taskDate = new Date(task.deadline);
      
      // Apply red color if the deadline is past, green if upcoming
      li.classList.add(taskDate < now ? 'red' : 'green');

      taskList.appendChild(li);
  });
}

async function deleteTask(id) {
  try {
      const response = await fetch(`/delete-task/${id}`, { method: 'DELETE' });
      if (!response.ok) {
          throw new Error('Failed to delete task');
      }
      await fetchTasks();
  } catch (error) {
      console.error('Error:', error);
  }
}

async function editTask(id) {
  const newDetails = prompt('Enter new task details:');
  if (newDetails) {
      try {
          const response = await fetch(`/edit-task/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ details: newDetails })
          });
          if (!response.ok) {
              throw new Error('Failed to edit task');
          }
          await fetchTasks();
      } catch (error) {
          console.error('Error:', error);
      }
  }
}

document.addEventListener('DOMContentLoaded', fetchTasks);

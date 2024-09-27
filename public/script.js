// EDIT THIS TO MATCH YOUR DAILY NEEDS
const INITIAL_DAYS = 100; // The amount of total days
const STARTING_DATE = new Date('2024-09-22'); // The starting date YEAR-MONTH-DAY

const boxesContainer = document.getElementById('boxes-container');
const currentDaySpan = document.getElementById('current-day');
const increaseDayBtn = document.getElementById('increase-day');
const decreaseDayBtn = document.getElementById('decrease-day');

let currentDay = 1;
let boxStates = [];

// Fetch data from the local JSON file using the API
async function loadData() {
  try {
    const response = await fetch('/data');
    const data = await response.json();
    currentDay = data.currentDay || 1;
    boxStates = data.boxStates || Array(INITIAL_DAYS).fill(['', '', '']);
    tasks = data.tasks || Array(INITIAL_DAYS).fill([]); // Ensure tasks are loaded
    currentDaySpan.textContent = `Day: ${currentDay}`;
    createBoxes();
    calculateDaysPassed();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Save data to the local JSON file using the API
async function saveData() {
  const dataToSave = {
    currentDay: currentDay,
    boxStates: boxStates,
    tasks: tasks, // Ensure tasks are saved
  };

  try {
    const response = await fetch('/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSave),
    });

    const result = await response.json();
    console.log(result.message);
  } catch (error) {
    console.error('Error saving data:', error);
  }
}

// Create boxes dynamically
function createBoxes() {
  boxesContainer.innerHTML = ''; // Clear previous boxes
  for (let i = 0; i < INITIAL_DAYS; i++) {
    const box = document.createElement('div');
    box.className = 'box';

    // Highlight the box if it matches the current day
    if (i + 1 === currentDay) {
      box.classList.add('highlight');
    }

    for (let j = 0; j < 3; j++) {
      const boxPart = document.createElement('div');
      boxPart.className = 'box-part';
      if (boxStates[i][j]) {
        boxPart.classList.add(boxStates[i][j]); // Apply saved color
      }

      boxPart.addEventListener('click', () => handleBoxClick(i, j, boxPart));
      box.appendChild(boxPart);
    }

    const dailyTasksDiv = document.createElement('div');
    dailyTasksDiv.className = 'daily-tasks';

    // Create a button to toggle task dropdown visibility
    const toggleTasksBtn = document.createElement('button');
    toggleTasksBtn.textContent = 'Tasks';
    toggleTasksBtn.className = 'tasks-toggle';
    toggleTasksBtn.addEventListener('click', () => toggleTaskDropdown(i));

    // Create the task dropdown container
    const taskDropdown = document.createElement('div');
    taskDropdown.className = 'task-dropdown';
    taskDropdown.style.flexDirection = 'column';
    taskDropdown.style.display = 'none'; // Hide initially
    taskDropdown.innerHTML = getTasksHTML(i); // Populate with tasks

    // Append task button and dropdown to the box
    dailyTasksDiv.appendChild(toggleTasksBtn);
    dailyTasksDiv.appendChild(taskDropdown);
    box.appendChild(dailyTasksDiv);
    boxesContainer.appendChild(box);
  }
}

// Toggle task dropdown visibility
function toggleTaskDropdown(dayIndex) {
  const taskDropdown =
    boxesContainer.children[dayIndex].querySelector('.task-dropdown');
  taskDropdown.style.display =
    taskDropdown.style.display === 'none' ? 'flex' : 'none';
}

// Generate the tasks HTML for a specific day
function getTasksHTML(dayIndex) {
  let taskList = tasks[dayIndex] || [];
  let html = '<ul>';

  taskList.forEach((task, taskIndex) => {
    let doneClass = task.done ? 'done' : '';
    html += `
      <li class="${doneClass}" >
        <span class="task-text" onclick="toggleTaskStatus(${dayIndex}, ${taskIndex})" >${task.name}</span> 
        <span class="delete-task" onclick="deleteTask(${dayIndex}, ${taskIndex})">X</span>
      </li>`;
  });

  html += '</ul>';
  html += `<input type="text" id="taskInput-${dayIndex}" placeholder="New task">`;
  html += `<button onclick="addTask(${dayIndex})">Add Task</button>`;
  return html;
}

// Add a new task to a specific day
function addTask(dayIndex) {
  const taskInput = document.getElementById(`taskInput-${dayIndex}`).value;
  if (taskInput) {
    if (!tasks[dayIndex]) {
      tasks[dayIndex] = [];
    }
    tasks[dayIndex].push({ name: taskInput, done: false });
    updateTasks(dayIndex);
    saveData(); // Save data after task is added
  }
}

// Delete a task from a specific day
function deleteTask(dayIndex, taskIndex) {
  tasks[dayIndex].splice(taskIndex, 1); // Remove task from the array
  updateTasks(dayIndex); // Update the task dropdown
  saveData(); // Save the updated tasks to the data.json file
}

// Toggle the task status between "done" and "not-done"
function toggleTaskStatus(dayIndex, taskIndex) {
  tasks[dayIndex][taskIndex].done = !tasks[dayIndex][taskIndex].done;
  updateTasks(dayIndex);
  saveData(); // Save data after task status change
}

// Update the tasks displayed for a specific day
function updateTasks(dayIndex) {
  const taskDropdown =
    boxesContainer.children[dayIndex].querySelector('.task-dropdown');
  taskDropdown.innerHTML = getTasksHTML(dayIndex);
}

function updateDay(newDay) {
  currentDay = newDay;
  createBoxes(); // Recreate boxes to reflect the highlight change
}

// Handle box clicks to change color or empty
function handleBoxClick(boxIndex, partIndex, boxPart) {
  // Define the colors for each part
  const colors = ['green', 'blue', 'red'];

  // Check the current color of the part
  const currentColor = boxStates[boxIndex][partIndex];

  if (currentColor) {
    // If there's a color, reset to empty
    boxStates[boxIndex][partIndex] = '';
    boxPart.className = 'box-part'; // Reset to empty class
  } else {
    // If empty, set to the new color based on the partIndex
    const newColor = colors[partIndex];
    boxStates[boxIndex][partIndex] = newColor;
    boxPart.className = 'box-part ' + newColor; // Set the new color class
  }

  // Save data after the change
  saveData();
}

// Increment or decrement day count
increaseDayBtn.addEventListener('click', () => {
  if (currentDay < INITIAL_DAYS) {
    currentDay++;
    currentDaySpan.textContent = `Day: ${currentDay}`;
    updateDay(currentDay);
    saveData();
  }
});

decreaseDayBtn.addEventListener('click', () => {
  if (currentDay > 1) {
    currentDay--;
    currentDaySpan.textContent = `Day: ${currentDay}`;
    updateDay(currentDay);
    saveData();
  }
});

function calculateDaysPassed() {
  const targetDate = STARTING_DATE; // Set the target date
  const today = new Date(); // Get today's date

  // Calculate the difference in time
  const timeDiff = today - targetDate;

  // Convert time difference from milliseconds to days
  const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // Display the result
  document.getElementById('daysPassed').textContent = daysPassed;
}

// Initial setup
loadData();

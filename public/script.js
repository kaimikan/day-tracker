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

    // Create the task overlay container
    const taskDropdownOverlay = document.createElement('div');
    taskDropdownOverlay.className = 'task-dropdown-overlay';
    taskDropdownOverlay.style.display = 'none'; // Hide initially

    // Create the task dropdown container
    const taskDropdown = document.createElement('div');
    taskDropdown.className = 'task-dropdown';
    taskDropdown.style.flexDirection = 'column';
    taskDropdown.style.display = 'none'; // Hide initially
    taskDropdown.innerHTML = getTasksHTML(i); // Populate with tasks

    // Add Enter as valid event for task adding
    // let addTaskBtn = taskDropdown.querySelector('.add-task-btn');
    let addTaskInput = taskDropdown.querySelector('.task-input-field');
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && taskDropdown.style.display !== 'none') {
        addTask(i);
        addTaskInput.focus();
      } else if (
        event.key === 'Escape' &&
        taskDropdown.style.display !== 'none'
      ) {
        taskDropdownOverlay.style.display = 'none';
        taskDropdown.style.display = 'none';
        console.log('closed tasks');
      }
    });

    // Handle the closing the dropdown when clicking outside of it (on the overlay)
    taskDropdownOverlay.addEventListener('click', (event) => {
      // we also want to make sure our click is not on top of the .task-dropdown inside the overlay
      if (
        event.target.style.display === 'flex' &&
        !event.target.classList.contains('task-dropdown')
      ) {
        event.target.style.display = 'none';
        taskDropdown.style.display = 'none';
        console.log('closed tasks');
      } else {
        console.log('most likely clicking on the task dropdown in the middle');
      }
    });

    // Append task button and dropdown to the box
    dailyTasksDiv.appendChild(toggleTasksBtn);
    taskDropdownOverlay.appendChild(taskDropdown);
    dailyTasksDiv.appendChild(taskDropdownOverlay);
    box.appendChild(dailyTasksDiv);
    boxesContainer.appendChild(box);
  }
}

// Toggle task dropdown visibility
function toggleTaskDropdown(dayIndex) {
  // Close all other opened tasks and open/close the clicked one
  const taskDropdownOverlays = boxesContainer.querySelectorAll(
    '.task-dropdown-overlay'
  );
  const taskDropdowns = boxesContainer.querySelectorAll('.task-dropdown');

  // Loop through all task-dropdown elements
  taskDropdowns.forEach((dropdown, index) => {
    let dropdownOverlay = taskDropdownOverlays.item(index);
    if (index === dayIndex) {
      // Toggle the visibility for the selected dayIndex dropdown
      dropdown.style.display = 'flex';
      dropdownOverlay.style.display = 'flex';

      //Autofocus input field
      console.log('opened tasks');
      dropdown.querySelector('.task-input-field').focus();
    }
  });
}

// Generate the tasks HTML for a specific day
function getTasksHTML(dayIndex) {
  let taskList = tasks[dayIndex] || [];
  let html = '<ul>';
  let dateOfTaskGroup = new Date(STARTING_DATE);
  dateOfTaskGroup.setDate(dateOfTaskGroup.getDate() + dayIndex);
  html += `<p class="tasks-date"> ${convertDateToString(dateOfTaskGroup)} </p>`;

  taskList.forEach((task, taskIndex) => {
    let doneClass =
      task.done === true || task.done === 'done'
        ? 'done'
        : task.done === false || task.done === 'not-done'
        ? 'not-done'
        : '';
    html += `
      <li 
        class="task-item ${doneClass}" 
        draggable="true"
        ondragstart="handleDragStart(event, ${dayIndex}, ${taskIndex})"
        ondragover="handleDragOver(event)"
        ondrop="handleDrop(event, ${dayIndex}, ${taskIndex})"
      >
        <span class="task-text" onclick="toggleTaskStatus(${dayIndex}, ${taskIndex})">
          ${task.name}
        </span> 
        <span class="delete-task" onclick="deleteTask(${dayIndex}, ${taskIndex})">X</span>
      </li>`;
  });

  html += '</ul>';
  html += `<input class="task-input-field" type="text" id="taskInput-${dayIndex}" placeholder="New task" autofocus>`;
  html += `<button class="add-task-btn" onclick="addTask(${dayIndex})">Add Task</button>`;
  return html;
}

function handleDragStart(event, dayIndex, taskIndex) {
  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({ dayIndex, taskIndex })
  );
  event.target.classList.add('dragging');
}

function handleDragOver(event) {
  event.preventDefault(); // Necessary to allow dropping
}

function handleDrop(event, dayIndex, targetTaskIndex) {
  event.preventDefault();
  const data = JSON.parse(event.dataTransfer.getData('text/plain'));
  const { dayIndex: fromDayIndex, taskIndex: fromTaskIndex } = data;

  if (fromDayIndex === dayIndex) {
    // Only handle reordering within the same day
    const [movedTask] = tasks[dayIndex].splice(fromTaskIndex, 1);
    tasks[dayIndex].splice(targetTaskIndex, 0, movedTask);

    updateTasks(dayIndex); // Update the task dropdown with the new order
    saveData(); // Save the updated order
  }
}

// Add a new task to a specific day
function addTask(dayIndex) {
  const taskInputElement = document.getElementById(`taskInput-${dayIndex}`);
  const taskInput = taskInputElement.value;
  if (taskInput) {
    if (!tasks[dayIndex]) {
      tasks[dayIndex] = [];
    }
    tasks[dayIndex].push({ name: taskInput, done: '' });
    updateTasks(dayIndex);
    saveData(); // Save data after task is added
  }
  // Due to the keydown code in createBoxes() we can refocus onto the input field just by clicking Enter with an empty input
  taskInputElement.focus();
}

// Delete a task from a specific day
function deleteTask(dayIndex, taskIndex) {
  tasks[dayIndex].splice(taskIndex, 1); // Remove task from the array
  updateTasks(dayIndex); // Update the task dropdown
  saveData(); // Save the updated tasks to the data.json file
}

// Toggle the task status between "done", "not-done", and ""
function toggleTaskStatus(dayIndex, taskIndex) {
  // tasks[dayIndex][taskIndex].done = !tasks[dayIndex][taskIndex].done;
  let doneStatus = tasks[dayIndex][taskIndex].done;
  if (doneStatus === 'done' || doneStatus === true) {
    doneStatus = 'not-done';
  } else if (doneStatus === '' || doneStatus === null) {
    doneStatus = 'done';
  } else if (doneStatus === 'not-done' || doneStatus === false) {
    doneStatus = '';
  }
  console.log(doneStatus);
  tasks[dayIndex][taskIndex].done = doneStatus;

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
  const targetDate = new Date(STARTING_DATE); // Set the target date
  const today = new Date(); // Get today's date

  // Calculate the difference in time
  const timeDiff = today - targetDate;

  // Convert time difference from milliseconds to days
  const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  const initialDateString = convertDateToString(targetDate);

  // Display the result
  document.getElementById('daysPassed').textContent = daysPassed;
  document.getElementById('initialDate').textContent = initialDateString;
}

function convertDateToString(date) {
  const dateStringOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return date.toLocaleDateString('en-US', dateStringOptions);
}

// Initial setup
loadData();

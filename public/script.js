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
    boxStates = data.boxStates || Array(100).fill(['', '', '']);
    currentDaySpan.textContent = `Day: ${currentDay}`;
    createBoxes();
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

// Save data to the local JSON file using the API
async function saveData() {
  const dataToSave = {
    currentDay: currentDay,
    boxStates: boxStates,
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
  for (let i = 0; i < 100; i++) {
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

    boxesContainer.appendChild(box);
  }
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
  if (currentDay < 100) {
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

// Initial setup
loadData();

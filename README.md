# day-tracker

A tool to track and store daily progress.

## Setup Instructions

Follow these steps to set up the project on your local machine:

1. **Clone the Repository**

   Replace _yourusername_ with your GitHub username.

   ```bash
   git clone https://github.com/yourusername/day-tracker.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd day-tracker
   ```

3. **Install Dependencies** Make sure you have Node.js installed. Then, run:

   ```bash
   npm install
   ```

4. **Set Initial Total Days & Starting Date**
   You should have a data.json in the root of the project with the following data (if not add it):

   ```json
   {
     "currentDay": 1
   }
   ```

   Edit the data shown below at the top of the script.js file to match your needs:

   ```javascript
   // EDIT THIS TO MATCH YOUR DAILY NEEDS
   const INITIAL_DAYS = 100; // The amount of total days
   const STARTING_DATE = new Date('2024-09-22'); // The starting date YEAR-MONTH-DAY
   ```

5. **Start the Server** Run the following command to start the server:

   ```bash
   npm start
   ```

6. **Access the Application**
   Open your web browser and go to _[http://localhost:3000](http://localhost:3000)_.

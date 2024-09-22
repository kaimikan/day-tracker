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

4. **Create Your Own Data File** Edit the data.json in the root of the project to fit your needs, an example below with 10 days:

   ```json
   {
     "currentDay": 1,
     "boxStates": [
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""],
       ["", "", ""]
     ]
   }
   ```

5. **Start the Server** Run the following command to start the server:

   ```bash
   npm start
   ```

6. **Access the Application**
   Open your web browser and go to _[http://localhost:3000](http://localhost:3000)_.

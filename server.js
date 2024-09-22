import express from 'express';
import bodyParser from 'body-parser';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Resolve the directory name (since `__dirname` is not available in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Path to the JSON file
const jsonFilePath = path.join(__dirname, 'data.json');

// API to get the current state (day and box data)
app.get('/data', async (req, res) => {
  try {
    const data = await readFile(jsonFilePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: 'Could not read file' });
  }
});

// API to update the current state (day and box data)
app.post('/data', async (req, res) => {
  const updatedData = req.body;
  try {
    await writeFile(jsonFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
    res.json({ message: 'Data saved successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Could not write to file' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Replicate __dirname functionality in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Elastic Beanstalk provides the port via process.env.PORT
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(express.json()); // To parse JSON request bodies

// --- API Endpoints ---
const DB_FILE = path.join(__dirname, 'db.json');

// Function to read the database
const readDb = () => {
    if (!fs.existsSync(DB_FILE)) {
        // Initialize db.json if it doesn't exist
        fs.writeFileSync(DB_FILE, JSON.stringify({ researchItems: [], integrations: {} }, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
};

// Function to write to the database
const writeDb = (data) => {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// Endpoints for Recent Activity (Research)
app.get('/api/research', (req, res) => {
    const db = readDb();
    res.json(db.researchItems);
});

app.post('/api/research', (req, res) => {
    const db = readDb();
    const newItem = { id: Date.now().toString(), ...req.body, createdDate: new Date().toISOString().split('T')[0] };
    db.researchItems.push(newItem);
    writeDb(db);
    res.status(201).json(newItem);
});

// Endpoints for Integrations
app.get('/api/integrations/status', (req, res) => {
    const db = readDb();
    res.json(db.integrations);
});

app.post('/api/integrations/connect/:service', (req, res) => {
    const { service } = req.params;
    const db = readDb();
    db.integrations[service] = true;
    writeDb(db);
    res.json({ [service]: true, message: `${service} conectado.` });
});

app.post('/api/integrations/disconnect/:service', (req, res) => {
    const { service } = req.params;
    const db = readDb();
    db.integrations[service] = false;
    writeDb(db);
    res.json({ [service]: false, message: `${service} desconectado.` });
});

// --- Static File Serving ---
// Serve static files from the React app build directory
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

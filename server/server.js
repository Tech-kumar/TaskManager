const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-config.json');
const twilio = require('twilio');
const path = require('path');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Firestore database instance

// Initialize Twilio
const accountSid = 'AC0b41d4fd7460e8fd102b68de494b4c9a'; // Replace with your Twilio Account SID
const authToken = '2a807af10b5c2a968cb3d8bce4b7b3af'; // Replace with your Twilio Auth Token
const twilioPhoneNumber = '+14752656067'; // Replace with your Twilio phone number
const client = twilio(accountSid, authToken);

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, '../public')));



// API Endpoint to add a task
app.post('/add-task', async (req, res) => {
  const { details, deadline, phoneNumber } = req.body;

  if (!details || !deadline || !phoneNumber) {
    return res.status(400).json({ error: 'Task details, deadline, and phone number are required.' });
  }

  try {
    // Add task to Firestore
    const taskRef = await db.collection('tasks').add({
      details,
      deadline: new Date(deadline).toISOString(),
      phoneNumber,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Send SMS notification using Twilio
    await client.messages.create({
      body: `Task created: ${details} (Deadline: ${new Date(deadline).toLocaleString()})`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    res.status(201).json({ id: taskRef.id, details, deadline, phoneNumber });
  } catch (error) {
    console.error('Error adding task or sending SMS:', error);
    res.status(500).json({ error: 'Failed to add task or send notification.' });
  }
});

// API Endpoint to fetch all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasksSnapshot = await db.collection('tasks').get();
    const tasks = [];

    tasksSnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// API Endpoint to delete a task
app.delete('/delete-task/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('tasks').doc(id).delete();
    res.status(200).json({ message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// Fallback route for unmatched routes (optional, can redirect to login)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(3001, () => {
  console.log(`Server running at http://localhost:${port}`);
});

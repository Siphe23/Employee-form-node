const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const credentials = require('../key.json');  // Ensure this is your Firebase Admin SDK credentials

const app = express();

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(credentials),
});

const db = admin.firestore();
const storage = admin.storage();  // Firebase Storage reference

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Create Employee
app.post('/employees', async (req, res) => {
  const employee = req.body;
  console.log('Received employee data:', employee); // Log received data
  
  try {
    // If image exists, store it in Firebase Storage
    if (employee.image) {
      const imageBuffer = Buffer.from(employee.image.split(',')[1], 'base64');  // Decode the Base64 string
      const imageName = `employee_images/${employee.employeeId}.png`;  // Image path in Firebase Storage
      const bucket = storage.bucket(); // Firebase Storage bucket

      const file = bucket.file(imageName);
      await file.save(imageBuffer, { contentType: 'image/png' });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(imageName)}?alt=media`;

      // Add the image URL to the employee object
      employee.image = imageUrl;
    }

    // Store the employee data in Firestore
    await db.collection('employees').doc(employee.employeeId).set(employee);
    res.status(201).send({ message: 'Employee created successfully' });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).send({ message: 'Error creating employee' });
  }
});

// Get Employees
app.get('/employees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();
    const employees = snapshot.docs.map((doc) => doc.data());
    res.status(200).send(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).send({ message: 'Error fetching employees' });
  }
});

// Update Employee
app.put('/employees/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  const employee = req.body;

  try {
    const employeeRef = db.collection('employees').doc(employeeId);
    const doc = await employeeRef.get();
    
    if (!doc.exists) {
      return res.status(404).send({ message: 'Employee not found' });
    }

    // If image exists, store it in Firebase Storage
    if (employee.image) {
      const imageBuffer = Buffer.from(employee.image.split(',')[1], 'base64');
      const imageName = `employee_images/${employeeId}.png`;
      const bucket = storage.bucket();
      const file = bucket.file(imageName);
      await file.save(imageBuffer, { contentType: 'image/png' });
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(imageName)}?alt=media`;

      employee.image = imageUrl;  // Update the employee with the new image URL
    }

    // Update the employee document
    await employeeRef.update(employee);
    res.status(200).send({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Error during employee update:', error);
    res.status(500).send({ message: 'Error updating employee' });
  }
});

// Delete Employee
app.delete('/employees/:employeeId', async (req, res) => {
  const { employeeId } = req.params;
  try {
    await db.collection('employees').doc(employeeId).delete();
    res.status(200).send({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).send({ message: 'Error deleting employee' });
  }
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));


 //we declare the express library by import the express library to handle http rquest like GET, Post, Put Delete
// const express = require ('express');
// //we import bodyParser librabry for request body
// const bodyParser = require('body-parser');
// //We import firebase Admin  sine we are working Firebase so we will use firebase SDK storage etc
// const admin = require('firbase-admin');
// // we use core library which is stand for cross-origin-resource-sharing it is used to aloow or resctrict many re sources
// const cors = require ('cors');

// //middleware config
// //middleware are functions that excute during the lifecycle of a request to the server
// const app = express();
//  app.use(bodyParser.json());
//  app.use( cors());


//  app.post('/data', (req, res) => {
//     // Access the parsed JSON data from the request body
//     const userData = req.body;

//     console.log("Received Data:", userData);

//     // Respond back with the received data
//     res.json({
//         message: 'Data received successfully!',
//         data: userData,
//     });
// });

// // Start the server
// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });
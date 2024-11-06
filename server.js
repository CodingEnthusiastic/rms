const express = require('express');
const { Client } = require('pg');
const path = require('path');  // For setting view directory

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Set the directory where views (like HTML or EJS files) are stored
app.set('views', path.join(__dirname, 'views'));

// PostgreSQL client setup (without .env file, directly specifying connection details)
const client = new Client({
  user: 'postgres',         
  host: 'localhost',
  database: 'restaurant_db',    
  password: 'Rishabh@1234',
  port: 5432,
});

client.connect();

// Serve the login page (render EJS file)
app.get('/login', (req, res) => {
    res.render('login');  // This will look for login.ejs in the views folder
});

// Login endpoint to validate credentials
// app.post('/login', async (req, res) => {
//     const { email, password, user_type } = req.body;

//     try {
//         const result = await client.query(
//             'SELECT * FROM users WHERE email = $1 AND user_type = $2',
//             [email, user_type]
//         );

//         // Check if user exists and password is correct
//         if (result.rows.length > 0 && result.rows[0].password === password) {
//             res.status(200).json({ success: true, message: `${user_type} logged in successfully!` });
//         } else {
//             res.status(401).json({ success: false, message: 'Invalid credentials, please try again.' });
//         }
//     } catch (err) {
//         console.error('Error during login:', err);
//         res.status(500).json({ success: false, message: 'Server error, please try again later.' });
//     }
// });
app.post('/login', async (req, res) => {
    const { email, password, user_type } = req.body;
    console.log('Received login data:', { email, password, user_type });
    try {
        const result = await client.query(
            'SELECT * FROM users WHERE email = $1 AND user_type = $2',
            [email, user_type]
        );
        console.log('Login Query Result:', result);  // Log the query result

        // Check if user exists and password is correct
        if (result.rows.length > 0 && result.rows[0].password === password) {
            res.status(200).json({ success: true, message: `${user_type} logged in successfully!` });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials, please try again.' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ success: false, message: 'Server error, please try again later.' });
    }
});

// Serve the registration page (render EJS file)
app.get('/register', (req, res) => {
    res.render('register');  // This will look for register.ejs in the views folder
});

// Register endpoint to validate and insert new user
app.post('/register', async (req, res) => {
    const { email, password, user_type } = req.body;

    console.log('Received registration data:', { email, password, user_type });

    try {
        const result = await client.query(
            'INSERT INTO users (email, password, user_type) VALUES ($1, $2, $3) RETURNING *',
            [email, password, user_type]
        );
 
        
        console.log('Registration query result:', result);

        if (result.rows.length > 0) {
            res.status(200).json({ success: true, message: 'Registration successful!' });
        } else {
            res.status(400).json({ success: false, message: 'Registration failed. Please try again.' });
        }
    } catch (err) {
        if (err.code === '23505') {  // Handle unique constraint violation (e.g., duplicate email)
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        console.error('Error during registration:', err);
        res.status(500).json({ success: false, message: 'Server error, please try again later.' });
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});

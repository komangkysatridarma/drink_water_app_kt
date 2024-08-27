const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const moment = require('moment');
const app = express();

app.use(bodyParser.json());

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'drink_water_app'
});

connection.connect();

app.get('/', (req, res) => {
    res.send("Server health check!")
});

app.post('/saveUser', (req, res) => {
    let { name, gender, birthday, weight, wakeupTime, bedtime } = req.body;

    birthday = moment(birthday, 'DD/MM/YYYY').format('YYYY-MM-DD');

    if (!name || !gender || !birthday || !weight || !wakeupTime || !bedtime) {
        return res.status(400).send('All fields are required');
    }

    const query = 'INSERT INTO users (name, gender, birthday, weight, wakeup_time, bedtime) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(query, [name, gender, birthday, weight, wakeupTime, bedtime], (error, results) => {
        if (error) {
            return res.status(500).send('Error saving data');
        }
        const userId = results.insertId;
        res.status(201).json({
            message: 'Data saved successfully',
            userId: userId
        });
    });
});


app.get('/getUser', (req, res) => {
    const { id } = req.query;

    const query = 'SELECT id, name, gender, birthday, weight, wakeup_time as wakeupTime, bedtime FROM users WHERE id = ?';
    connection.query(query, [id], (error, results) => {
        if (error) {
            return res.status(500).send('Error retrieving data');
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(results[0]);
    });
});


app.put('/users/:userId', (req, res) => {
    const { userId } = req.params;
    const { name, gender, birthday, weight, wakeupTime, bedtime } = req.body;

    const query = 'UPDATE users SET name = ?, gender = ?, birthday = ?, weight = ?, wakeup_time = ?, bedtime = ? WHERE id = ?';
    connection.query(query, [name, gender, birthday, weight, wakeupTime, bedtime, userId], (error) => {
        if (error) {
            return res.status(500).send('Error updating data');
        }
        res.send('Data updated successfully');
    });
});


app.post('/water_intake', (req, res) => {
    let { user_id, date, intake_ml, goal_percentage, first_intake_time } = req.body;

    if (!user_id || !date || !intake_ml) {
        return res.status(400).send('All fields are required');
    }

    date = moment(date).format('YYYY-MM-DD');

    goal_percentage = goal_percentage || 0;
    first_intake_time = first_intake_time || null;

    const query = 'INSERT INTO water_intake (user_id, date, intake_ml, goal_percentage, first_intake_time) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE intake_ml = ?, goal_percentage = ?, first_intake_time = ?';
    connection.query(query, [user_id, date, intake_ml, goal_percentage, first_intake_time, intake_ml, goal_percentage, first_intake_time], (error) => {
        if (error) {
            return res.status(500).send('Error saving water intake data');
        }
        res.status(201).send('Water intake data saved successfully');
    });
});


app.put('/water_intake/:id', (req, res) => {
    const { id } = req.params;
    let { user_id, date, intake_ml, goal_percentage, first_intake_time } = req.body;

    if (!user_id || !date || !intake_ml) {
        return res.status(400).send('All fields are required');
    }
    date = moment(date).format('YYYY-MM-DD');

    const query = 'UPDATE water_intake SET user_id = ?, date = ?, intake_ml = ?, goal_percentage = ?, first_intake_time = ? WHERE id = ?';
    connection.query(query, [user_id, date, intake_ml, goal_percentage, first_intake_time, id], (error) => {
        if (error) {
            return res.status(500).send('Error updating water intake data');
        }
        res.send('Water intake data updated successfully');
    });
});


app.get('/water_intake', (req, res) => {
    const { user_id, date } = req.query;
    if (!user_id || !date) {
        return res.status(400).send('user_id and date are required');
    }

    const formattedDate = moment(date).format('YYYY-MM-DD');

    const query = 'SELECT * FROM water_intake WHERE user_id = ? AND date = ?';
    connection.query(query, [user_id, formattedDate], (error, results) => {
        if (error) {
            return res.status(500).send('Error fetching water intake data');
        }
        if (results.length === 0) {
            return res.status(404).send('Water intake data not found');
        }
        res.json(results[0]);
    });
});
app.listen(3000, () => console.log('Server running on port 3000'));

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// TO SAFEKEEP DB USERNAMES AND PASSWORDS
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true
}).then(console.log("MongoDB connected"));

const Course = require('./models/Course');

// TO RETURN ALL COURSES IN DATABASE AS AN ARRAY
app.get('/courses/all', async (req, res) => {
	const courses = await Course.find(); 
	res.json(courses);
});

app.listen(3001, () => console.log("Server started on port 3001"));
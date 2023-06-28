const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    _id: {
        type: ObjectId,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    tut: {
        type: Array,
        required: false
    },
    lec: {
        type: Array,
        required: false
    },
    rec: {
        type: Array,
        required: false
    },
    lab: {
        type: Array,
        required: false
    },
    sec: {
        type: Array,
        required: false
    }
});

const Course = mongoose.model('Course', CourseSchema, 'courses');

module.exports = Course;
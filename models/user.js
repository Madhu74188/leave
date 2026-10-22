
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    rollNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    casualLeave: {
        type: Number,
        default: 0,
        min: 0
    },

    medicalLeave: {
        type: Number,
        default: 0,
        min: 0
    }
});

module.exports = mongoose.model('User', UserSchema);

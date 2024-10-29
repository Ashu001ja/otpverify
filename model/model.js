const mongoose = require('mongoose');

// Define the OTP schema
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        unique: true // Ensure that each email can only have one active OTP at a time
    },
    otp: {
        type: String,
        required: true,
    },
    expiry: {
        type: Date,
        required: true,
    }
});

// Create the OTP model
const OtpModel = mongoose.model('Otp', otpSchema);

module.exports = OtpModel;
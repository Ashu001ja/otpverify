const express = require('express');
const PORT= process.env.PORT || 3000;
const nodemailer = require('nodemailer'); // Use nodemailer for sending emails
const crypto = require('crypto'); // For generating random OTP
const OtpModel=require('./model/model');
const connectDB = require('./db/db');
const cron = require('node-cron');
const app = express();

app.use(express.json());



app.get("/",(req,res)=>{
    res.send("Welcome to the API!");
});

app.post('/sendOtp', async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email input
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now

        // Check if an OTP already exists for the email
        const existingOtp = await OtpModel.findOne({ email });
        if (existingOtp) {
            // Update the existing OTP
            existingOtp.otp = otp;
            existingOtp.expiry = expiry;
            await existingOtp.save();
            console.log(`Updated OTP for ${email}: ${otp}`);
        } else {
            // Store new OTP in the database
            const newOtp = await OtpModel.create({ email, otp, expiry });
            console.log(`Created new OTP for ${email}: ${newOtp.otp}`);
        }

        // Send OTP via email
        // ... (nodemailer logic remains the same)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'hanzira45@gmail.com', // Replace with your email
                pass: 'myvnjyugczbmfkvc' // Replace with your app password
            }
        });

        const mailOptions = {
            from: 'ashwanijangra45@gmail.com', // Replace with your email
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}. It is valid for 5 minutes.`
        };

        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
        res.status(200).json({ message: 'OTP sent successfully' });

    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post('/verifyOtp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        // Find the OTP record in the database
        const record = await OtpModel.findOne({ email });
        console.log(`Verifying OTP for ${email}:`, record);

        if (!record) {
            return res.status(400).json({ success: false, message: "OTP not found" });
        }

        // Check if OTP is expired
        if (Date.now() > record.expiry) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Check if OTP matches
        if (record.otp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // OTP is valid, delete the OTP record from the database
        await OtpModel.deleteOne({ email });
        console.log(`Deleted OTP record for ${email}`);

        // Respond to the client
        res.status(200).json({ success: true, message: "OTP verified successfully" });

    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});  
const StartServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
};

StartServer();
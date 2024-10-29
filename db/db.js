require('dotenv').config();
const mongoose = require('mongoose');
const URL=process.env.MONGODB;
const connectDB =()=>{
    mongoose.connect(URL).then(()=>{
        console.log('Connect');
    });
};

module.exports=connectDB;

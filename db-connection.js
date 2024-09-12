require('dotenv').config();
const mongoose = require('mongoose');

const db = mongoose.connect('mongodb+srv://jong:' + process.env.PW + '@cluster0.9kfjt.mongodb.net/fcc-messageboard?retryWrites=true&w=majority&appName=Cluster0');

module.exports = db;
const express = require('express');
const Thing = require('./models/thing');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const mongoose = require('mongoose');
const path = require('path');
const connectDB = require('./config/db');
const dotenv = require('dotenv').config();



connectDB();




const app = express();
app.use(express.json());



app.use((req, res, next) => {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);
app.patch('/:id/', sauceRoutes)

app.use('/images', express.static(path.join(__dirname, 'images')));


module.exports = app;


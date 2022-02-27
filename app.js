const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const errorMiddleware = require("./middleware/error");
const fileUpload = require("express-fileupload");
const bodyParser = require("body-parser");

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true
}));
//Route import
// const product = require('./routes/productRoute.js');
const userRoute = require('./routes/userRoute');
const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
 
// app.use('/api/v1', product);
app.use('/api/v1', userRoute);
app.use('/api/v1', categoryRoute);
app.use('/api/v1', productRoute);

// Middleware for Errors
app.use(errorMiddleware);

module.exports = app
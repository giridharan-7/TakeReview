const express = require('express');
const cros = require('cros');
const webRouter = require('./routes/account');
const reviewRouter = require('./routes/profile');


const app = express();

app.use(cros());

app.use(express.json());

app.use("/", webRouter);
app.use("/", reviewRouter);
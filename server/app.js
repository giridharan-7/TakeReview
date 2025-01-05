const express = require('express');
const cors = require('cors');
const webRouter = require('./routes/account');
const reviewRouter = require('./routes/profile');

const sequelize = require('./db');

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", webRouter);
app.use("/", reviewRouter);

app.listen(3000, () => {
    console.log("Server running on the port 3000")

    sequelize.authenticate()
        .then(() => console.log("Database is connected successfully"))
        .catch((error) => console.log("Error while connecting to the database", error))
})
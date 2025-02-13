const express = require('express');
const cors = require('cors');
const webRouter = require('./routes/account');
const reviewRouter = require('./routes/profile');
const {sequelize} = require('./models/db.js')
const watchQueue = require('./queue/queueWatcher.js')

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", webRouter);
app.use("/api/v1/profile", reviewRouter);

app.listen(3000, () => {
    console.log("Server running on the port 3000")
    watchQueue()
    sequelize.authenticate()
        .then(() => console.log("Database is connected successfully"))
        .catch((error) => console.log("Error while connecting to the database", error))
})
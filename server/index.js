const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const connectdb = require('./config/db')
const logger = require('morgan');
require('./scheduledTasks/noShowDetection');

//env config
dotenv.config();

//mongodb connection
connectdb();

//rest objects
const app = express();

//middlewares
app.use(cors({
    origin: process.env.FRONT_URI,
    credentials: true
}))

app.use(express.json())
app.use(logger('dev'));


// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/notifications', require('./routes/notifications'));

//port

const port = process.env.PORT || 5000


//listen
app.listen(port, () => {
    console.log(`server start on port ${port}`)
})
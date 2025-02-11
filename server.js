const express = require("express");
const mongoose = require("mongoose");
const Job = require("./model/jobHandler");
const { MONGO_URI } = require("./config/config");
const connectDB = require('./utils/db')
const helmet = require('helmet')
const compression = require('compression')
const jobRoute = require('./routes/jobRoutes')
const app = express();
app.use(express.json());
app.use(helmet())
app.use(compression())


app.use('/api/v1',jobRoute)

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

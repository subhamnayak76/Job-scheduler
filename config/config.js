require("dotenv").config();

module.exports = {
  MONGO_URI: 'mongodb://127.0.0.1:27017/job-scheduler',
  REDIS_HOST: "localhost",
  REDIS_PORT:  6379,
};


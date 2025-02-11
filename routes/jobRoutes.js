const express = require('express');
const router = express.Router();
const limiter = require('../middleware/rateLimit')
const jobController = require('../controllers/jobController')

router.post('/create-job',limiter,jobController.createJob)


module.exports = router
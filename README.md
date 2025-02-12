# Distributed Job Scheduler System

## Overview
This project is a distributed job scheduling system built with **Node.js, BullMQ, Redis, MongoDB, and Docker**. It allows users to schedule jobs (such as sending emails) to be executed at a specific time. The system ensures that jobs execute **only once** even in a distributed environment, handling worker crashes and concurrency efficiently.

## Features
- **Job Scheduling**: Users can schedule tasks for future execution.
- **Distributed Execution**: Ensures a job runs only once, even across multiple workers.
- **Fault Tolerance**: If a worker crashes, another worker picks up the pending job.
- **Concurrency Handling**: Prevents duplicate execution of jobs.
- **Efficiency**: Handles a large number of scheduled jobs efficiently.

## System Architecture
The system consists of:
1. **API Server** (`server.js`): Handles job creation requests.
2. **Job Queue** (`BullMQ` & `Redis`): Manages job execution.
3. **Worker Service** (`worker.js`): Processes jobs and prevents duplicate execution using **Redlock (distributed locking)**.
4. **Watcher Service** (`watcher.js`): Checks pending jobs and schedules them in the queue.
5. **Database** (`MongoDB`): Stores job details.
6. **Docker**: Runs MongoDB and Redis as containers for easier deployment.

---

## Setup and Installation
### 1. Clone the Repository
```bash
git clone https://github.com/your-repo/job-scheduler.git
cd job-scheduler
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup MongoDB and Redis Using Docker
Open docker Desktop and Run the following command to start  **Redis** 
```bash
docker run --name my-redis -p 6379:6379 -d redis
```
For mongodb 
```bash
docker run -d --name mongodb -p 27017:27017 -v mongodata:/data/db mongo:latest
```
This will start MongoDB and Redis in the background.

### 4 . Adding User And App Password for node mailer 
Go to your google account . Then go security search for app password .Create App password to use in nodemailer . And user is your email_id
```bash
user : email_id
pass : your_APP_PASS
```
### 5. Add mongodb url in config_file
```
MONGO_URI=mongodb://127.0.0.1:27017/job-scheduler

```

### 5. Start the Application
Run the server:
```bash
npm run dev
```
Run the job watcher:
```bash
cd service
node watcher.js
```
Run the worker service:
```bash
cd service
node worker.js
```
To Scale multiple worker use
```bash
node worker.js
node worker.js
node worker.js
```
---

## API Endpoints
### 1. Create a Job (Schedule Task)
### time should be is this format 2025-02-12T12:47:00
**Endpoint:** `POST /api/v1/create-job`

**Request Body:**
```json
{
  "type": "email",
  "data": {
    "to": "user@example.com",
    "subject": "Scheduled Email",
    "message": "This is a test email."
  },
  "scheduledTime": "2025-02-12T12:47:00"
}
```

**Response:**
```json
{
    "success": true,
    "job": {
        "type": "email",
        "data": {
            "to": "email_id",
            "subject": "subject ",
            "message": "test message"
        },
        "status": "pending",
        "scheduledTime": "2025-02-12T07:17:00.000Z",
        "_id": "67ac4aa3cf3d9d990bd9f22fm",
        "createdAt": "2025-02-12T07:15:47.787Z",
        "__v": 0
    }
}
```

### 2. Get All Jobs
**Endpoint:** `GET /api/v1/jobs`

### 3. Get Job by ID
**Endpoint:** `GET /api/v1/job/:id`

---

## How the System Works
1. **A user schedules a job** via API (`/api/v1/create-job`).
2. **The job is stored in MongoDB** with a `pending` status.
3. **The watcher (`watcher.js`) runs every minute** and checks for jobs that need to be executed.
4. **Pending jobs are added to the Redis job queue (`BullMQ`)**.
5. **The worker (`worker.js`) processes the job**, sending an email if required.
6. **The worker updates the job status** to `completed` in MongoDB.
7. **If a worker crashes**, another worker picks up the pending jobs using Redis-based locking.

---

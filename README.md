# A Push Notification System

A NestJS backend module for sending immediate and scheduled push notifications to users.

## Features

- 📨 Send instant push notifications to all users
- ⏱ Schedule notifications for future delivery
- 👥 Mock user database with device tokens
- 🔄 Uses Bull + Redis for job scheduling
- ✅ Input validation with class-validator
- 🔥 Optional Firebase Cloud Messaging (FCM) integration

## Tech Stack

- **Backend Framework**: NestJS
- **Job Queue**: Bullmq with Redis
- **Push Notifications**: Firebase Cloud Messaging (or console simulation)
- **Validation**: class-validator, class-transformer

## Prerequisites

- Node.js (v16+)
- Redis server (for job queue)
- Firebase project (if using FCM)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Sujaur312998/sara_tech.git
cd sara_tech
npm install
```
2. Firebase Cloud Messaging (FCM)
   - **Create an project on Firebase**
   - **Navigate to project settings > Service accounts**
   - **Click Generate new private key**
   - **you will find a josn file in your download folder**
   - **Place the json file to main project folder**

3. Configure Environment (.env.development)
```bash
PORT=3000
DB_HOST=****
DB_PORT=****
DB_USERNAME=****
DB_PASSWORD=*****
DB_NAME=*****
firebase=********************.json
REDIS_HOST=*****
REDIS_PORT=*****
```
if you wana run through docker DB_HOST and REDIS_HOST set those value

```bash
DB_HOST=nestjs_db
REDIS_HOST=redis

```
and simply run docker cmd 
```bash
docker compose up
```
4. Database Setup
   -*Ensure PostgreSQL and Redis are running*
6. Running the Application
   Start the development server:
   ```bash
    npm run start:dev
   ```
7. Seed Database (Optional)
   - To generate 40,000 mock users with device tokens:
     ```bash
      npm run seed
     ```
8. API Documentation
   - Access Swagger UI at:
```bash
http://localhost:3000/api
```
   - Available Endpoints
       1. POST /push/send-now
         -**Sends notification to all users immediately**
       2. POST /push/schedule
          -**Schedules notification for future deliverye**

## Architecture Overview

The system follows a distributed architecture with these core components:

1. **Database Layer**  
   - *PostgreSQL*: Stores all user data including device tokens and notification metadata

2. **API Layer**  
   - *RESTful Endpoints*:  
     - `/push/send-now` - For immediate notifications  
     - `/push/schedule` - For scheduled notifications  
   - *Validation*: Uses `class-validator` for request validation

3. **Queue Layer**  
   - *Redis*: Serves as the backing store for BullMQ queues  
   - *BullMQ*: Manages job queues with:  
     - Immediate processing queue  
     - Scheduled/delayed queue  

4. **Worker Layer**  
   - *Notification Workers*:  
     - Process jobs from BullMQ queues  
     - Handle retries and failures  
     - Maintain concurrency control  

5. **Delivery Layer**  
   - *Firebase Cloud Messaging (FCM)*:  
     - Handles actual push notification delivery  
     - Provides delivery receipts and analytics  
   - *Fallback Mechanism*: (Optional) Webhook for failed deliveries

## Workflow

1. **Client Request**  
   - Makes request to either endpoint (`/push/send-now` or `/push/schedule`)

2. **Request Processing**  
   - Request is validated using `class-validator`
   - Payload is transformed using `class-transformer`

3. **Job Queueing**  
   - Notification job is added to Redis queue via BullMQ

4. **Job Processing**  
   - BullMQ worker picks up the job:
     - For **immediate notifications**: Processes immediately
     - For **scheduled notifications**: Processes at the scheduled time

5. **Notification Delivery**  
   - Worker sends the notification via Firebase Cloud Messaging (FCM)
   - Delivery status is logged for monitoring


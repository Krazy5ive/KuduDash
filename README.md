# KuduDash

A campus food ordering platform for students to order from vendors, with admin oversight.

![codecov](https://codecov.io/github/Krazy5ive/KuduDash/branch/main/graph/badge.svg)
![Node.js](https://img.shields.io/badge/Node.js-18-green)
![React](https://img.shields.io/badge/React-18-blue)

---

## Table of Contents
- [Overview](#overview)
- [Contributors](#contributors)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Tests & Coverage](#tests--coverage)
- [Deployment](#deployment)

---

## Overview
KuduDash is a full-stack web application that allows students to browse menus, place orders, and make payments. Vendors can manage their menus and track orders, while admins oversee the entire platform. The problem it addresses is straightforward: food courts (like those in the Matrix) experience long queues during peak hours, causing students to miss classes or skip meals, while vendors have no centralised system to manage orders or track demand. The solution is a multi-vendor online ordering platform that lets students browse menus, place orders, and collect food with minimal wait time.

---

## Contributors
- [Makoena Mabotja](https://github.com/Koenas-sally) - 2768898 | 2768898@students.wits.ac.za
- [Sazi Kubheka](https://github.com/TheGeekedNerd) - 2553981 | 2553981@students.wits.ac.za
- [Rotondwa Ratshilumela](https://github.com/Rotondwar) - 2579526 | 2579526@students.wits.ac.za
- [Gabriel Behane](https://github.com/thabogabe) - 2607061 | 2607061@students.wits.ac.za
- [Panashe Maunganidze](https://github.com/Panaashe) - 2725508 | 2725508@students.wits.ac.za

---

## Features
- Student dashboard — browse menus, cart, checkout, order tracking
- Vendor dashboard — menu management, order management, earnings
- Admin dashboard — platform oversight
- Payment integration
- Student/Vendor reviews
- Vendor/Admin appeal system with email notification

---

## System Architecture
The app is built using the MERN stack - MongoDB, Express, React, and Node.js. Specific technology stacks for the frontend and backend are given below.

### Frontend
- React 18+ with functional components and hooks
- React Router for client-side navigation

### Backend
- Node.js with Express.js framework
- MongoDB with Mongoose ORM

### External Services
- Auth0 for user authentication
- Payfast for payment processing
- Vercel for frontend deployment
- Azure for backend hosting

The system follows a client-server architecture. Clients interact with the frontend and send requests to the backend through exposed API endpoints. The server receives these requests, fetches data from the MongoDB database, and returns the data to the frontend for the client to use.

---

## Project Structure

```
KuduDash/
├── backend/      # Node.js/Express API
│   ├── app.js
│   ├── server.js
│   └── src/
│       ├── controllers/      # Business logic
│       ├── models/           # Database models
│       ├── routes/           # API routes
│       ├── middleware/       # Auth middleware
│       └── tests/            # Jest test suites
└── frontend/                 # React application
    └── src/
        ├── Dashboards/       # Admin, Student, Vendor dashboards
        ├── Cart/             # Cart & Checkout
        └── payment/          # Payment & Vendor Earnings          
```
---

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn
- MongoDB v6+ (local or Atlas)
- Auth0 account and credentials
- Payfast merchant account (sandbox for development)

### Environment Variables
In the backend directory, create a `.env` file with the following variables:
```
PORT=5000

# Database
MONGO_URI=<your-mongo-uri>

# Auth0
AUTH0_DOMAIN=<your-auth0-domain>
AUTH0_AUDIENCE=<your-auth0-audience>

# Admin registration
ADMIN_SECRET_CODE=<your-admin-code>

# PayFast credentials (sandbox)
PF_MERCHANT_ID=<your-merchant-id>
PF_MERCHANT_KEY=<your-merchant-key>
PF_PASSPHRASE=<your-passphrase>

# CORS
FRONTEND_URL=<your-vercel-frontend-url>

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASS=<your-app-password>
ADMIN_EMAIL=<your-admin-email>
```

In the frontend directory, create a `.env` file with the following variables:
```
REACT_APP_AUTH0_DOMAIN=<your-auth0-domain>
REACT_APP_AUTH0_CLIENT_ID=<your-auth0-client-id>
REACT_APP_AUTH0_AUDIENCE=<your-auth0-audience>

REACT_APP_API_URL=<your-azure-backend-url>
PORT = 3000
```

#### Setup For Local Development

##### 1.Clone the Repository
```bash
git clone https://github.com/Krazy5ive/KuduDash.git
cd KuduDaash
```
#### 2. Install the dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

#### 3. Start Development Servers

Start the backend server
```bash
# Start backend server
cd backend
npm run dev
# or
npm start 
# Alternatively, use node server.js instead of npm run dev
```
Now, in a separate terminal, start the frontend server
```bash
# Start frontend server
cd frontend
npm start
```
#### 4. Visit Site
- Frontend is hosted at `localhost:3000` by default

## Tests & Coverage
Test Driven Development has been implemented, using the Jest testing framework.

The code coverage achieved by all the tests is 98%.

![codecov](https://codecov.io/github/Krazy5ive/KuduDash/branch/main/graph/badge.svg)

### Coverage Breakdown

![coverage icicle](https://codecov.io/github/Krazy5ive/KuduDash/graphs/icicle.svg?token=3L93PKIEPK)

### Running Tests
```bash
cd backend
npm test
```

Test files are located in `backend/src/tests/` and cover:
- Admin, Student, Vendor controllers
- Cart, Order, Payment controllers
- Menu item and review controllers
- Appeal and Analytics controllers
- Menu Availabitlity, Menu Allergens functioons
- Auth routes 

---

## Deployment 
This application has been deployed using both Azure services and Vercel. It can be accessed from this URL: https://kudu-dash.vercel.app

---

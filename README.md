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
├── .github/
│   └── workflows/
│       ├── coverage.yml                    # Runs Jest & uploads coverage reports to Codecov on push
│       └── main_kududash.yml               # CI/CD pipeline that builds & deploys the app to Azure
│
├── backend/                                # Node.js/Express REST API
│   ├── server.js                           # HTTP server entry point — binds Express app to a port
│   ├── app.js                              # Express app setup — registers middleware, routes & CORS
│   ├── package.json                        # Backend dependencies & npm scripts (start, test, dev)
│   │
│   └── src/
│       ├── controllers/                    # Business logic layer — handles requests & responses
│       │   ├── adminController.js          # Admin CRUD — manage users, vendors & platform settings
│       │   ├── analyticsController.js      # Aggregates sales, order volume & revenue data for vendors
│       │   ├── appealController.js         # Handles vendor/student appeals & triggers email notifications
│       │   ├── cartController.js           # Add, update & remove items from a student's cart
│       │   ├── menuItemController.js       # Vendor menu CRUD — create, edit, delete & toggle items
│       │   ├── orderController.js          # Place orders, update order status & fetch order history
│       │   ├── paymentController.js        # Generates PayFast payment requests & handles callbacks
│       │   ├── reviewController.js         # Submit & retrieve student reviews for vendors
│       │   ├── studentController.js        # Student profile management & account operations
│       │   └── vendorController.js         # Vendor profile management & account operations
│       │
│       ├── models/                         # Mongoose schemas — define MongoDB document structure
│       │   ├── Admin.js                    # Admin schema — stores admin credentials & role flags
│       │   ├── Appeal.js                   # Appeal schema — stores appeal content, status & timestamps
│       │   ├── Cart.js                     # Cart schema — stores a student's active cart & line items
│       │   ├── MenuItem.js                 # Menu item schema — name, price, category, allergens & availability
│       │   ├── Order.js                    # Order schema — items ordered, totals, status & student reference
│       │   ├── Review.js                   # Review schema — star rating, comment, student & vendor references
│       │   ├── Student.js                  # Student schema — profile info, Auth0 ID & order history refs
│       │   └── Vendor.js                   # Vendor schema — store name, profile info & Auth0 ID
│       │
│       ├── routes/                         # Express routers — map HTTP endpoints to controllers
│       │   ├── auth.routes.js              # Auth endpoints — register & sync Auth0 users on first login
│       │   ├── adminRoutes.js              # /api/admin/* — admin-only platform management endpoints
│       │   ├── appealRoutes.js             # /api/appeals/* — submit & resolve appeal requests
│       │   ├── cartRoutes.js               # /api/cart/* — cart read & write endpoints
│       │   ├── menuItemRoutes.js           # /api/menu/* — menu item CRUD & availability toggle
│       │   ├── orderRoutes.js              # /api/orders/* — place, update & retrieve orders
│       │   ├── paymentRoutes.js            # /api/payment/* — initiate payments & receive PayFast ITN
│       │   ├── reviewRoutes.js             # /api/reviews/* — submit & fetch vendor reviews
│       │   ├── studentRoutes.js            # /api/students/* — student profile read & update endpoints
│       │   └── vendorRoutes.js             # /api/vendors/* — vendor profile read & update endpoints
│       │
│       ├── middleware/
│       │   └── auth.js                     # Validates Auth0 JWT on protected routes; rejects bad tokens
│       │
│       └── __tests__/                      # Jest unit & integration test suites (98% coverage)
│           ├── adminController.test.js      # Tests admin user management & platform control logic
│           ├── analyticsController.test.js  # Tests revenue aggregation & sales data calculations
│           ├── appealController.test.js     # Tests appeal submission, status updates & email triggers
│           ├── auth.routes.test.js          # Tests Auth0 user registration & login sync endpoints
│           ├── cartController.test.js       # Tests add, update, remove & fetch cart operations
│           ├── menuItemAllergens.test.js    # Tests allergen filtering & allergen field validation
│           ├── menuItemAvailability.test.js # Tests toggling item availability on & off
│           ├── menuItemController.test.js   # Tests full menu item CRUD operations
│           ├── orderController.test.js      # Tests order placement, status transitions & retrieval
│           ├── paymentController.test.js    # Tests PayFast payload generation & ITN callback handling
│           ├── Reviewcontroller.test.js     # Tests review submission, retrieval & validation rules
│           ├── studentController.test.js    # Tests student profile creation & update operations
│           └── vendorController.test.js     # Tests vendor profile creation & update operations
│
└── frontend/                               # React 18 single-page application
    ├── package.json                        # Frontend dependencies & scripts (start, build, test)
    ├── public/
    │   └── index.html                      # HTML shell — root div where React mounts
    │
    └── src/
        ├── App.js                          # Root component — defines all client-side routes via React Router
        ├── index.js                        # React DOM entry point — renders App into index.html
        ├── api.js                          # Axios instance — sets base URL & attaches Auth0 token to requests
        ├── ProtectedRoute.js               # HOC that redirects unauthenticated users to the login page
        ├── Login.js                        # Login page — triggers Auth0 Universal Login redirect
        ├── Callback.js                     # Handles Auth0 redirect after login & syncs user to the backend
        ├── Vibe.js                         # Public landing page — app intro shown before login
        │
        ├── Dashboards/                     # Role-specific dashboard views
        │   ├── Student.js                  # Student dashboard — browse vendor menus & add items to cart
        │   ├── Vendor.js                   # Vendor dashboard — view store overview & navigate to tools
        │   ├── Admin.js                    # Admin dashboard — view & manage all users and vendors
        │   ├── OrderManagement.js          # Vendor view — manage incoming orders & update their status
        │   ├── OrderTracking.js            # Student view — track live status of placed orders
        │   ├── ProfilePanel.js             # Shared slide-in panel for viewing & editing user profiles
        │   └── Analytics.js               # Vendor view — charts & tables for sales & revenue analytics
        │
        ├── Cart/                           # Shopping cart feature
        │   ├── CartContext.js              # React Context — global cart state shared across all components
        │   ├── Cart.js                     # Cart page — displays items, quantities & order total
        │   └── Checkout.js                 # Checkout page — confirms order details & initiates payment
        │
        ├── payment/                        # Payment feature
        │   ├── Payment.js                  # Builds & submits the PayFast payment form on checkout
        │   └── VendorEarnings.js           # Vendor earnings page — lists completed payments & totals
        │
        ├── ReviewForm.js                   # Form for students to submit a star rating & comment for a vendor
        └── VendorReviews.js                # Displays all reviews received by a vendor with ratings summary
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
# Alternatively, use npm run dev
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

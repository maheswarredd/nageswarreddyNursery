# 🌿 Nageswarreddy Nursery Plants

> Complete, professional, production-ready MERN stack e-commerce plant nursery marketplace dedicated entirely to selling essential and commonly useful living plants.

---

## 🌟 Highlights & Key Features

- **Client**: Modern React.js with Vite, Tailwind CSS, Lucide icons, Canvas Confetti, and Mobile-first responsive UI.
- **Server**: Node.js & Express.js REST API with rate limiting, helmet security, and CORS protection.
- **Database**: MongoDB Atlas with Mongoose ODM, indexes, and automated stock-availability synchronization.
- **Authentication**: JWT token authorization, bcrypt password hashing, role-based protection (`customer` & `admin`).
- **Storefront & Catalog**:
  - Categories: *Indoor Plants, Outdoor Plants, Flowering Plants, Fruit Plants, Medicinal Plants, Vegetable Plants, Ornamental Plants, Succulents & Cactus, Herbs, Native Plants, Balcony Plants*.
  - Botanical Profiles: Name, Category, High-res images, Age, Approximate height, Pot size, Sunlight requirements, Watering requirements, Soil mix, Growing instructions, Benefits pills, Planting season, and Safe delivery info.
  - Automatic **SOLD OUT** logic: When stock reaches 0, the plant is flagged as Sold Out, buttons are disabled, and server-side validation strictly prevents ordering or exceeding stock.
- **Payment Gateway**:
  - **Cash on Delivery (COD)**.
  - **Online / UPI Payment**: Generates dynamic QR code and displays admin UPI ID. Customer submits payer name and mandatory 12-digit UTR/transaction reference. Payments remain strictly unverified until nursery admin approves them against bank statements.
- **Admin Control Panel**:
  - Protected with environment credentials (`ADMIN_EMAIL` & `ADMIN_PASSWORD`).
  - Real-time Dashboard with KPI cards: *Total Plants, Available, Sold Out, Total Orders, Pending, Accepted, Delivered, Cancelled, Sales Revenue, Pending Payments, Completed Payments, Refunds, Low-Stock alerts*.
  - 13 Dedicated Modules: Dashboard, Plants, Categories, Orders, Payments, Customers, Delivery & Delays, Queries, Notifications, Reviews, Coupons, Reports, Email Logs, Settings.
- **Customer Support Ticketing**:
  - Support ticket system for damaged plants, order delays, botanical questions, cancellation, or refunds.
  - Status management: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`.
- **Verified Customer Reviews**:
  - Reviews can only be submitted by verified buyers who have received a `DELIVERED` order for that specific plant.
- **Order Delay & Rescheduling**:
  - Admin can select delay reasons (weather, plant preparation, transport, address issue, high volume, stock, other), set revised expected delivery date, and notify customer.
- **Web Push Notifications (VAPID)** & **In-App Notification Center**:
  - Unread badge counter, order status push alerts, back-in-stock alerts, and admin broadcast alerts.
- **Transactional Emails (Brevo)**:
  - Branded nursery HTML templates for registration, order placed, payment submitted, payment verified, payment rejected, order accepted, delays, out for delivery, delivery confirmation, and cancellation.
- **Professional Invoices**:
  - Printable tax invoices formatted with nursery details, customer address, plant specifications, rates, and payment verification tags.
- **PWA Ready**:
  - Installable Progressive Web App with `manifest.json`, Service Worker caching (`sw.js`), and offline resilience.

---

## 📁 Project Directory Structure

```
nageswarreddy-plants/
├── client/                     # React + Vite Frontend
│   ├── public/
│   │   ├── favicon.svg         # Nursery Leaf Icon
│   │   ├── manifest.json       # PWA Manifest
│   │   └── sw.js               # Service Worker & Web Push Handler
│   ├── src/
│   │   ├── components/         # Navbar, Footer, PlantCard, Filter, Modals, Badges
│   │   ├── context/            # AuthContext, CartContext, WishlistContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── Home.jsx        # Branding, Categories, Featured, Care Guide, FAQs
│   │   │   ├── Shop.jsx        # Catalog, Search, Filtering & Sorting
│   │   │   ├── PlantDetail.jsx # Botanical Specs, Sold-out logic, Verified Reviews
│   │   │   ├── Cart.jsx        # Free delivery progress bar, Coupons
│   │   │   ├── Checkout.jsx    # Complete address form, UPI/COD selection
│   │   │   ├── OrderSuccess.jsx# Confetti, Order Summary, UPI payment modal
│   │   │   ├── Profile.jsx     # Saved delivery addresses manager
│   │   │   ├── MyOrders.jsx    # Track orders, Cancel order, Print invoice
│   │   │   ├── Wishlist.jsx    # Back-in-stock alerts
│   │   │   ├── SupportQueries.jsx# Ticket system & chat
│   │   │   ├── PlantCareGuide.jsx# Unboxing & potting instructions
│   │   │   ├── Login.jsx & Register.jsx
│   │   │   └── admin/          # 13 Dedicated Admin Sections
│   │   ├── utils/              # api.js, formatters.js, pushNotification.js
│   │   ├── App.jsx             # Main routing setup
│   │   ├── index.css           # Tailwind base & botanical styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── server/                     # Node.js + Express + Mongoose Backend
    ├── src/
    │   ├── config/             # MongoDB connection, VAPID setup
    │   ├── controllers/        # Auth, Plants, Orders, Payments, Queries, Reviews, etc.
    │   ├── middleware/         # Auth verifyToken, verifyAdmin, Rate limiters, Error handler
    │   ├── models/             # User, Plant, Category, Order, Review, Query, Coupon, etc.
    │   ├── routes/             # RESTful API route definitions
    │   ├── services/           # Brevo EmailService, WebPush Service, InvoiceService
    │   ├── seeds/seedData.js   # 40+ Nursery Plants, categories, settings & admin seed
    │   └── index.js            # Express application entrypoint
    ├── .env.example            # Environment variables template
    ├── .env                    # Local configuration
    └── package.json
```

---

## ⚙️ Environment Variables

Create `server/.env` with the following variables:

```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nageswarreddy-plants?retryWrites=true&w=majority
JWT_SECRET=nageswarreddy_necessary_plants_jwt_secret_secure_key_2026
CLIENT_URL=http://localhost:5173

# Admin Security Credentials
ADMIN_EMAIL=admin@nageswarreddyplants.com
ADMIN_PASSWORD=Admin@Nageswar123!

# Web Push VAPID Keys
VAPID_PUBLIC_KEY=BMr9fs1wMX3VKixTUWKWzpD3yrWwbaoYnFKLN7-c-3om3jNWFsXjiId_RVeJD3jVn-4wmA_qXAgxNyytlXGfOb0
VAPID_PRIVATE_KEY=9DDOCLn_IL_dJs9UsE58r-DfwDeVXje1YD-GI7m9FeM
VAPID_SUBJECT=mailto:support@nageswarreddyplants.com

# Brevo (Sendinblue) Transactional Emails
BREVO_API_KEY=xkeysib-your-real-brevo-api-key
BREVO_SENDER_EMAIL=support@nageswarreddyplants.com
BREVO_SENDER_NAME=Nageswarreddy Nursery Plants

# UPI Payment Configuration
UPI_ID=nageswarreddyplants@okaxis
UPI_NAME=Nageswarreddy Nursery Plants
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

In `server/`:
```bash
cd server
npm install
```

In `client/`:
```bash
cd client
npm install
```

### 2. Seed Necessary Botanical Catalog
Populates all categories, 40+ botanical plants, admin user, coupons, and store settings:
```bash
cd server
npm run seed
```

### 3. Run Backend Server
```bash
cd server
npm start
# Server listens on port 5000
```

### 4. Run Frontend Client
```bash
cd client
npm run dev
# Vite runs on http://localhost:5173
```

---

## 🔐 Admin Portal Access

- **URL**: [http://localhost:5173/admin](http://localhost:5173/admin)
- **Email**: `admin@nageswarreddyplants.com`
- **Password**: `Admin@Nageswar123!`

---

## ☁️ Deployment to Render & MongoDB Atlas

1. **MongoDB Atlas**:
   - Create a free Cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - Create a database user and whitelist IP `0.0.0.0/0`.
   - Copy connection string into `MONGODB_URI`.

2. **Backend Web Service on Render**:
   - Root directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Set all environment variables from `server/.env.example`.

3. **Frontend Static Site on Render**:
   - Root directory: `client`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Add Rewrite rule: `/*` -> `/index.html` (for client-side routing).

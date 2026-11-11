# BiteSync — Smart Hostel Canteen Pre-Ordering Platform

> **Tagline:** Skip the Queue. Sync Your Meal.  
> **Repository:** [https://github.com/Shreyanshu905/BiteSync](https://github.com/Shreyanshu905/BiteSync)  
> **Branch:** `feature/bitesync-development`

---

## 🍱 1. Product Overview

**BiteSync** is a modern, full-stack web application purpose-built for campus hostel canteens. It eliminates chaotic peak-hour counter queues by enabling students to browse the daily menu, pre-order meals ahead of time, select 15-minute pickup time windows, pay digitally via their student wallet or UPI, and collect their freshly prepared meal using a secure, cryptographically signed QR code or counter pickup token.

Behind the scenes, BiteSync empowers:
- **Kitchen Staff** with a real-time Kanban queue, automated item-wise preparation summaries per slot, and high-speed QR verification that strictly prevents duplicate collections.
- **Canteen Administrators** with end-to-end catalog management, slot capacity controls, ingredient inventory tracking with automated recipe deductions, low-stock warnings, and transparent statistical food demand forecasting to slash campus food wastage.

---

## 👥 2. Seeded Demo Accounts (1-Click Login Available)

For testing and demonstration, realistic Indian hostel canteen accounts are pre-seeded:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@bitesync.com` | `Password123` | **Aarav Sharma** (STU-2024-001) • Aryabhata Bhavan (₹650 balance) |
| **Kitchen Staff** | `kitchen@bitesync.com` | `Password123` | **Suresh Chef** (Head Cook) • Kitchen Queue & Counter Scanner |
| **Canteen Admin** | `admin@bitesync.com` | `Password123` | **Ramesh Kumar** (Canteen Manager) • Full Operations & Analytics |

> 💡 **Tip:** On the Sign In page, use the **⚡ Quick Demo Accounts (1-Click Login)** buttons to instantly authenticate as any role without typing.

---

## 🛠️ 3. Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS (Custom warm-food aesthetic: `#FFFDF9` cream background, `#FF5C38` primary coral accent, emerald badges)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Data Visualization:** Recharts (Sales trends, Demand forecasting, Waste analytics)
- **Real-time Engine:** Socket.IO Client
- **QR Code Engine:** `qrcode.react` (SVG Generation) & `html5-qrcode` (Integrated Counter Scanner)
- **Feedback:** React Hot Toast & Canvas Confetti

### Backend
- **Runtime:** Node.js & Express.js
- **Database:** MongoDB & Mongoose (supports remote/local MongoDB with seamless fallback to embedded `mongodb-memory-server` for zero-configuration testing)
- **Authentication:** JWT (JSON Web Tokens) with 30-day persistence & `bcryptjs` password hashing
- **Real-time Engine:** Socket.IO Server with targeted role & student rooms
- **Security & Integrity:** Node `crypto` HMAC-SHA256 signatures for QR payload verification

---

## 📱 4. Three Dedicated Role Interfaces

### A. Student Experience (`/student/*`)
1. **Home Dashboard:** Personalized greeting, live active meal period countdown (Breakfast, Lunch, Snacks, Dinner, Late-Night), active order radar widget with 1-click QR Pass, and hostel announcements.
2. **Digital Menu Catalog:** Filterable by Meal Category, Pure Veg / Non-Veg toggle, Price Range slider, and instant keyword search. Remaining stock badges ("Only 5 left!") and disabled "Sold Out" state.
3. **Cart & Slot Booking:** Quantity steppers, real-time subtotal, coupon code engine (`BITESYNC10`, `HOSTEL20`), cancellation deadline notice, and **15-minute pickup slot selector** with live capacity counters.
4. **Counter QR Pass & Token:** Displays cryptographically signed SVG QR code and human-readable 4-character pickup token (e.g. `TK-7A9B`).
5. **Live Order Tracking:** Multi-step timeline: `Placed` → `Accepted` → `Preparing` → `Ready for Pickup` → `Collected` with real-time Socket.IO synchronization.
6. **Student Digital Wallet:** Instant demo top-up (+₹100, +₹250, +₹500, +₹1000), transaction ledger, and automated order payment/refund handling.
7. **Meal Subscriptions & Passes:** 7-Day Weekly Mess Pass & 30-Day Monthly Full Board passes with remaining credit balances.
8. **Meal Skip Option:** Students mark upcoming meals as skipped to help the kitchen avoid over-preparing food.
9. **Community Credit Transfer:** Transfer meal credits to friends via Student ID.
10. **Hostel Mess Calendar:** 7-day recurring timetable for campus meals with special feast days highlighted.
11. **Group Meal Ordering:** Roommates create and join group orders using shareable codes (e.g. `GRP-4821`).

### B. Kitchen / Staff Experience (`/kitchen/*`)
1. **Live Chronological Queue:** Orders sorted by pickup slot time with student name, hostel room number, and order items.
2. **One-Click Workflow Transitions:** `Accept Order` → `Start Cooking` → `Mark Ready for Pickup`.
3. **Preparation Summary Sheet:** Aggregates required dish portions for upcoming slots (e.g. "14 Veg Thali, 8 Masala Dosa, 12 Chai needed").
4. **Integrated QR Scanner Terminal:** Camera QR scanner (`html5-qrcode`) with fallback manual token entry.
5. **Strict Duplicate Collection Prevention:** Atomically stamps orders as `collected`. Second scans are immediately rejected with an auditory and visual warning banner.
6. **Ready Orders Board:** Public counter screen displaying tokens ready for immediate pickup.
7. **Kitchen Delay Reporting:** Broadcasts delay notices to affected students in real time.

### C. Canteen Admin Panel (`/admin/*`)
1. **Executive Overview:** Today's revenue, order counts, pending orders, low-stock warnings, and active student metrics.
2. **Interactive Recharts Trends:** 7-day sales and order volume area charts.
3. **Menu Catalog Management:** Full CRUD for dishes, image URL, category, stock limits, low-stock alerts, and 1-click availability toggle.
4. **Pickup Slot Capacity Controls:** Adjust max capacity per slot and close/re-open slots for crowd management.
5. **Inventory & Recipe Linkages:** Track ingredients (Basmati rice, paneer, milk, atta, etc.), record restocks, and monitor automatic consumption.
6. **Statistical Food Demand Prediction:** Moving-average and slot-weighted projection of tomorrow's dish demand with a 10% safety buffer and ingredient procurement needs.
7. **Food Waste Reduction Analytics:** Compares planned demand vs prepared quantity vs sold quantity vs actual collections.
8. **No-Show Detection:** Monitors uncollected orders past the pickup window without penalizing students.
9. **Hostel Announcements & Coupons:** Create campus-wide or hostel-specific discounts and announcements.
10. **Staff Account Management:** Add kitchen staff, activate/deactivate accounts, and manage permissions.

---

## 🛡️ 5. Mandatory Business Rules & Edge Cases Handled

1. **Slot Capacity Enforcement:** A full pickup slot atomically rejects further bookings. Concurrency is handled using MongoDB atomic `$expr: { $lt: ['$currentBookings', '$maxCapacity'] }` increments.
2. **Sold-Out Prevention:** Items marked `isAvailable: false` or with `stockQuantity <= 0` cannot be added to cart or checked out.
3. **Unique Cryptographic Tokens:** Every order generates a unique `orderNumber` (`BS-XXXXX`), a counter token (`TK-XXXX`), and an HMAC-SHA256 signed QR payload.
4. **Duplicate Collection Prevention:** Once an order is marked `collected`, repeat QR scans are rejected.
5. **Cancellation & Refund Policy:** Pre-orders can be cancelled by students up to 15 minutes before the pickup slot begins, triggering an immediate wallet refund and restoring inventory and slot capacity.
6. **Backend Payment Verification:** Payments are validated and recorded on the backend before order confirmation.
7. **Non-Negative Inventory:** Ingredient stocks are decremented based on confirmed order recipes.

---

## 🚀 6. Installation and Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended; developed on v24)
- npm (v9 or higher)

### Step 1: Clone the Repository
```bash
git clone https://github.com/Shreyanshu905/BiteSync.git
cd BiteSync
git checkout feature/bitesync-development
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### Step 3: Seed Database with Demo Canteen Data
```bash
npm run seed
```
*(Automatically populates dishes, inventory, pickup slots, announcements, meal plans, and demo accounts).*

### Step 4: Run the Application
In two separate terminal windows:

**Terminal 1 (Backend API & Real-time Socket Server):**
```bash
cd backend
npm start
# Server starts on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to use BiteSync.

---

## 🧪 7. Running Automated Tests

BiteSync includes a suite of automated unit and end-to-end integration tests using Node.js native test runner:

```bash
cd backend
npm test
```

### Test Suite Coverage:
- `✔ Token Generator creates valid format orderNumber and pickupToken`
- `✔ QR Payload Signing and HMAC Verification`
- `✔ 1. Student Registration & Initial Wallet Balance`
- `✔ 2. Menu Item & Slot Capacity Control`
- `✔ 3. Place Order, Atomic Slot Increment & Wallet Deduction`
- `✔ 4. Kitchen Progresses Order to Ready`
- `✔ 5. Counter QR Scan & Collection`
- `✔ 6. CRITICAL RULE: Duplicate Collection Prevention`
- `✔ 7. Slot Capacity Limit Rejection`

---

## 🌐 8. API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register student account + ₹500 welcome credit
- `POST /api/auth/login` — Sign in (Student, Kitchen, Admin)
- `GET /api/auth/me` — Get authenticated user details & wallet balance
- `PUT /api/auth/profile` — Update hostel room & dietary preferences

### Menu Management (`/api/menu`)
- `GET /api/menu` — List dishes with category, veg, search, and price filters
- `GET /api/menu/:id` — Get single dish with recipe details
- `POST /api/menu` — Add new dish (Admin)
- `PUT /api/menu/:id` — Update dish (Admin)
- `PATCH /api/menu/:id/toggle-availability` — 1-click availability toggle
- `DELETE /api/menu/:id` — Delete dish (Admin)

### Pickup Slots (`/api/slots`)
- `GET /api/slots` — List slots with real-time remaining capacities
- `POST /api/slots` — Create pickup slot window (Admin)
- `PUT /api/slots/:id` — Update slot capacity (Admin)
- `PATCH /api/slots/:id/toggle-close` — Emergency close/reopen slot

### Orders (`/api/orders`)
- `POST /api/orders` — Place pre-order with atomic slot reservation & payment verification
- `GET /api/orders/my` — Get logged-in student's orders
- `GET /api/orders/:id` — Get order details with QR code & pickup token
- `POST /api/orders/:id/cancel` — Cancel before cutoff with instant wallet refund
- `PATCH /api/orders/:id/status` — Kitchen status progression (`accepted`, `preparing`, `ready`)
- `POST /api/orders/verify-pickup` — Verify counter QR / token & mark collected (Strict single-collection lock)
- `GET /api/orders/all` — Admin & Kitchen order queue with multi-filtering
- `POST /api/orders/:id/rate` — Submit 1-5 star food rating & review

### Kitchen Operations (`/api/kitchen`)
- `GET /api/kitchen/queue` — Active orders queue (`placed`, `accepted`, `preparing`)
- `GET /api/kitchen/ready` — Orders ready at pickup counter
- `GET /api/kitchen/summary` — Aggregated portion prep sheet per slot
- `POST /api/kitchen/report-delay` — Broadcast kitchen rush delay alert

### Student Wallet (`/api/wallet`)
- `GET /api/wallet` — Balance and transaction history
- `POST /api/wallet/topup` — Instant digital recharge (+₹100, +₹250, +₹500, +₹1000)

### Meal Subscriptions (`/api/meal-plans`)
- `GET /api/meal-plans` — Available subscription plans
- `POST /api/meal-plans/:id/subscribe` — Purchase weekly/monthly pass
- `GET /api/meal-plans/my-credits` — Remaining meal credits
- `POST /api/meal-plans/skip-meal` — Mark skipped meal to reduce kitchen waste
- `POST /api/meal-plans/transfer-credits` — Transfer meal credits to friend via Student ID

### Smart Analytics & Predictions (`/api/analytics`)
- `GET /api/analytics/overview` — Executive KPIs
- `GET /api/analytics/sales-trends` — 7-day and 30-day revenue trends
- `GET /api/analytics/dish-popularity` — Best-selling dishes & revenue
- `GET /api/analytics/demand-prediction` — Statistical demand forecasting model
- `GET /api/analytics/waste-reduction` — Food waste reduction report

---

## 📜 9. License

This project is licensed under the MIT License — designed and built for the Smart Hostel Canteen Pre-Ordering System.

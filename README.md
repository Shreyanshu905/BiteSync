# BiteSync — Smart Hostel Canteen Pre-Ordering Platform

> **Tagline:** Skip the Queue. Sync Your Meal.  
> **Repository:** [https://github.com/Shreyanshu905/BiteSync](https://github.com/Shreyanshu905/BiteSync)  
> **Branch:** `feature/java-backend-migration`  
> **Architecture:** React 18 (Vite) Frontend + **Java 21 & Spring Boot 3.3** OOPS Backend + MongoDB

---

## 🍱 1. Product Overview

**BiteSync** is a full-stack smart hostel canteen pre-ordering platform engineered with a **Java 21 + Spring Boot Object-Oriented Backend** and a modern **React + Tailwind CSS Frontend**.

It eliminates chaotic peak-hour counter queues by allowing students to browse the daily menu, pre-order meals ahead of time, select 15-minute pickup slots, pay digitally via Wallet/UPI/Online Gateway, and collect their freshly prepared food using cryptographically signed HMAC-SHA256 QR codes or pickup tokens.

### Academic OOPS Documentation
- 📘 **[JAVA_MIGRATION_PLAN.md](./JAVA_MIGRATION_PLAN.md)** — Architecture audit, migration phases, and API endpoint mapping.
- 🏛️ **[OOPS_CONCEPTS.md](./OOPS_CONCEPTS.md)** — Complete mapping of all 10 OOPS concepts & design patterns with exact file paths, code snippets, UML diagrams, and viva talking points.
- 🎓 **[VIVA_QUESTIONS.md](./VIVA_QUESTIONS.md)** — 32 project-specific viva questions and concise answers.

---

## 🏛️ 2. Java Backend Architecture & OOPS Highlights

The backend (`backend/`) follows a clean layered architecture:

```text
HTTP Request → Controller → Service → Repository → MongoDB
```

| OOPS Concept | Real BiteSync Implementation |
| :--- | :--- |
| **Encapsulation** | `Wallet` (non-negative balance & overdraft checks), `PickupSlot` (capacity & closed-slot lock), `MenuItem` (auto sold-out state), `Order` (anti-duplicate collection lock) |
| **Inheritance** | Abstract `User` base class extended by `Student`, `Admin`, and `KitchenStaff` with polymorphic MongoDB conversion (`MongoConfig`) |
| **Abstraction & Interfaces** | `PaymentMethod`, `DiscountStrategy`, `OrderProcessor`, `NotificationService`, abstract `User` |
| **Runtime Polymorphism** | `PaymentFactory` dispatches `WalletPayment`, `UpiPayment`, `OnlinePayment`, `MealCreditPayment`; `DiscountFactory` dispatches coupon strategies dynamically |
| **Method Overloading** | Overloaded `OrderService.placeOrder(...)` (2, 3, and 6 args) & `WalletService.credit(...)` (2 and 4 args) |
| **Method Overriding** | Role-specific `getIdentifier()`, `hasAdminPrivileges()`, `getDisplayRole()` across `User` subclasses |
| **Composition vs Aggregation** | `Order` composes `OrderItem`, `SlotDisplay`, `PaymentDetails`, `StatusTimestamps`; aggregates `Student` and `PickupSlot` |
| **Exception Handling** | Custom `BiteSyncException` hierarchy (`SlotFullException`, `InsufficientBalanceException`, `FoodUnavailableException`, `DuplicateCollectionException`, `CancellationExpiredException`, etc.) handled globally by `@RestControllerAdvice` (`GlobalExceptionHandler`) |
| **Collections & Generics** | Generic `ApiResponse<T>`, `HashMap`, `TreeMap`, `ArrayList`, `Optional<T>` |

> 📦 **Note:** The legacy Node.js backend is archived intact in [`backend-node/`](./backend-node/) for comparison.

---

## 👥 3. Seeded Demo Accounts (1-Click Login Available)

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@bitesync.com` | `Password123` | **Aarav Sharma** (STU-2024-001) • Aryabhata Bhavan |
| **Kitchen Staff** | `kitchen@bitesync.com` | `Password123` | **Suresh Chef** (Head Cook) • Kitchen Queue & Counter Scanner |
| **Canteen Admin** | `admin@bitesync.com` | `Password123` | **Ramesh Kumar** (Canteen Manager) • Full Operations & Analytics |

---

## 🛠️ 4. Technology Stack

### Backend (`backend/`)
- **Language:** Java 21 (Eclipse Temurin JDK 21)
- **Framework:** Spring Boot 3.3.5 (Spring Web, Spring Data MongoDB, Spring Security, Spring Validation)
- **Build Tool:** Apache Maven 3.9+
- **Database:** MongoDB (`mongodb://127.0.0.1:27017/bitesync`)
- **Authentication:** Stateless JWT (`jjwt` 0.12.6) + BCrypt Password Encoding + `@PreAuthorize` Role Guards
- **Security & Integrity:** `javax.crypto.Mac` HMAC-SHA256 QR payload signing (`HmacSigner`)
- **Testing:** JUnit 5 (`OopsConceptsTest`)

### Frontend (`frontend/`)
- **Framework:** React 18 with Vite (proxies `/api` → `http://localhost:5001`)
- **Styling:** Tailwind CSS (Warm food-inspired palette: `#FFFDF9`, `#FF5C38`)
- **Routing:** React Router v6
- **Charts & QR:** Recharts, `qrcode.react`, `html5-qrcode`, Lucide React, React Hot Toast

---

## 📱 5. Three Dedicated Role Interfaces

### A. Student Experience (`/student/*`)
- **Home Dashboard:** Active meal period, quick order tracker, hostel announcements, and featured dishes.
- **Digital Menu Catalog:** Filter by category (Breakfast, Lunch, Snacks, Dinner, Late-Night), Veg/Non-Veg, price range, and live stock availability.
- **Cart & 15-Minute Pickup Slot Booking:** Coupon discounts (`BITESYNC10`, `HOSTEL20`, `FLAT25`), capacity-checked slots, and polymorphic payment checkout.
- **Counter QR Pass & Order Tracking:** Cryptographically signed QR pass, human-readable counter token (`TK-XXXX`), and 15-minute cancellation window with instant refund.
- **Digital Wallet, Mess Calendar & Group Ordering:** Instant top-ups, transaction ledger, and roommate group order codes.

### B. Kitchen / Staff Experience (`/kitchen/*`)
- **Live Chronological Order Queue:** `Accept` → `Start Cooking` → `Mark Ready for Pickup`.
- **Preparation Summary Sheet:** Aggregated portion counts per dish.
- **QR Scanner Terminal & Duplicate Prevention:** Camera scanner + manual token verification that strictly blocks duplicate meal collection.

### C. Canteen Admin Panel (`/admin/*`)
- **Executive Analytics & Recharts Trends:** Today's revenue, 7-day trends, top dishes, demand forecasting, and waste analytics.
- **Menu, Inventory & Slot Controls:** Full CRUD, recipe-linked ingredient consumption, restock history, slot capacity overrides, announcements, and staff management.

---

## 🚀 6. Installation and Setup Instructions

### Prerequisites
- **Java 21 (JDK 21)** (`java -version`)
- **Apache Maven 3.9+** (`mvn -version`)
- **Node.js 18+** & npm (for React frontend)
- **MongoDB** running locally on port `27017`

### Step 1: Clone the Repository
```bash
git clone https://github.com/Shreyanshu905/BiteSync.git
cd BiteSync
git checkout feature/java-backend-migration
```

### Step 2: Build & Run the Java Spring Boot Backend
```bash
cd backend
mvn clean package
java -jar target/bitesync-backend-1.0.0.jar
# Backend API starts on http://localhost:5001
```
*(Or run directly with `mvn spring-boot:run`)*

### Step 3: Run the React Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 7. Running Automated Java OOPS Tests

```bash
cd backend
mvn test
```

### Verified Test Coverage (`OopsConceptsTest.java`)
- `✔ testUserInheritanceAndPolymorphism` — Validates `Student`, `Admin`, and `KitchenStaff` inheritance and overridden methods.
- `✔ testWalletAndSlotEncapsulationInvariants` — Validates non-negative wallet balance, overdraft rejection, and closed/full slot protection.
- `✔ testMenuItemStockLifecycle` — Validates stock deduction, automatic sold-out transition, and replenishment.
- `✔ testPolymorphicDiscountStrategies` — Validates runtime strategy selection for `BITESYNC10`, `HOSTEL20`, and `FLAT25`.
- `✔ testHmacQrSigningAndVerification` — Validates HMAC-SHA256 QR payload generation and tamper detection.

---

## 🌐 8. REST API Endpoints Reference

| Module | Base Path | Key Endpoints |
| :--- | :--- | :--- |
| **Health** | `/api/health` | `GET /api/health` |
| **Auth** | `/api/auth` | `POST /register`, `POST /login`, `GET /me`, `PUT /profile` |
| **Menu** | `/api/menu` | `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `PATCH /{id}/toggle-availability`, `DELETE /{id}` |
| **Pickup Slots** | `/api/slots` | `GET /`, `POST /`, `PUT /{id}`, `PATCH /{id}/toggle-close` |
| **Orders** | `/api/orders` | `POST /`, `GET /my`, `GET /all`, `GET /{id}`, `POST /{id}/cancel`, `PATCH /{id}/status`, `POST /verify-pickup`, `POST /{id}/rate` |
| **Kitchen** | `/api/kitchen` | `GET /queue`, `GET /ready`, `GET /summary`, `POST /report-delay` |
| **Wallet** | `/api/wallet` | `GET /`, `POST /topup`, `GET /transactions` |
| **Inventory** | `/api/inventory` | `GET /`, `GET /low-stock`, `POST /`, `PUT /{id}`, `POST /{id}/restock` |
| **Analytics** | `/api/analytics` | `GET /overview`, `GET /sales-trends`, `GET /dish-popularity`, `GET /demand-prediction`, `GET /waste-reduction` |
| **Announcements** | `/api/announcements` | `GET /`, `POST /`, `PUT /{id}`, `DELETE /{id}` |
| **Group Orders** | `/api/group-orders` | `POST /`, `GET /{code}`, `POST /{code}/join`, `POST /{code}/add-item` |
| **Notifications** | `/api/notifications` | `GET /`, `PATCH /{id}/read`, `POST /mark-all-read` |
| **Users (Admin)** | `/api/users` | `GET /students`, `GET /staff`, `POST /staff`, `PATCH /{id}/toggle-active` |

---

## 📜 9. License

This project is licensed under the MIT License — designed and built for the Smart Hostel Canteen Pre-Ordering System (OOPS Academic Project).

# BiteSync — Java Backend Migration Plan (OOPS Academic Architecture)

**Project:** BiteSync — Smart Hostel Canteen Pre-Ordering Platform  
**Target Backend:** Java 21, Spring Boot 3.3.x, Spring Data MongoDB, Spring Web, Spring Security, Maven  
**Branch:** `feature/java-backend-migration`  
**Evaluation Focus:** Object-Oriented Programming (OOPS) Principles in Production Software Architecture

---

## 1. Executive Summary & Existing Architecture

BiteSync is an end-to-end smart pre-ordering platform built for university hostel canteens to eliminate counter queues. It enables students to pre-order meals ahead of time, select 15-minute pickup time slots, pay digitally via an integrated student wallet or UPI, and collect freshly prepared meals at the counter with an HMAC-signed QR pass or numerical pickup token.

### Current JavaScript/Node.js Architecture:
- **Runtime:** Node.js v20+ with Express.js (Port `5001`).
- **Database:** MongoDB (`mongodb://127.0.0.1:27017/bitesync`) using Mongoose ODM.
- **Frontend:** React 18, Vite (Port `5173`), Tailwind CSS, Lucide React, Recharts. The Vite dev server proxies `/api` and `/socket.io` to `http://localhost:5001`.
- **Authentication:** JWT tokens (`Authorization: Bearer <token>`) with bcrypt password hashing.
- **Existing Backend Modules:**
  - `authRoutes` / `authController`: Registration, login, profile, hostel mapping, JWT issuance.
  - `menuRoutes` / `menuController`: Menu CRUD, categories, diet filters, live stock, recipe linkages.
  - `slotRoutes` / `slotController`: 15-minute pickup windows, atomic capacity limits, slot closure.
  - `orderRoutes` / `orderController`: Order creation, slot reservation, stock deduction, discount calculation, token generation (`BS-XXXXX`, `TK-XXXX`), QR HMAC signing, instant cancellation refunds.
  - `kitchenRoutes` / `kitchenController`: Live order preparation queue, status updates, delay broadcast.
  - `walletRoutes` / `walletController`: Student digital wallet, top-up, transaction ledger.
  - `inventoryRoutes` / `inventoryController`: Kitchen raw ingredient stock, restock logs, low-stock alerts.
  - `analyticsRoutes` / `analyticsController`: Revenue, sales trends, dish popularity, demand forecasting, food waste report.
  - `announcementRoutes` / `announcementController`: Hostel offers, coupons (`BITESYNC10`, `HOSTEL20`).
  - `groupOrderRoutes` / `groupOrderController`: Shared hostel roommate cart and token generation.
  - `notificationRoutes` / `notificationController`: Real-time order progress and alert history.
  - `mealPlanRoutes` / `mealPlanController`: Mess passes, meal skip, credit transfers.
  - `userRoutes`: Admin staff and student directory management.

---

## 2. Proposed Java Spring Boot Architecture

The Java backend will run on **Java 21** with **Spring Boot** and **Maven**, listening on port **5001** to ensure 100% plug-and-play backward compatibility with the existing React frontend.

```
BiteSync/
├── frontend/                     # React + Vite application (unchanged UI & state logic)
├── backend/                      # Java Spring Boot Backend
│   ├── pom.xml                   # Maven project descriptor (Java 21, Spring Boot 3.3)
│   └── src/
│       ├── main/
│       │   ├── java/com/bitesync/
│       │   │   ├── BiteSyncApplication.java
│       │   │   ├── config/              # SecurityConfig, MongoConfig, CorsConfig
│       │   │   ├── controller/          # REST Controllers (Spring Web @RestController)
│       │   │   ├── service/             # Business Logic & Service Interfaces
│       │   │   │   └── impl/            # Concrete Service Implementations
│       │   │   ├── repository/          # Spring Data MongoDB Repositories
│       │   │   ├── model/               # Encapsulated Domain Entities & Hierarchy
│       │   │   │   ├── user/            # User (abstract), Student, Admin, KitchenStaff
│       │   │   │   ├── order/           # Order, OrderItem, PickupSlot
│       │   │   │   ├── menu/            # MenuItem, RecipeIngredient
│       │   │   │   ├── wallet/          # Wallet, WalletTransaction
│       │   │   │   └── inventory/       # InventoryItem, RestockLog
│       │   │   ├── dto/                 # Request & Response Data Transfer Objects
│       │   │   ├── exception/           # Custom Domain Exceptions & @ControllerAdvice Handler
│       │   │   ├── security/            # JwtTokenProvider, JwtAuthenticationFilter, UserDetails
│       │   │   ├── enums/               # OrderStatus, Role, MealPeriod, PaymentMethodType
│       │   │   ├── interfaces/          # Business abstraction interfaces
│       │   │   ├── payment/             # Polymorphic Payment Strategy Hierarchy
│       │   │   │   ├── PaymentMethod.java (Interface)
│       │   │   │   ├── WalletPayment.java
│       │   │   │   ├── UpiPayment.java
│       │   │   │   ├── OnlinePayment.java
│       │   │   │   └── PaymentFactory.java
│       │   │   ├── discount/            # Polymorphic Discount Strategy Hierarchy
│       │   │   │   ├── DiscountStrategy.java (Interface)
│       │   │   │   ├── PercentageDiscountStrategy.java
│       │   │   │   ├── FixedDiscountStrategy.java
│       │   │   │   └── HostelOfferDiscountStrategy.java
│       │   │   └── utils/               # HmacSigner, TokenGenerator
│       │   └── resources/
│       │       └── application.properties # MongoDB connection, JWT secret, server port 5001
│       └── test/java/com/bitesync/      # JUnit 5 & Mockito test suite
```

---

## 3. Detailed OOPS Principles Mapping

This architecture is specifically designed to exhibit genuine, textbook Object-Oriented Programming (OOPS) in real operational code:

### 1. Encapsulation
- All domain classes (`User`, `Student`, `Admin`, `KitchenStaff`, `MenuItem`, `Order`, `OrderItem`, `Wallet`, `PickupSlot`, `InventoryItem`) have `private` fields.
- Access is strictly governed via getter/setter methods with invariant validation.
- Internal object states are manipulated through domain-rich business methods:
  - `Wallet.deduct(amount)` prevents negative balances.
  - `PickupSlot.bookSlot()` validates slot closure and max capacity atomically.
  - `Order.canBeCancelled()` encapsulates business cutoff logic.
  - `InventoryItem.consume(quantity)` protects stock integrity.

### 2. Inheritance
- **Base Class:** `public abstract class User`
  - Encapsulates common state: `id`, `name`, `email`, `password`, `role`, `phone`, `isActive`, `createdAt`.
  - Defines common contracts: `abstract String getIdentifier()`, `abstract boolean hasPermission(String permission)`.
- **Derived Classes:**
  - `public class Student extends User`: Adds `studentId`, `hostelDetails`, `dietaryPreference`, wallet association.
  - `public class Admin extends User`: Adds `adminDepartment`, `superAdmin` privileges.
  - `public class KitchenStaff extends User`: Adds `assignedStation` (grill, prep, counter), `shiftTimings`.

### 3. Abstraction
- Defined clear behavioral contracts through abstract classes and interfaces:
  - `PaymentMethod`: `PaymentResult processPayment(PaymentRequest request)`
  - `DiscountStrategy`: `double calculateDiscount(double subtotal, String couponCode)`
  - `OrderProcessor`: `Order processOrder(OrderRequest request)`
  - `NotificationService`: `void sendNotification(String recipientId, String title, String message)`
- Callers (like `OrderService`) depend strictly on abstractions, never on concrete payment gateway or discount algorithms.

### 4. Polymorphism
- **Runtime Polymorphism in Payments:**
  ```java
  PaymentMethod paymentMethod = paymentFactory.getPaymentMethod(request.getPaymentMethod());
  PaymentResult result = paymentMethod.processPayment(paymentRequest); // Dispatches dynamically to WalletPayment, UpiPayment, etc.
  ```
- **Runtime Polymorphism in Discounts:**
  ```java
  DiscountStrategy strategy = discountFactory.getStrategy(couponCode);
  double discount = strategy.calculateDiscount(subtotal, couponCode);
  ```
- **Method Overriding:** Subclasses (`Student`, `Admin`, `KitchenStaff`) override methods such as `getIdentifier()` and `toString()`.

### 5. Method Overloading (Compile-Time Polymorphism)
- Meaningful overloaded business methods in `OrderService`:
  - `Order placeOrder(String studentId, List<CartItemDto> items)` — Quick order without slot.
  - `Order placeOrder(String studentId, List<CartItemDto> items, String pickupSlotId)` — Standard pre-order.
  - `Order placeOrder(String studentId, List<CartItemDto> items, String pickupSlotId, String paymentMethod, String couponCode)` — Full checkout.
- Overloaded methods in `WalletService`:
  - `WalletTransaction credit(String studentId, double amount)`
  - `WalletTransaction credit(String studentId, double amount, String description, String referenceId)`

### 6. Interfaces
- `PaymentMethod` (Contracts for payment execution and refund)
- `DiscountStrategy` (Contracts for promotional discount rules)
- `OrderProcessor` (Contracts for end-to-end order orchestration)
- `NotificationService` (Contracts for transactional alerts)

### 7. Composition and Aggregation
- **Composition (Tight lifecycle binding):**
  - An `Order` is composed of `OrderItem` objects. If an order record is deleted or constructed, its line items are intrinsic to that order.
  - An `Announcement` contains embedded rules (`discountPercent`, `couponCode`).
- **Aggregation (Loose association):**
  - An `Order` aggregates references to a `Student`, a `PickupSlot`, and `MenuItem` IDs.
  - A `Student` aggregates a `Wallet`.
  - A `MenuItem` aggregates `RecipeIngredient` references linked to `InventoryItem`.

### 8. Exception Handling
- Robust hierarchy of checked/unchecked domain exceptions:
  - `BiteSyncException` (Base runtime exception)
    - `OrderNotFoundException`
    - `InsufficientBalanceException`
    - `SlotFullException`
    - `FoodUnavailableException`
    - `PaymentFailedException`
    - `DuplicateCollectionException`
    - `CancellationExpiredException`
- Centralized `@RestControllerAdvice` (`GlobalExceptionHandler`) catches domain exceptions and returns structured `ApiResponse<T>` with consistent HTTP status codes.

### 9. Collections and Generics
- Extensive use of the Java Collections Framework:
  - `List<OrderItem>` for sequential order processing.
  - `Map<String, MenuItem>` for $O(1)$ dish lookups.
  - `Set<String>` for unique categories and roles.
  - `Optional<User>` for null-safe repository lookups.
- Generics utilized in `ApiResponse<T>`, `PaymentFactory<T>`, and Spring Data repositories (`MongoRepository<T, ID>`).

---

## 4. API Endpoints to Migrate

Every single existing endpoint will be faithfully reproduced with identical JSON payloads:

| HTTP Verb | Path | Controller / Service | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | `HealthController` | System status, uptime, server timestamp |
| `POST` | `/api/auth/register` | `AuthController` | Student signup, ₹500 wallet credit bonus |
| `POST` | `/api/auth/login` | `AuthController` | Multi-role login (Student/Admin/Kitchen), JWT issuance |
| `GET` | `/api/auth/me` | `AuthController` | Current authenticated user profile & wallet balance |
| `PUT` | `/api/auth/profile` | `AuthController` | Update room, block, dietary preference |
| `GET` | `/api/menu` | `MenuController` | Get dishes with categories, search, veg/non-veg filter |
| `GET` | `/api/menu/:id` | `MenuController` | Single dish details with ingredients |
| `POST` | `/api/menu` | `MenuController` | Admin dish creation |
| `PUT` | `/api/menu/:id` | `MenuController` | Admin dish update |
| `PATCH` | `/api/menu/:id/toggle-availability`| `MenuController` | Admin/Kitchen 1-click availability toggle |
| `DELETE`| `/api/menu/:id` | `MenuController` | Admin delete dish |
| `GET` | `/api/slots` | `SlotController` | Slots for date with real-time remaining capacity |
| `POST` | `/api/slots` | `SlotController` | Admin create pickup slot |
| `PUT` | `/api/slots/:id` | `SlotController` | Admin update slot capacity/timings |
| `PATCH` | `/api/slots/:id/toggle-close` | `SlotController` | Kitchen/Admin emergency slot closure |
| `POST` | `/api/orders` | `OrderController` | Atomic slot booking, stock deduction, QR HMAC |
| `GET` | `/api/orders/my` | `OrderController` | Student order history |
| `GET` | `/api/orders/all` | `OrderController` | Admin & Kitchen view of all orders |
| `GET` | `/api/orders/:id` | `OrderController` | Single order progress & QR payload |
| `POST` | `/api/orders/:id/cancel` | `OrderController` | Cutoff validation, slot release, instant refund |
| `PATCH` | `/api/orders/:id/status` | `OrderController` | Status transitions (`placed` → `accepted` → `preparing` → `ready`) |
| `POST` | `/api/orders/verify-pickup` | `OrderController` | QR scan / token verification, duplicate prevention |
| `POST` | `/api/orders/:id/rate` | `OrderController` | Student meal review & ratings |
| `GET` | `/api/kitchen/queue` | `KitchenController` | Active kitchen preparation Kanban queue |
| `GET` | `/api/kitchen/ready` | `KitchenController` | Ready counter pickup board |
| `GET` | `/api/kitchen/summary` | `KitchenController` | Kitchen prep sheet and dish count summary |
| `POST` | `/api/kitchen/report-delay` | `KitchenController` | Broadcast rush delay alerts |
| `GET` | `/api/wallet` | `WalletController` | Wallet balance & currency |
| `POST` | `/api/wallet/topup` | `WalletController` | Digital wallet recharge |
| `GET` | `/api/wallet/transactions` | `WalletController` | Complete audit transaction ledger |
| `GET` | `/api/inventory` | `InventoryController`| Raw material stock list |
| `GET` | `/api/inventory/low-stock-alerts` | `InventoryController`| Threshold alerts for kitchen |
| `POST` | `/api/inventory` | `InventoryController`| Admin add ingredient |
| `PUT` | `/api/inventory/:id` | `InventoryController`| Admin update ingredient |
| `POST` | `/api/inventory/:id/restock` | `InventoryController`| Restock ingredient with invoice notes |
| `GET` | `/api/analytics/overview` | `AnalyticsController`| Today's revenue, order counts, active students |
| `GET` | `/api/analytics/sales-trends` | `AnalyticsController`| Recharts time-series data |
| `GET` | `/api/analytics/dish-popularity`| `AnalyticsController`| Top selling items breakdown |
| `GET` | `/api/analytics/demand-prediction` | `AnalyticsController`| Statistical demand forecasting |
| `GET` | `/api/analytics/waste-reduction` | `AnalyticsController`| Prepared vs sold vs waste reports |
| `GET` | `/api/announcements` | `AnnouncementController`| Active offers and announcements |
| `POST` | `/api/announcements` | `AnnouncementController`| Admin create offer/coupon |
| `GET` | `/api/group-orders/:code`| `GroupOrderController`| Roommate shared cart by group code |
| `POST` | `/api/group-orders` | `GroupOrderController`| Create group order session |
| `POST` | `/api/group-orders/:code/join`| `GroupOrderController`| Join group order |
| `POST` | `/api/group-orders/:code/items`| `GroupOrderController`| Add item to group |
| `GET` | `/api/notifications` | `NotificationController`| Student order status notification feed |
| `PATCH` | `/api/notifications/:id/read` | `NotificationController`| Mark single notification as read |
| `POST` | `/api/notifications/mark-all-read` | `NotificationController`| Mark all notifications as read |
| `GET` | `/api/users/students` | `UserController` | Admin student directory |
| `GET` | `/api/users/staff` | `UserController` | Admin staff directory |
| `POST` | `/api/users/staff` | `UserController` | Admin create new staff account |
| `PATCH` | `/api/users/staff/:id/toggle-active` | `UserController` | Toggle staff account active/inactive |
| `GET` | `/api/meal-plans` | `MealPlanController` | Available meal passes |
| `POST` | `/api/meal-plans/:id/subscribe` | `MealPlanController` | Purchase meal pass |
| `GET` | `/api/meal-plans/my-credits` | `MealPlanController` | View meal credits |
| `POST` | `/api/meal-plans/skip-meal` | `MealPlanController` | Mark meal skipped |
| `GET` | `/api/meal-plans/skipped-meals` | `MealPlanController` | List skipped meals |
| `POST` | `/api/meal-plans/transfer-credits`| `MealPlanController`| Transfer credits to peer |

---

## 5. Database Compatibility & Preservation

The existing MongoDB database `bitesync` will be preserved without wiping:
- **Collection Names:**
  - `users` (mapped to `User`, `Student`, `Admin`, `KitchenStaff`)
  - `menuitems` (mapped to `MenuItem`)
  - `pickupslots` (mapped to `PickupSlot`)
  - `orders` (mapped to `Order`)
  - `wallets` (mapped to `Wallet`)
  - `wallettransactions` (mapped to `WalletTransaction`)
  - `inventoryitems` (mapped to `InventoryItem`)
  - `announcements` (mapped to `Announcement`)
  - `reviews` (mapped to `Review`)
  - `grouporders` (mapped to `GroupOrder`)
  - `notifications` (mapped to `Notification`)
  - `mealplans` (mapped to `MealPlan`)
  - `mealcredits` (mapped to `MealCredit`)
  - `mealskips` (mapped to `MealSkip`)
  - `mealtransfers` (mapped to `MealTransfer`)

Spring Data MongoDB `@Document(collection = "...")` annotations will guarantee exact name matching. Spring Data handles ObjectId mapping seamlessly with `@Id String id`.

---

## 6. Implementation Phases

1. **Phase 1: Environment Setup & Build Tooling**
   - Install/verify Java 21 and Maven on the system.
   - Setup `pom.xml` with Spring Boot 3.3.x, Spring Web, Spring Data MongoDB, Spring Security, jjwt (Java JWT), and test dependencies.
2. **Phase 2: Domain Modeling & OOPS Architecture**
   - Implement `User` abstract class, `Student`, `Admin`, and `KitchenStaff` subclasses.
   - Implement `MenuItem`, `PickupSlot`, `Order`, `OrderItem`, `Wallet`, `WalletTransaction`, `InventoryItem`.
   - Implement `PaymentMethod` interface and polymorphic implementations (`WalletPayment`, `UpiPayment`, `OnlinePayment`).
   - Implement `DiscountStrategy` interface and polymorphic implementations.
3. **Phase 3: Repositories & Data Layer**
   - Implement Spring Data MongoDB repositories with custom atomic query operations.
4. **Phase 4: Service Layer & Business Logic**
   - Implement services (`AuthService`, `OrderService`, `MenuService`, `SlotService`, `WalletService`, `KitchenService`, `AnalyticsService`, `InventoryService`).
   - Implement token generation and HMAC-SHA256 signature verification matching Node.js `tokenGenerator.js`.
5. **Phase 5: Security & Controllers**
   - Spring Security configuration with JWT filter, BCrypt password encoder, CORS on port `5001`.
   - Implement all REST controllers matching exact endpoint paths and responses.
   - Global `@RestControllerAdvice` exception handler.
6. **Phase 6: Testing & Verification**
   - Compile Java application (`mvn clean package`).
   - Execute integration tests verifying registration, login, menu querying, slot booking, polymorphic wallet payments, order cancellation refunds, and QR pickup collection.
7. **Phase 7: Academic Documentation**
   - Generate `OOPS_CONCEPTS.md` with complete code references and viva explanations.
   - Generate `VIVA_QUESTIONS.md` with 30+ comprehensive academic viva questions & answers.
   - Update `README.md` with Java build & run instructions.
   - Commit and push to `feature/java-backend-migration`.


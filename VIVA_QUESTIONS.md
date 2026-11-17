# BiteSync — OOPS Academic Viva Questions & Answers

A curated bank of **32 high-probability viva questions** with concise, technically accurate answers grounded directly in the **BiteSync Java 21 + Spring Boot** codebase.

---

## Section A: Core OOPS Concepts in BiteSync

### Q1. Why did you migrate the BiteSync backend from Node.js/JavaScript to Java + Spring Boot?
**Answer:** JavaScript uses prototype-based dynamic typing where interfaces, access modifiers (`private`/`protected`), abstract classes, and compile-time polymorphism are absent or weak. Migrating to **Java 21 + Spring Boot** allows strict compile-time enforcement of OOPS pillars—true encapsulation with `private` invariants, abstract base classes (`User`), interface contracts (`PaymentMethod`, `DiscountStrategy`), runtime polymorphism, method overloading, custom checked/unchecked exception hierarchies, and generics (`ApiResponse<T>`).

### Q2. Where is Encapsulation implemented in BiteSync? Is it just getters and setters?
**Answer:** No—encapsulation in BiteSync enforces business invariants inside domain entities:
- `Wallet.java`: Keeps `balance` `private`. Mutating balance goes through `credit(amount)` (rejects `<= 0`) and `deduct(amount)` (verifies `hasSufficientBalance` before deducting). `setBalance()` rejects negative numbers.
- `PickupSlot.java`: `bookSlot()` checks `hasAvailableCapacity()` (neither closed nor at `maxCapacity`) before incrementing `currentBookings`.
- `MenuItem.java`: `deductStock(qty)` validates available stock and automatically sets `isAvailable = false` when `stockQuantity` reaches `0`.
- `Order.java`: `markCollected(staffId)` throws `IllegalStateException` if the order is already collected.

### Q3. How did you model Inheritance in BiteSync? Why is `User` an `abstract` class?
**Answer:** `User` (`com.bitesync.model.user.User`) is an `abstract` base class holding shared attributes (`id`, `name`, `email`, `password`, `role`, `isActive`) and lifecycle methods (`activate()`, `deactivate()`). Three concrete subclasses extend it:
- `Student` (adds `studentId`, `HostelDetails`, `dietaryPreference`)
- `Admin` (adds `adminDepartment`, `isSuperAdmin`)
- `KitchenStaff` (adds `assignedStation`, `shiftTiming`)

Making `User` `abstract` prevents accidental instantiation of a role-less `new User()` and forces every subclass to implement `getIdentifier()`, `hasAdminPrivileges()`, and `getDisplayRole()`.

### Q4. How does MongoDB store and restore the polymorphic `User` hierarchy in a single `users` collection?
**Answer:** In `MongoConfig.java`, we registered two Spring Data MongoDB custom converters: `UserReadConverter` (`Converter<Document, User>`) and `UserWriteConverter` (`Converter<User, Document>`). When reading a document from MongoDB's `users` collection, `UserReadConverter` inspects the `role` field (`"admin"`, `"kitchen"`, or `"student"`) and instantiates the exact concrete Java subclass (`Admin`, `KitchenStaff`, or `Student`).

### Q5. What is the difference between an Abstract Class and an Interface? Give examples from BiteSync.
**Answer:**
- **Abstract Class (`User.java`):** Used when subclasses share **common state (fields)** and partial implementation (`IS-A` hierarchy). A class can `extend` only one abstract class.
- **Interface (`PaymentMethod.java`, `DiscountStrategy.java`, `NotificationService.java`):** Used to define a pure **behavioral contract (`CAN-DO`)** across unrelated classes. A class can `implement` multiple interfaces.

### Q6. Explain Runtime Polymorphism in BiteSync's Payment Module.
**Answer:** `PaymentMethod` is an interface with `processPayment(PaymentRequest)` and `refundPayment(...)`. Four concrete classes implement it: `WalletPayment`, `UpiPayment`, `OnlinePayment`, and `MealCreditPayment`. `PaymentFactory` injects all implementations into a `Map<String, PaymentMethod>`. In `OrderService.placeOrder()`, we write:
```java
PaymentMethod method = paymentFactory.getPaymentMethod(paymentMethod);
PaymentResult payResult = method.processPayment(payReq);
```
`OrderService` only knows the `PaymentMethod` interface. At runtime, the JVM uses dynamic method dispatch to execute whichever concrete payment processor the student selected.

### Q7. How does the Payment Module follow the Open/Closed Principle (OCP)?
**Answer:** Classes should be **open for extension, closed for modification**. If BiteSync adds a new payment mode (e.g., `CampusCardPayment`), we simply create a new `@Component` class implementing `PaymentMethod`. Spring automatically injects it into `PaymentFactory`'s constructor `List<PaymentMethod>`, requiring **zero edits** to `OrderService` or `PaymentFactory`.

### Q8. Give concrete examples of Method Overloading (Compile-Time Polymorphism) in BiteSync.
**Answer:**
1. `OrderService.placeOrder(...)` has 3 overloaded signatures:
   - `placeOrder(studentId, items)` — quick express order
   - `placeOrder(studentId, items, pickupSlotId)` — standard slot pre-order
   - `placeOrder(studentId, items, pickupSlotId, paymentMethod, couponCode, notes)` — full checkout
2. `WalletService.credit(...)` has 2 overloads:
   - `credit(studentId, amount)` — default description & reference
   - `credit(studentId, amount, description, referenceId)` — full audit ledger entry

### Q9. What is the difference between Method Overloading and Method Overriding?
**Answer:**
- **Overloading (Compile-time polymorphism):** Same method name in the **same class** with different parameter lists (e.g., `OrderService.placeOrder`). Resolved by the compiler.
- **Overriding (Runtime polymorphism):** Same method signature in a **subclass/implementation** redefining parent behavior with `@Override` (e.g., `Admin.hasAdminPrivileges()` returning `true` vs `Student.hasAdminPrivileges()` returning `false`). Resolved at runtime by the JVM.

### Q10. Distinguish between Composition and Aggregation with BiteSync examples.
**Answer:**
- **Composition (Strong ownership / Part-of):** `Order` owns `List<OrderItem>`, `SlotDisplay`, `PaymentDetails`, and `StatusTimestamps`; `Student` owns `HostelDetails`. If an `Order` is deleted, its embedded `OrderItem`s and `StatusTimestamps` cease to exist.
- **Aggregation (Weak association / Has-a):** `Order` references `Student` and `PickupSlot` by ID; `Wallet` references `Student`; `MenuItem`'s `RecipeIngredient` references `InventoryItem`. Deleting an `Order` does **not** delete the `Student` or `PickupSlot`.

### Q11. How did you use Interfaces and the Strategy Pattern for Coupons/Discounts?
**Answer:** `DiscountStrategy` defines `isApplicable(subtotal, couponCode)` and `calculateDiscount(subtotal, couponCode)`. Three strategies implement it:
- `PercentageDiscountStrategy` (`BITESYNC10` — 10% off)
- `HostelOfferDiscountStrategy` (`HOSTEL20` — 20% off capped at ₹100)
- `FixedDiscountStrategy` (`FLAT25` — flat ₹25 off)

`DiscountFactory` iterates through all registered strategies and applies the matching one without `OrderService` having hardcoded coupon `if/else` chains.

### Q12. How are Java Generics used in BiteSync?
**Answer:**
1. **`ApiResponse<T>` (`dto/ApiResponse.java`):** A generic REST envelope wrapping any response payload (`ApiResponse<Order>`, `ApiResponse<List<MenuItem>>`, `ApiResponse<Wallet>`) with compile-time type safety.
2. **Spring Data Repositories:** Every repository extends `MongoRepository<Entity, String>` (e.g., `OrderRepository extends MongoRepository<Order, String>`).
3. **Standard Library Generics:** `Optional<User>`, `List<OrderItem>`, `Map<String, PaymentMethod>`.

### Q13. Which Java Collections are used in BiteSync and why?
**Answer:**
- `HashMap<String, PaymentMethod>` in `PaymentFactory` for $O(1)$ lookup of payment processors.
- `TreeMap<LocalDate, Double>` in `AnalyticsService.getSalesTrends()` to keep 7-day sales chronologically sorted by date key.
- `ArrayList<OrderItem>` in `Order` to preserve line-item ordering.
- `Optional<T>` across repositories to handle missing MongoDB documents safely without `NullPointerException`.

### Q14. Why use `enum` types in `com.bitesync.enums`?
**Answer:** Enums (`Role`, `OrderStatus`, `PaymentMethodType`, `PaymentStatus`, `MealPeriod`) provide type-safe, finite sets of domain constants instead of error-prone raw strings, preventing invalid role or status assignments.

---

## Section B: Exception Handling & Business Rules

### Q15. Explain your Exception Handling architecture in BiteSync.
**Answer:** We created a custom runtime exception hierarchy rooted at `BiteSyncException`:
- `OrderNotFoundException` & `ResourceNotFoundException` → HTTP `404`
- `UnauthorizedActionException` → HTTP `403`
- `InsufficientBalanceException`, `SlotFullException`, `FoodUnavailableException`, `PaymentFailedException`, `CancellationExpiredException` → HTTP `400`
- `DuplicateCollectionException` → HTTP `400` with `isDuplicate: true`

`GlobalExceptionHandler` annotated with `@RestControllerAdvice` intercepts these globally across all controllers and converts them into uniform `ApiResponse` JSON errors.

### Q16. Why do custom exceptions in BiteSync extend `RuntimeException` instead of checked `Exception`?
**Answer:** Extending `RuntimeException` (unchecked) avoids polluting every interface signature (`PaymentMethod`, `OrderProcessor`) and service method with `throws` boilerplate, works cleanly with Java lambdas/streams (like `.orElseThrow(...)`), and integrates seamlessly with Spring's `@RestControllerAdvice` and transaction rollback conventions.

### Q17. What happens if payment fails after a pickup slot has already been booked?
**Answer:** In `OrderService.placeOrder()`, steps 2–8 run inside a `try { ... } catch (Exception ex)` block after `slot.bookSlot()` saves the reservation. If any exception occurs (such as `FoodUnavailableException` or `PaymentFailedException`), the `catch` block immediately calls `slot.releaseSlot()` and persists the rollback before rethrowing the domain exception.

### Q18. How does BiteSync prevent Duplicate Meal Collection at the counter?
**Answer:** Two layers enforce this critical rule:
1. **Service Layer (`OrderService.verifyAndCollectOrder`):** After verifying the HMAC-SHA256 QR signature, it checks `if (order.isCollected())` and throws `DuplicateCollectionException` carrying the original collection timestamp.
2. **Domain Encapsulation (`Order.markCollected`):** Inside the `Order` entity itself, calling `markCollected()` on an already-collected order throws `IllegalStateException`.
3. **Global Handler:** `GlobalExceptionHandler` catches `DuplicateCollectionException` and returns `isDuplicate: true`, triggering the kitchen terminal's warning banner.

### Q19. How does QR Code cryptographic verification work in Java?
**Answer:** `HmacSigner.java` uses Java's `javax.crypto.Mac` (`HmacSHA256`) to sign `orderId|orderNumber|pickupToken` with a server secret key and embeds the hex digest inside the JSON QR payload. When kitchen staff scan the QR code, `verifyQRPayload()` recomputes the HMAC and compares signatures, rejecting tampered or forged QR codes.

### Q20. How is the 15-minute cancellation cutoff rule enforced?
**Answer:** When an order is placed, `OrderService` computes `cancellationDeadline = slotStart - 15 minutes`. When a student requests cancellation, `Order.canBeCancelled()` checks `new Date().after(this.cancellationDeadline)`. If expired, `OrderService` throws `CancellationExpiredException`. If valid, it marks the order cancelled, releases the `PickupSlot`, replenishes `MenuItem` stock, and executes a **polymorphic refund** via `paymentFactory.getPaymentMethod(order.getPaymentMethod()).refundPayment(...)`.

---

## Section C: Spring Boot & Layered Architecture

### Q21. Explain the Layered Architecture used in BiteSync.
**Answer:** BiteSync strictly follows **Controller → Service → Repository → MongoDB**:
- **Controller (`controller/`):** Handles HTTP routing, request parsing, JWT principal extraction, and `ResponseEntity<ApiResponse<T>>` formatting. Contains zero business logic.
- **Service (`service/`):** Orchestrates business rules, polymorphism (`PaymentFactory`, `DiscountFactory`), stock/slot invariants, and notifications.
- **Repository (`repository/`):** Interfaces extending `MongoRepository` that perform MongoDB CRUD and derived queries (`findByEmail`, `findByPickupToken`).
- **Model (`model/`):** Encapsulated domain entities mapped to MongoDB collections.

### Q22. What is Dependency Injection (DI) and how does BiteSync use it?
**Answer:** Dependency Injection is Inversion of Control (IoC) where Spring creates and injects dependencies instead of classes instantiating them with `new`. BiteSync exclusively uses **Constructor Injection** (e.g., `OrderService` receives all repositories, `PaymentFactory`, and `DiscountFactory` via its constructor), enabling `final` immutable fields and straightforward unit testing.

### Q23. How does Role-Based Access Control (RBAC) work in Spring Security?
**Answer:**
1. `JwtAuthenticationFilter` extracts `Authorization: Bearer <token>`, validates the JWT via `JwtTokenProvider` (JJWT 0.12), loads the user into `UserPrincipal` with authority `ROLE_<ROLE>` (e.g., `ROLE_STUDENT`, `ROLE_ADMIN`, `ROLE_KITCHEN`), and populates `SecurityContextHolder`.
2. `SecurityConfig` configures stateless sessions (`SessionCreationPolicy.STATELESS`) and enables `@EnableMethodSecurity`.
3. Controllers enforce permissions via `@PreAuthorize("hasRole('ADMIN')")` or `@PreAuthorize("hasAnyRole('ADMIN', 'KITCHEN')")`.

### Q24. Why use DTOs (`dto/`) instead of exposing `@Document` models directly in auth endpoints?
**Answer:** Returning the `User` entity directly risks exposing sensitive fields like BCrypt-hashed `password` or accepting mass-assignment attacks (e.g., a student passing `"role": "admin"` in a profile update request). `AuthDtos.LoginRequest`, `RegisterRequest`, and `UserProfileDto` restrict exactly what enters and leaves the API.

### Q25. How does the React frontend communicate with the Java Spring Boot backend without changing frontend code?
**Answer:**
1. Spring Boot runs on `server.port=5001`, matching the Vite dev proxy target (`http://localhost:5001/api`).
2. `SecurityConfig` configures CORS for `http://localhost:5173`.
3. Every REST route path (`/api/auth/*`, `/api/menu/*`, `/api/orders/*`, `/api/slots/*`, `/api/wallet/*`, `/api/kitchen/*`, `/api/analytics/*`) and JSON response shape (`success`, `data`, `_id`, `token`, `user`) matches the exact contract the React frontend expects.

### Q26. How did you maintain 100% database compatibility with existing MongoDB collections seeded by Mongoose?
**Answer:**
- Used matching `@Document(collection = "...")` names (`users`, `menuitems`, `pickupslots`, `orders`, `wallets`, etc.).
- Annotated foreign-key ID strings (`student`, `pickupSlot`, `wallet`, `recipient`) with `@Field(targetType = FieldType.OBJECT_ID)` so Spring Data MongoDB queries and stores BSON `ObjectId`s.
- Added `@JsonProperty("_id") public String get_id()` on entities so React components reading `item._id` continue working seamlessly.
- Used `BCryptPasswordEncoder`, which verifies the exact same `$2a$`/`$2b$` password hashes created by Node's `bcryptjs`.

### Q27. What is the purpose of `UserPrincipal` implementing `UserDetails`?
**Answer:** Spring Security works against its own `UserDetails` interface. `UserPrincipal` acts as an **Adapter Pattern** bridging our domain `User` hierarchy (`Student`, `Admin`, `KitchenStaff`) to Spring Security's `GrantedAuthority` and authentication context without coupling our domain model to security framework classes.

### Q28. What design patterns are present in BiteSync?
**Answer:**
1. **Factory Pattern:** `PaymentFactory`, `DiscountFactory`
2. **Strategy Pattern:** `PaymentMethod`, `DiscountStrategy`
3. **Repository Pattern:** Spring Data `MongoRepository` interfaces
4. **DTO Pattern:** `AuthDtos`, `OrderDtos`, `WalletDtos`, `AnalyticsDtos`
5. **Adapter Pattern:** `UserPrincipal` adapting `User` to Spring Security's `UserDetails`
6. **Dependency Injection / Singleton Beans:** Spring `@Service`, `@Component`, `@RestController`

### Q29. What happens to recipe inventory when an order is placed?
**Answer:** Inside `OrderService.placeOrder()`, after payment succeeds, for every `OrderItem` the service deducts dish stock via `dish.deductStock(qty)` and iterates over `dish.getRecipeIngredients()`. For each linked raw `InventoryItem`, it invokes `inv.consume(recipe.getQuantity() * item.getQuantity())`, clamping at `0.0` so kitchen inventory never goes negative.

### Q30. How does `OopsConceptsTest.java` verify your OOPS implementation?
**Answer:** `backend/src/test/java/com/bitesync/OopsConceptsTest.java` is a JUnit 5 test suite with 5 automated unit tests asserting:
1. Polymorphic `User` inheritance & overridden methods across `Student`, `Admin`, `KitchenStaff`.
2. `Wallet` and `PickupSlot` encapsulation invariants (rejecting negative balance, overdrafts, and overbooked/closed slots).
3. `MenuItem` stock deduction and automatic sold-out state transition.
4. Runtime polymorphism across `DiscountStrategy` implementations (`BITESYNC10`, `HOSTEL20`, `FLAT25`).
5. `HmacSigner` QR signing, valid verification, and tamper rejection.

### Q31. What is the difference between `super()` and `this()` in Java constructors? Where are they used?
**Answer:**
- `super(...)` calls the parent class constructor (used in `Student`, `Admin`, and `KitchenStaff` to initialize inherited `User` fields).
- `this(...)` chains to another constructor in the same class (used in `User(name, email, password, role)` calling `this()` to initialize `createdAt`/`updatedAt`, and similarly in `Wallet`, `MenuItem`, `PickupSlot`).

### Q32. Why is `final` used on injected fields in BiteSync services and controllers?
**Answer:** Declaring injected dependencies `private final` ensures immutability after construction, guarantees thread-safety for singleton Spring beans serving concurrent HTTP requests, and enforces that all required dependencies are provided at construction time.

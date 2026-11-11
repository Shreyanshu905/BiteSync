const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const PickupSlot = require('../models/PickupSlot');
const Order = require('../models/Order');
const Wallet = require('../models/Wallet');
const WalletTransaction = require('../models/WalletTransaction');
const MealPlan = require('../models/MealPlan');
const MealCredit = require('../models/MealCredit');
const InventoryItem = require('../models/InventoryItem');
const Announcement = require('../models/Announcement');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const {
  generateOrderNumber,
  generatePickupToken,
  generateQRPayload,
} = require('../utils/tokenGenerator');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Clearing existing BiteSync database collections...');

    await Promise.all([
      User.deleteMany(),
      MenuItem.deleteMany(),
      PickupSlot.deleteMany(),
      Order.deleteMany(),
      Wallet.deleteMany(),
      WalletTransaction.deleteMany(),
      MealPlan.deleteMany(),
      MealCredit.deleteMany(),
      InventoryItem.deleteMany(),
      Announcement.deleteMany(),
      Notification.deleteMany(),
      Review.deleteMany(),
    ]);

    console.log('🌱 Seeding User Accounts (Student, Admin, Kitchen Staff)...');

    const admin = await User.create({
      name: 'Ramesh Kumar (Canteen Admin)',
      email: 'admin@bitesync.com',
      password: 'Password123',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    const kitchen = await User.create({
      name: 'Suresh Chef (Head Cook)',
      email: 'kitchen@bitesync.com',
      password: 'Password123',
      role: 'kitchen',
      phone: '+91 98765 12345',
    });

    const student1 = await User.create({
      name: 'Aarav Sharma',
      email: 'student@bitesync.com',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-2024-001',
      hostel: {
        hostelName: 'Aryabhata Bhavan',
        block: 'Block-A',
        roomNumber: '204',
      },
      phone: '+91 98111 22334',
      dietaryPreference: 'veg',
    });

    const student2 = await User.create({
      name: 'Ananya Verma',
      email: 'ananya@bitesync.com',
      password: 'Password123',
      role: 'student',
      studentId: 'STU-2024-002',
      hostel: {
        hostelName: 'Gargi Bhavan',
        block: 'Block-B',
        roomNumber: '312',
      },
      phone: '+91 98222 33445',
      dietaryPreference: 'all',
    });

    console.log('🌱 Seeding Student Wallets with balance...');
    const wallet1 = await Wallet.create({
      student: student1._id,
      balance: 650,
    });

    await WalletTransaction.create({
      wallet: wallet1._id,
      student: student1._id,
      amount: 650,
      type: 'topup',
      status: 'completed',
      referenceId: 'INIT-650',
      description: 'Initial Wallet Balance',
      balanceAfter: 650,
    });

    const wallet2 = await Wallet.create({
      student: student2._id,
      balance: 800,
    });

    await WalletTransaction.create({
      wallet: wallet2._id,
      student: student2._id,
      amount: 800,
      type: 'topup',
      status: 'completed',
      referenceId: 'INIT-800',
      description: 'Initial Wallet Balance',
      balanceAfter: 800,
    });

    console.log('🌱 Seeding Inventory Ingredients...');
    const rawIngredients = await InventoryItem.insertMany([
      { name: 'Basmati Rice', category: 'grain', currentStock: 80, unit: 'kg', minThreshold: 20, costPerUnit: 60, supplier: 'Anand Grains Ltd.' },
      { name: 'Wheat Flour (Atta)', category: 'grain', currentStock: 75, unit: 'kg', minThreshold: 25, costPerUnit: 40, supplier: 'Anand Grains Ltd.' },
      { name: 'Fresh Paneer', category: 'dairy', currentStock: 18, unit: 'kg', minThreshold: 10, costPerUnit: 340, supplier: 'Amul Dairy Vendor' },
      { name: 'Full Cream Milk', category: 'dairy', currentStock: 6, unit: 'litres', minThreshold: 15, costPerUnit: 65, supplier: 'Amul Dairy Vendor' }, // Low stock!
      { name: 'Potatoes (Aloo)', category: 'vegetable', currentStock: 50, unit: 'kg', minThreshold: 15, costPerUnit: 25, supplier: 'Kisan Sabzi Mandi' },
      { name: 'Onions', category: 'vegetable', currentStock: 35, unit: 'kg', minThreshold: 15, costPerUnit: 35, supplier: 'Kisan Sabzi Mandi' },
      { name: 'Tomatoes', category: 'vegetable', currentStock: 4, unit: 'kg', minThreshold: 12, costPerUnit: 30, supplier: 'Kisan Sabzi Mandi' }, // Low stock!
      { name: 'Assam Tea Leaves', category: 'beverage', currentStock: 12, unit: 'kg', minThreshold: 5, costPerUnit: 280, supplier: 'Taj Tea Depo' },
      { name: 'Coffee Beans & Powder', category: 'beverage', currentStock: 8, unit: 'kg', minThreshold: 3, costPerUnit: 450, supplier: 'Bru & Nescafe' },
      { name: 'Maggi Noodles Packets', category: 'grain', currentStock: 120, unit: 'packets', minThreshold: 30, costPerUnit: 12, supplier: 'Nestle Wholesale' },
      { name: 'Refined Cooking Oil', category: 'grain', currentStock: 40, unit: 'litres', minThreshold: 15, costPerUnit: 130, supplier: 'Fortune Oils' },
      { name: 'Paper Meal Trays & Cups', category: 'packaging', currentStock: 350, unit: 'units', minThreshold: 100, costPerUnit: 2, supplier: 'EcoPack India' },
    ]);

    const ingMap = {};
    rawIngredients.forEach((i) => {
      ingMap[i.name] = i._id;
    });

    console.log('🌱 Seeding Authentic Indian Hostel Canteen Dishes...');
    const dishes = await MenuItem.insertMany([
      {
        name: 'Poha',
        description: 'Light flattened rice cooked with mustard seeds, curry leaves, crunchy peanuts, potatoes and fresh lemon coriander.',
        price: 35,
        category: 'breakfast',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 45,
        lowStockThreshold: 10,
        preparationTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        ratingCount: 42,
        isFeatured: true,
        tags: ['breakfast', 'light', 'healthy', 'popular'],
        availableMealWindows: ['breakfast', 'snacks'],
        recipeIngredients: [
          { ingredient: ingMap['Potatoes (Aloo)'], quantity: 0.05, unit: 'kg' },
          { ingredient: ingMap['Onions'], quantity: 0.03, unit: 'kg' },
        ],
      },
      {
        name: 'Idli Sambhar',
        description: 'Steamed fluffy rice cakes (3 pcs) served with piping hot aromatic vegetable sambhar and fresh coconut chutney.',
        price: 45,
        category: 'breakfast',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 30,
        lowStockThreshold: 8,
        preparationTimeMinutes: 12,
        imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        ratingCount: 38,
        isFeatured: true,
        tags: ['south-indian', 'steamed', 'healthy'],
        availableMealWindows: ['breakfast', 'snacks'],
        recipeIngredients: [
          { ingredient: ingMap['Tomatoes'], quantity: 0.04, unit: 'kg' },
          { ingredient: ingMap['Onions'], quantity: 0.03, unit: 'kg' },
        ],
      },
      {
        name: 'Aloo Paratha',
        description: 'Two golden, crispy whole-wheat flatbreads stuffed with spiced mashed potatoes, served with fresh curd and mixed pickle.',
        price: 55,
        category: 'breakfast',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 50,
        lowStockThreshold: 12,
        preparationTimeMinutes: 15,
        imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        ratingCount: 64,
        isFeatured: true,
        tags: ['breakfast', 'punjabi', 'filling', 'bestseller'],
        availableMealWindows: ['breakfast', 'lunch', 'dinner'],
        recipeIngredients: [
          { ingredient: ingMap['Wheat Flour (Atta)'], quantity: 0.12, unit: 'kg' },
          { ingredient: ingMap['Potatoes (Aloo)'], quantity: 0.15, unit: 'kg' },
        ],
      },
      {
        name: 'Masala Dosa',
        description: 'Crispy fermented crepe stuffed with spiced potato masala, accompanied by sambhar and tangy tomato & coconut chutneys.',
        price: 65,
        category: 'breakfast',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        lowStockThreshold: 10,
        preparationTimeMinutes: 15,
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        ratingCount: 88,
        isFeatured: true,
        tags: ['south-indian', 'crispy', 'bestseller'],
        availableMealWindows: ['breakfast', 'dinner'],
        recipeIngredients: [
          { ingredient: ingMap['Potatoes (Aloo)'], quantity: 0.1, unit: 'kg' },
          { ingredient: ingMap['Onions'], quantity: 0.04, unit: 'kg' },
        ],
      },
      {
        name: 'Special Veg Thali',
        description: 'Complete wholesome meal: Paneer Butter Masala, Dal Makhani, Seasonal Dry Sabzi, 3 Butter Rotis, Jeera Rice, Gulab Jamun & Salad.',
        price: 120,
        category: 'lunch',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 60,
        lowStockThreshold: 15,
        preparationTimeMinutes: 15,
        imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        ratingCount: 110,
        isFeatured: true,
        tags: ['lunch', 'dinner', 'complete-meal', 'thali'],
        availableMealWindows: ['lunch', 'dinner'],
        recipeIngredients: [
          { ingredient: ingMap['Fresh Paneer'], quantity: 0.08, unit: 'kg' },
          { ingredient: ingMap['Basmati Rice'], quantity: 0.1, unit: 'kg' },
          { ingredient: ingMap['Wheat Flour (Atta)'], quantity: 0.1, unit: 'kg' },
        ],
      },
      {
        name: 'Rajma Chawal Combo',
        description: 'Slow-cooked Punjabi red kidney beans in thick spiced gravy ladled over steamed fragrant Basmati rice with pickled onions.',
        price: 80,
        category: 'lunch',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 35,
        lowStockThreshold: 10,
        preparationTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        ratingCount: 75,
        isFeatured: true,
        tags: ['lunch', 'comfort-food', 'north-indian'],
        availableMealWindows: ['lunch', 'dinner'],
        recipeIngredients: [
          { ingredient: ingMap['Basmati Rice'], quantity: 0.15, unit: 'kg' },
          { ingredient: ingMap['Onions'], quantity: 0.05, unit: 'kg' },
          { ingredient: ingMap['Tomatoes'], quantity: 0.05, unit: 'kg' },
        ],
      },
      {
        name: 'Paneer Kathi Roll',
        description: 'Flaky paratha loaded with marinated tandoori paneer cubes, crunchy bell peppers, mint chutney and spiced onion relish.',
        price: 70,
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 28,
        lowStockThreshold: 8,
        preparationTimeMinutes: 12,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        ratingCount: 52,
        isFeatured: false,
        tags: ['snacks', 'roll', 'grab-and-go'],
        availableMealWindows: ['snacks', 'late-night'],
        recipeIngredients: [
          { ingredient: ingMap['Fresh Paneer'], quantity: 0.08, unit: 'kg' },
          { ingredient: ingMap['Wheat Flour (Atta)'], quantity: 0.06, unit: 'kg' },
        ],
      },
      {
        name: 'Grilled Veg Sandwich',
        description: 'Multi-layer toasted jumbo bread filled with spiced potato slice, cucumber, tomato, melted cheese and mint spread.',
        price: 50,
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 32,
        lowStockThreshold: 8,
        preparationTimeMinutes: 10,
        imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
        rating: 4.6,
        ratingCount: 46,
        isFeatured: false,
        tags: ['snacks', 'quick-bite', 'sandwich'],
        availableMealWindows: ['snacks', 'late-night'],
        recipeIngredients: [
          { ingredient: ingMap['Potatoes (Aloo)'], quantity: 0.05, unit: 'kg' },
          { ingredient: ingMap['Tomatoes'], quantity: 0.03, unit: 'kg' },
        ],
      },
      {
        name: 'Double Masala Maggi',
        description: 'The iconic college 2-minute Maggi prepared with double tastemaker, butter, sautéed green chilies, onions and peas.',
        price: 40,
        category: 'late-night',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 75,
        lowStockThreshold: 15,
        preparationTimeMinutes: 8,
        imageUrl: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        ratingCount: 140,
        isFeatured: true,
        tags: ['late-night', 'hostel-classic', 'fast'],
        availableMealWindows: ['snacks', 'late-night'],
        recipeIngredients: [
          { ingredient: ingMap['Maggi Noodles Packets'], quantity: 1, unit: 'packets' },
          { ingredient: ingMap['Onions'], quantity: 0.03, unit: 'kg' },
        ],
      },
      {
        name: 'Crispy Samosa (2 pcs)',
        description: 'Crisp golden pastry pockets stuffed with cumin-tempered spiced potatoes and green peas, served with sweet tamarind chutney.',
        price: 30,
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        lowStockThreshold: 10,
        preparationTimeMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
        rating: 4.7,
        ratingCount: 95,
        isFeatured: false,
        tags: ['snacks', 'tea-time', 'street-food'],
        availableMealWindows: ['snacks'],
        recipeIngredients: [
          { ingredient: ingMap['Potatoes (Aloo)'], quantity: 0.1, unit: 'kg' },
          { ingredient: ingMap['Wheat Flour (Atta)'], quantity: 0.08, unit: 'kg' },
        ],
      },
      {
        name: 'Adrak Elaichi Kadak Chai',
        description: 'Freshly brewed strong Indian milk tea infused with crushed ginger root and green cardamom. The ultimate study fuel.',
        price: 15,
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 90,
        lowStockThreshold: 15,
        preparationTimeMinutes: 5,
        imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
        rating: 4.9,
        ratingCount: 220,
        isFeatured: true,
        tags: ['beverage', 'hot', 'all-time-favourite'],
        availableMealWindows: ['breakfast', 'snacks', 'late-night'],
        recipeIngredients: [
          { ingredient: ingMap['Full Cream Milk'], quantity: 0.08, unit: 'litres' },
          { ingredient: ingMap['Assam Tea Leaves'], quantity: 0.01, unit: 'kg' },
        ],
      },
      {
        name: 'Thick Cold Coffee',
        description: 'Blended creamy chilled coffee whipped with full-cream milk, dark roast espresso, chocolate drizzle and ice cream scoop.',
        price: 50,
        category: 'snacks',
        isVeg: true,
        isAvailable: true,
        stockQuantity: 40,
        lowStockThreshold: 10,
        preparationTimeMinutes: 6,
        imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=800&q=80',
        rating: 4.8,
        ratingCount: 84,
        isFeatured: true,
        tags: ['beverage', 'chilled', 'summer'],
        availableMealWindows: ['snacks', 'late-night'],
        recipeIngredients: [
          { ingredient: ingMap['Full Cream Milk'], quantity: 0.18, unit: 'litres' },
          { ingredient: ingMap['Coffee Beans & Powder'], quantity: 0.02, unit: 'kg' },
        ],
      },
    ]);

    console.log('🌱 Seeding Standard Pickup Slots for Today...');
    const todayStr = new Date().toISOString().split('T')[0];
    const defaultWindows = [
      { start: '08:00', end: '08:15', mealPeriod: 'breakfast', maxCapacity: 20 },
      { start: '08:15', end: '08:30', mealPeriod: 'breakfast', maxCapacity: 20 },
      { start: '08:30', end: '08:45', mealPeriod: 'breakfast', maxCapacity: 20 },
      { start: '08:45', end: '09:00', mealPeriod: 'breakfast', maxCapacity: 20 },
      { start: '12:30', end: '12:45', mealPeriod: 'lunch', maxCapacity: 25 },
      { start: '12:45', end: '13:00', mealPeriod: 'lunch', maxCapacity: 25 },
      { start: '13:00', end: '13:15', mealPeriod: 'lunch', maxCapacity: 25 },
      { start: '13:15', end: '13:30', mealPeriod: 'lunch', maxCapacity: 25 },
      { start: '16:30', end: '16:45', mealPeriod: 'snacks', maxCapacity: 20 },
      { start: '16:45', end: '17:00', mealPeriod: 'snacks', maxCapacity: 20 },
      { start: '17:00', end: '17:15', mealPeriod: 'snacks', maxCapacity: 20 },
      { start: '19:30', end: '19:45', mealPeriod: 'dinner', maxCapacity: 25 },
      { start: '19:45', end: '20:00', mealPeriod: 'dinner', maxCapacity: 25 },
      { start: '20:00', end: '20:15', mealPeriod: 'dinner', maxCapacity: 25 },
      { start: '22:30', end: '22:45', mealPeriod: 'late-night', maxCapacity: 15 },
      { start: '22:45', end: '23:00', mealPeriod: 'late-night', maxCapacity: 15 },
    ];

    const slots = await PickupSlot.insertMany(
      defaultWindows.map((w) => ({
        startTime: w.start,
        endTime: w.end,
        mealPeriod: w.mealPeriod,
        date: todayStr,
        maxCapacity: w.maxCapacity,
        currentBookings: 0,
        isClosed: false,
      }))
    );

    console.log('🌱 Seeding Sample Orders across different states...');
    const slot0 = slots[0]; // breakfast
    const slot1 = slots[4]; // lunch

    // 1. A ready-for-pickup order for student1 (so user can test QR scanner immediately!)
    const orderNum1 = 'BS-10294';
    const token1 = 'TK-7A9B';
    const tempId1 = new mongoose.Types.ObjectId();
    const qr1 = generateQRPayload(tempId1.toString(), orderNum1, token1);

    await Order.create({
      _id: tempId1,
      orderNumber: orderNum1,
      student: student1._id,
      items: [
        {
          menuItem: dishes[3]._id, // Masala Dosa
          name: dishes[3].name,
          price: dishes[3].price,
          quantity: 1,
          subtotal: 65,
          isVeg: true,
        },
        {
          menuItem: dishes[10]._id, // Chai
          name: dishes[10].name,
          price: dishes[10].price,
          quantity: 2,
          subtotal: 30,
          isVeg: true,
        },
      ],
      totalAmount: 95,
      discountAmount: 10,
      finalAmount: 85,
      status: 'ready',
      pickupSlot: slot0._id,
      slotDisplay: {
        startTime: slot0.startTime,
        endTime: slot0.endTime,
        date: slot0.date,
        mealPeriod: slot0.mealPeriod,
      },
      pickupToken: token1,
      qrCodeData: qr1,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      paymentDetails: { transactionId: 'TXN-SEED-01', paidAt: new Date() },
      hostelDetails: student1.hostel,
      cancellationDeadline: new Date(Date.now() + 3600000),
      statusTimestamps: {
        placedAt: new Date(Date.now() - 30 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 25 * 60 * 1000),
        preparingAt: new Date(Date.now() - 15 * 60 * 1000),
        readyAt: new Date(Date.now() - 5 * 60 * 1000),
      },
    });

    slot0.currentBookings += 1;
    await slot0.save();

    // 2. A preparing order for student2
    const orderNum2 = 'BS-48192';
    const token2 = 'TK-3X8Y';
    const tempId2 = new mongoose.Types.ObjectId();
    const qr2 = generateQRPayload(tempId2.toString(), orderNum2, token2);

    await Order.create({
      _id: tempId2,
      orderNumber: orderNum2,
      student: student2._id,
      items: [
        {
          menuItem: dishes[4]._id, // Veg Thali
          name: dishes[4].name,
          price: dishes[4].price,
          quantity: 1,
          subtotal: 120,
          isVeg: true,
        },
      ],
      totalAmount: 120,
      discountAmount: 0,
      finalAmount: 120,
      status: 'preparing',
      pickupSlot: slot1._id,
      slotDisplay: {
        startTime: slot1.startTime,
        endTime: slot1.endTime,
        date: slot1.date,
        mealPeriod: slot1.mealPeriod,
      },
      pickupToken: token2,
      qrCodeData: qr2,
      paymentMethod: 'wallet',
      paymentStatus: 'completed',
      paymentDetails: { transactionId: 'TXN-SEED-02', paidAt: new Date() },
      hostelDetails: student2.hostel,
      cancellationDeadline: new Date(Date.now() + 7200000),
      statusTimestamps: {
        placedAt: new Date(Date.now() - 20 * 60 * 1000),
        acceptedAt: new Date(Date.now() - 15 * 60 * 1000),
        preparingAt: new Date(Date.now() - 8 * 60 * 1000),
      },
    });

    slot1.currentBookings += 1;
    await slot1.save();

    console.log('🌱 Seeding Announcements and Hostel Offers...');
    await Announcement.insertMany([
      {
        title: '🎉 Flat 10% Off with Code BITESYNC10',
        description: 'Skip the canteen rush and pre-order your meals. Apply coupon code BITESYNC10 at checkout for up to ₹50 off!',
        type: 'offer',
        discountPercent: 10,
        couponCode: 'BITESYNC10',
        maxDiscountAmount: 50,
        minOrderAmount: 50,
        badgeText: 'Trending',
        bannerColor: 'orange',
      },
      {
        title: '🌙 Late Night Canteen Hours Extended',
        description: 'Canteen counter is now open till 1:00 AM every night during mid-term examination week. Fresh Maggi and Cold Coffee available!',
        type: 'announcement',
        badgeText: 'Exam Notice',
        bannerColor: 'purple',
      },
      {
        title: 'Aryabhata Hostel Exclusive: Extra Sweet with Lunch Thali',
        description: 'All orders from Aryabhata Bhavan Block-A & B receive complimentary Rasgulla on Wednesday lunch orders.',
        type: 'offer',
        hostelSpecific: ['Aryabhata Bhavan'],
        badgeText: 'Hostel Special',
        bannerColor: 'emerald',
      },
    ]);

    console.log('🌱 Seeding Meal Subscription Plans...');
    await MealPlan.insertMany([
      {
        name: '7-Day Weekly Mess Pass',
        description: '14 wholesome meals covering lunch and dinner for 7 days. Free cancellation up to 30 mins before slots.',
        planType: 'weekly',
        durationDays: 7,
        mealCreditsCount: 14,
        price: 1120,
        savingsText: 'Save 20% vs a la carte',
        allowedMealTypes: ['lunch', 'dinner'],
      },
      {
        name: '30-Day Monthly Full Board',
        description: '60 meals covering lunch and dinner for full month with priority counter pickup.',
        planType: 'monthly',
        durationDays: 30,
        mealCreditsCount: 60,
        price: 4500,
        savingsText: 'Save 25% + Free Weekend Chai',
        allowedMealTypes: ['lunch', 'dinner'],
      },
      {
        name: '10-Meal Flexi Credit Bundle',
        description: '10 meal credits usable anytime across breakfast, lunch, snacks or dinner with no expiration.',
        planType: 'credit_bundle',
        durationDays: 90,
        mealCreditsCount: 10,
        price: 850,
        savingsText: 'Save 15%',
        allowedMealTypes: ['breakfast', 'lunch', 'dinner', 'snacks'],
      },
    ]);

    console.log('✅ BiteSync database successfully seeded with realistic hostel canteen data!');
    console.log('========================================================');
    console.log('DEMO ACCOUNTS FOR LOGIN & TESTING:');
    console.log('1. Student:       student@bitesync.com   / Password123');
    console.log('2. Admin:         admin@bitesync.com     / Password123');
    console.log('3. Kitchen Staff: kitchen@bitesync.com   / Password123');
    console.log('========================================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

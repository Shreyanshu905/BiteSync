const PickupSlot = require('../models/PickupSlot');

const getTodayString = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

// @desc    Get slots for a date & meal period with remaining capacity
// @route   GET /api/slots
// @access  Public
const getSlots = async (req, res, next) => {
  try {
    const { date, mealPeriod } = req.query;
    const targetDate = date || getTodayString();

    const query = { date: targetDate };
    if (mealPeriod && mealPeriod !== 'all') {
      query.mealPeriod = mealPeriod;
    }

    let slots = await PickupSlot.find(query).sort({ startTime: 1 });

    // If no slots exist for the date, automatically initialize default standard slots!
    if (slots.length === 0) {
      await initializeDefaultSlots(targetDate);
      slots = await PickupSlot.find(query).sort({ startTime: 1 });
    }

    res.json({
      success: true,
      date: targetDate,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: populate default pickup slots for a date
const initializeDefaultSlots = async (dateStr) => {
  const defaultWindows = [
    // Breakfast: 8:00 AM - 10:00 AM (15-min intervals)
    { start: '08:00', end: '08:15', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '08:15', end: '08:30', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '08:30', end: '08:45', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '08:45', end: '09:00', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '09:00', end: '09:15', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '09:15', end: '09:30', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '09:30', end: '09:45', mealPeriod: 'breakfast', maxCapacity: 20 },
    { start: '09:45', end: '10:00', mealPeriod: 'breakfast', maxCapacity: 20 },

    // Lunch: 12:30 PM - 2:30 PM (15-min intervals)
    { start: '12:30', end: '12:45', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '12:45', end: '13:00', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '13:00', end: '13:15', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '13:15', end: '13:30', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '13:30', end: '13:45', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '13:45', end: '14:00', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '14:00', end: '14:15', mealPeriod: 'lunch', maxCapacity: 25 },
    { start: '14:15', end: '14:30', mealPeriod: 'lunch', maxCapacity: 25 },

    // Snacks: 4:30 PM - 6:00 PM (15-min intervals)
    { start: '16:30', end: '16:45', mealPeriod: 'snacks', maxCapacity: 20 },
    { start: '16:45', end: '17:00', mealPeriod: 'snacks', maxCapacity: 20 },
    { start: '17:00', end: '17:15', mealPeriod: 'snacks', maxCapacity: 20 },
    { start: '17:15', end: '17:30', mealPeriod: 'snacks', maxCapacity: 20 },
    { start: '17:30', end: '17:45', mealPeriod: 'snacks', maxCapacity: 20 },
    { start: '17:45', end: '18:00', mealPeriod: 'snacks', maxCapacity: 20 },

    // Dinner: 7:30 PM - 9:45 PM (15-min intervals)
    { start: '19:30', end: '19:45', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '19:45', end: '20:00', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '20:00', end: '20:15', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '20:15', end: '20:30', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '20:30', end: '20:45', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '20:45', end: '21:00', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '21:00', end: '21:15', mealPeriod: 'dinner', maxCapacity: 25 },
    { start: '21:15', end: '21:30', mealPeriod: 'dinner', maxCapacity: 25 },

    // Late Night: 10:30 PM - Midnight
    { start: '22:30', end: '22:45', mealPeriod: 'late-night', maxCapacity: 15 },
    { start: '22:45', end: '23:00', mealPeriod: 'late-night', maxCapacity: 15 },
    { start: '23:00', end: '23:15', mealPeriod: 'late-night', maxCapacity: 15 },
    { start: '23:15', end: '23:30', mealPeriod: 'late-night', maxCapacity: 15 },
    { start: '23:30', end: '23:45', mealPeriod: 'late-night', maxCapacity: 15 },
    { start: '23:45', end: '00:00', mealPeriod: 'late-night', maxCapacity: 15 },
  ];

  const slotsToCreate = defaultWindows.map((w) => ({
    startTime: w.start,
    endTime: w.end,
    mealPeriod: w.mealPeriod,
    date: dateStr,
    maxCapacity: w.maxCapacity,
    currentBookings: 0,
    isClosed: false,
  }));

  try {
    await PickupSlot.insertMany(slotsToCreate, { ordered: false });
  } catch (err) {
    // Ignore duplicate key errors if already partially created
  }
};

// @desc    Create new pickup slot
// @route   POST /api/slots
// @access  Private (Admin only)
const createSlot = async (req, res, next) => {
  try {
    const { startTime, endTime, mealPeriod, date, maxCapacity } = req.body;

    const existing = await PickupSlot.findOne({
      startTime,
      date: date || getTodayString(),
      mealPeriod,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Pickup slot already exists for this time window.' });
    }

    const slot = await PickupSlot.create({
      startTime,
      endTime,
      mealPeriod,
      date: date || getTodayString(),
      maxCapacity: maxCapacity || 20,
    });

    res.status(201).json({ success: true, message: 'Pickup slot created', data: slot });
  } catch (error) {
    next(error);
  }
};

// @desc    Update or edit pickup slot
// @route   PUT /api/slots/:id
// @access  Private (Admin only)
const updateSlot = async (req, res, next) => {
  try {
    const slot = await PickupSlot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    res.json({ success: true, message: 'Slot updated successfully', data: slot });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle slot open / closed
// @route   PATCH /api/slots/:id/toggle-close
// @access  Private (Admin or Kitchen)
const toggleCloseSlot = async (req, res, next) => {
  try {
    const slot = await PickupSlot.findById(req.params.id);
    if (!slot) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }

    slot.isClosed = !slot.isClosed;
    if (req.body.closureReason) {
      slot.closureReason = req.body.closureReason;
    }
    await slot.save();

    res.json({
      success: true,
      message: `Slot ${slot.startTime}-${slot.endTime} is now ${slot.isClosed ? 'Closed' : 'Open'}`,
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSlots,
  createSlot,
  updateSlot,
  toggleCloseSlot,
  initializeDefaultSlots,
};


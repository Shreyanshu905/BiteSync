const Announcement = require('../models/Announcement');

// @desc    Get all active announcements and offers
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = async (req, res, next) => {
  try {
    const { hostel, type } = req.query;
    const query = { isActive: true };

    if (type) {
      query.type = type;
    }

    let items = await Announcement.find(query).sort({ createdAt: -1 });

    // Filter by student hostel if specified
    if (hostel && hostel.trim() !== '') {
      items = items.filter(
        (item) => !item.hostelSpecific || item.hostelSpecific.length === 0 || item.hostelSpecific.includes(hostel)
      );
    }

    res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement or offer
// @route   POST /api/announcements
// @access  Private (Admin only)
const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin only)
const updateAnnouncement = async (req, res, next) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    res.json({ success: true, message: 'Announcement updated', data: item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin only)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const item = await Announcement.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }
    await item.deleteOne();
    res.json({ success: true, message: 'Announcement removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};

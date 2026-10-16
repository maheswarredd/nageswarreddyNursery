const Setting = require('../models/Setting');

// Get Store Settings (Public & Admin)
const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        siteName: 'Nageswarreddy Nursery Plants',
        upiId: process.env.UPI_ID || 'nageswarreddyplants@okaxis',
        upiName: process.env.UPI_NAME || 'Nageswarreddy Nursery Plants'
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// Admin: Update Store Settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json({ success: true, message: 'Settings updated successfully.', settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};

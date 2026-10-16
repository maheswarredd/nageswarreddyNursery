const express = require('express');
const router = express.Router();
const {
  getPlants,
  getPlantBySlugOrId,
  createPlant,
  updatePlant,
  deletePlant
} = require('../controllers/plantController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Public
router.get('/', getPlants);
router.get('/:identifier', getPlantBySlugOrId);

// Admin Only
router.post('/', verifyToken, verifyAdmin, createPlant);
router.put('/:id', verifyToken, verifyAdmin, updatePlant);
router.delete('/:id', verifyToken, verifyAdmin, deletePlant);

module.exports = router;

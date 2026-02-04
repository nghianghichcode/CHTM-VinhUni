const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');
const { asyncHandler } = require('../middlewares/asyncHandler');

router.get('/:slug', asyncHandler(tipController.byCategory));

module.exports = router;

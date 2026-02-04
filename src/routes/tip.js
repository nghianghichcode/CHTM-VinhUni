const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');
const { asyncHandler } = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(tipController.list));
router.get('/:slug', asyncHandler(tipController.detail));

module.exports = router;

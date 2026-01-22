const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');

router.get('/', tipController.list);
router.get('/:slug', tipController.detail);

module.exports = router;

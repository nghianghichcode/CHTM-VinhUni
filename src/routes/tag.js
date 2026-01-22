const express = require('express');
const router = express.Router();
const tipController = require('../controllers/tipController');

router.get('/:slug', tipController.byTag);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getLanguages, translateText, getHistory } = require('../controllers/translationController');

router.get('/languages', getLanguages);
router.post('/translate', translateText);
router.get('/history', getHistory);

module.exports = router;

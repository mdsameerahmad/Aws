// income-service/src/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const { resetAllCarryMatchedToday } = require('../utils/resetCarryForNewDay');
const { handleTopupTrigger } = require('../controllers/incomeController');

router.get('/test-reset-cap', async (req, res) => {
  try {
    await resetAllCarryMatchedToday(); // manually run the function
    res.status(200).json({ message: 'Cron test executed!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Test route for topup-trigger
router.post('/test-topup-trigger', async (req, res) => {
  try {
    console.log('🧪 Test topup-trigger route hit');
    console.log('🧪 Request body:', req.body);
    
    // Validate request body
    const { userId, coins } = req.body;
    if (!userId || !coins) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['userId', 'coins'],
        received: req.body 
      });
    }
    
    // Call the actual handler
    await handleTopupTrigger(req, res);
  } catch (err) {
    console.error('🧪 Test topup-trigger error:', err);
    res.status(500).json({ error: err.message });
  }
});

    module.exports = router;

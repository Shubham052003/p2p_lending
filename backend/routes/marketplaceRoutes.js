const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/marketplaceController');

router.use(protect, requireRole('lender'));

router.get('/',    ctrl.getMarketplace);
router.get('/:id', ctrl.getLoanDetail);

module.exports = router;
const router = require('express').Router();
const { body } = require('express-validator');
const { protect, requireRole } = require('../middleware/auth');
const ctrl = require('../controllers/loanController');

const loanValidation = [
  body('amount').isFloat({ min: 1000, max: 500000 }).withMessage('Amount: ₹1,000–₹5,00,000'),
  body('tenure').isInt({ min: 1, max: 60 }).withMessage('Tenure: 1–60 months'),
  body('interestRate').isFloat({ min: 1, max: 36 }).withMessage('Rate: 1%–36%'),
  body('reason').isLength({ min: 10, max: 500 }).withMessage('Reason: 10–500 chars'),
];

router.use(protect, requireRole('borrower'));   // all routes below: borrower only

router.route('/')
  .post(loanValidation, ctrl.createLoan);

router.route('/my')
  .get(ctrl.getMyLoans);

router.route('/:id')
  .get(ctrl.getLoanById)
  .patch(ctrl.updateLoan)
  .delete(ctrl.cancelLoan);

module.exports = router;
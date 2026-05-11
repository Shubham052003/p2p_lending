const { validationResult } = require('express-validator');
const LoanRequest = require('../models/LoanRequest');
const ApiError    = require('../utils/ApiError');

// POST /api/loans — Create loan request
exports.createLoan = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, errors: errors.array() });

    const { amount, tenure, interestRate, reason } = req.body;
    const loan = await LoanRequest.create({
      borrower: req.user._id,
      amount, tenure, interestRate, reason,
    });
    res.status(201).json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// GET /api/loans/my — All loans for logged-in borrower
exports.getMyLoans = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { borrower: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [loans, total] = await Promise.all([
      LoanRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      LoanRequest.countDocuments(filter),
    ]);
    res.json({ success: true, count: loans.length, total, page: Number(page), data: loans });
  } catch (err) { next(err); }
};

// GET /api/loans/:id — Single loan (borrower's own only)
exports.getLoanById = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findOne({ _id: req.params.id, borrower: req.user._id });
    if (!loan) return next(new ApiError('Loan not found', 404));
    res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// PATCH /api/loans/:id — Edit pending loan
exports.updateLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findOne({ _id: req.params.id, borrower: req.user._id });
    if (!loan) return next(new ApiError('Loan not found', 404));
    if (loan.status !== 'pending')
      return next(new ApiError('Only pending loans can be edited', 400));

    const allowed = ['amount', 'tenure', 'interestRate', 'reason'];
    allowed.forEach(field => { if (req.body[field] !== undefined) loan[field] = req.body[field]; });
    await loan.save();
    res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

// DELETE /api/loans/:id — Cancel (soft delete)
exports.cancelLoan = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findOne({ _id: req.params.id, borrower: req.user._id });
    if (!loan) return next(new ApiError('Loan not found', 404));
    if (loan.status !== 'pending')
      return next(new ApiError('Only pending loans can be cancelled', 400));
    loan.status = 'cancelled';
    await loan.save();
    res.json({ success: true, message: 'Loan cancelled', data: loan });
  } catch (err) { next(err); }
};
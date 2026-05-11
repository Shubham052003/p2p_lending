const LoanRequest = require('../models/LoanRequest');
const ApiError    = require('../utils/ApiError');

// GET /api/marketplace — Browse all pending loans
exports.getMarketplace = async (req, res, next) => {
  try {
    const { minAmount, maxAmount, maxTenure, minRate, maxRate, page = 1, limit = 12 } = req.query;
    const filter = { status: 'pending' };

    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }
    if (maxTenure) filter.tenure = { $lte: Number(maxTenure) };
    if (minRate || maxRate) {
      filter.interestRate = {};
      if (minRate) filter.interestRate.$gte = Number(minRate);
      if (maxRate) filter.interestRate.$lte = Number(maxRate);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [loans, total] = await Promise.all([
      LoanRequest.find(filter)
        .populate('borrower', 'name createdAt')   // only safe public fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      LoanRequest.countDocuments(filter),
    ]);
    res.json({ success: true, count: loans.length, total, page: Number(page), data: loans });
  } catch (err) { next(err); }
};

// GET /api/marketplace/:id — View one loan detail
exports.getLoanDetail = async (req, res, next) => {
  try {
    const loan = await LoanRequest.findOne({ _id: req.params.id, status: 'pending' })
      .populate('borrower', 'name createdAt');
    if (!loan) return next(new ApiError('Loan not found or no longer available', 404));
    res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};
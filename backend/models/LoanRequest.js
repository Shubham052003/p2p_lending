const mongoose = require('mongoose');

const LoanRequestSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,            // index for fast borrower-based queries
    },
    amount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [1000,   'Minimum loan amount is ₹1,000'],
      max: [500000, 'Maximum loan amount is ₹5,00,000'],
    },
    tenure: {
      type: Number,
      required: [true, 'Tenure is required'],
      min: [1,  'Minimum tenure is 1 month'],
      max: [60, 'Maximum tenure is 60 months'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [1, 'Minimum rate is 1%'],
      max: [36, 'Maximum rate is 36%'],
    },
    reason: {
      type: String,
      required: [true, 'Reason for loan is required'],
      trim: true,
      minlength: [10,  'Reason must be at least 10 characters'],
      maxlength: [500, 'Reason cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'funded', 'repaying', 'closed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    amountFunded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Virtual: EMI calculation
LoanRequestSchema.virtual('monthlyEMI').get(function () {
  const r = this.interestRate / 100 / 12;
  const n = this.tenure;
  if (r === 0) return Math.round(this.amount / n);
  return Math.round((this.amount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
});

module.exports = mongoose.model('LoanRequest', LoanRequestSchema);
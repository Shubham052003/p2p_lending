const mongoose = require('mongoose');

const FundedLoanSchema = new mongoose.Schema(
  {
    loanRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanRequest',
      required: true,
    },
    lender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amountFunded:  { type: Number, required: true, min: 100 },
    repaidAmount:  { type: Number, default: 0 },
    isFullyRepaid: { type: Boolean, default: false },
    stripePaymentIntentId: { type: String, default: null },
    fundedAt:      { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual: outstanding balance
FundedLoanSchema.virtual('outstanding').get(function () {
  return this.amountFunded - this.repaidAmount;
});

module.exports = mongoose.model('FundedLoan', FundedLoanSchema);
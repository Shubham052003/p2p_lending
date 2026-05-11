const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ['fund', 'repayment', 'withdrawal', 'refund'],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    relatedLoan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FundedLoan',
      default: null,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },

    note: {
      type: String,
      maxlength: 200,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  amount: Number,

  purpose: String,

  status: {
    type: String,
    enum: ["pending", "funded", "cancelled"],
    default: "pending",
  },
});

module.exports = mongoose.model("Loan", loanSchema);
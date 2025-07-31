import mongoose from "mongoose";

const bankAccountSchema = new mongoose.Schema({
  bankName: {
    type: String,
    required: [true, "Bank name is required"],
    trim: true,
  },
  accountNumber: {
    type: String,
    required: [true, "Account number is required"],
    minlength: [8, "Account number must be at least 8 digits"],
  },
  ifscCode: {
    type: String,
    required: [true, "IFSC code is required"],
    uppercase: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"],
  },
  upiId: {
    type: String,
    trim: true,
    default: "",
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



export const BankAccount = mongoose.model("BankAccount", bankAccountSchema);

export default BankAccount;

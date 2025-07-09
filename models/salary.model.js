import mongoose from "mongoose";

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  salaryMonth: { 
    type: String,
     required: true
     },

  basic: Number,
  allowances: Number,
  deductions: Number,
  netSalary: Number,
  paymentDate: Date,
  status: { 
    type: String, 
    enum: ["Paid", "Pending"],
     default: "Pending"
     },
});

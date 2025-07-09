import mongoose from "mongoose";


const salarySchema = new mongoose.Schema({
   employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  salaryMonth: {
    type: String,
    required: [true, 'Salary month is required'],
    trim: true,
  },
  basic: {
    type: Number,
    default: 0,
  },
  allowances: {
    type: Number,
    default: 0,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  netSalary: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending'],
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



const Salary = mongoose.model("Salary", salarySchema);

export default Salary;
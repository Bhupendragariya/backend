import mongoose from "mongoose";

const payslipSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: String,
    year: Number,
    attendance: {
      present: Number,
      absent: Number,
      onLeave: Number,
      holidays: Number,
    },
    earnings: {
      basic: Number,
      hra: Number,
      vehiclePetrol: Number, 
      medicalAllowance: Number,
    },
    deductions: {
      professionalTax: Number,
      tds: Number,
      pf: Number,
      attendanceDeduction: Number,
    },
    grossSalary: Number,
    totalDeductions: Number,
    netSalary: Number,
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },
    paymentDate: Date,
  },
  { timestamps: true }
);

const Payslip = mongoose.model("Payslip", payslipSchema);
export default Payslip;



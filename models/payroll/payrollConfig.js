import mongoose from "mongoose";

const payrollConfigSchema = new mongoose.Schema({
  //-------salary structure-----------
  basicSalary: { type: Number, default: 0 },
  deductionPercentage: { type: Number, default: 0 },
  transportAllowancePercentage: { type: Number, default: 0 },

  //-------paymentMethods-----------
  bankTransfer: { type: Boolean, default: false },
  upiPayment: { type: Boolean, default: false },
  chequePayment: { type: Boolean, default: false },
  cashPayment: { type: Boolean, default: false },


  //-------payrollProcessing-----------
  payrollLockDate: { type: Number, default: 25 },
  salaryPaymentDate: { type: Number, default: 1 },
  autoGeneratePayslips: { type: Boolean, default: false },
  emailPayslips: { type: Boolean, default: false },


  //-------taxation rules-----------
  pfEmployeeContribution: { type: Number, default: 10 },
  pfEmployerContribution: { type: Number, default: 10 },
  esiEmployeeContribution: { type: Number, default: 0.25 },
  maximumScore: { type: Number, default: 10 },
  professionalTaxMonthly: { type: Number, default: 200 }

}, { timestamps: true });

const PayrollConfig = mongoose.model("PayrollConfig", payrollConfigSchema);

export default PayrollConfig;
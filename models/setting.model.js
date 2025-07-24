
import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  companyInfo: {
    name: String,
    email: String,
    address: String
  },
  systemDefaults: {
    timeZone: String,
    currency: String,
    fiscalYearStart: String,
    salaryCycle: String
  },
  preferences: {
    appearance: { type: String, enum: ['Bright', 'Dark'], default: 'Bright' },  


    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },





    workConfig: {
    weekendDays: {
      type: [String],
      default: ['Saturday', 'Sunday'],
    },
  },


    locationTracking: {
    gpsTrackingEnabled: { type: Boolean, default: false },
    restrictByLocation: { type: Boolean, default: false },
    allowedRadiusMeters: { type: Number, default: 100 }, 
  },


    attendanceRules: {
    autoMarkAbsent: { type: Boolean, default: false },
    autoAbsentAfterHours: { type: Number, default: 2 }, 
    autoCheckout: { type: Boolean, default: false }
  },


  checkInOutRules: {
  checkInBufferTime: { type: Number, default: 20 },
  checkOutBufferTime: { type: Number, default: 20 },
  lateMarkThreshold: { type: Number, default: 60 },
  halfDayThreshold: { type: Number, default: 4 },
},



salaryStructure: {
  basicSalary: { type: Number, default: 0 },
  deductionPercentage: { type: Number, default: 0 },
  transportAllowancePercentage: { type: Number, default: 0 }
},



paymentMethods: {
  bankTransfer: { type: Boolean, default: false },
  upiPayment: { type: Boolean, default: false },
  chequePayment: { type: Boolean, default: false },
  cashPayment: { type: Boolean, default: false }
},

payrollProcessing: {
  payrollLockDate: { type: Number, default: 25 }, 
  salaryPaymentDate: { type: Number, default: 1 }, 
  autoGeneratePayslips: { type: Boolean, default: false },
  emailPayslips: { type: Boolean, default: false }
},


taxContributions: {
  pfEmployeeContribution: { type: Number, default: 10 }, 
  pfEmployerContribution: { type: Number, default: 10 },  
  esiEmployeeContribution: { type: Number, default: 0.25 }, 
  maximumScore: { type: Number, default: 10 }, 
  professionalTaxMonthly: { type: Number, default: 200 } 
}
  



}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

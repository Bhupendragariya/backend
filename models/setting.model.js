
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
  }

  



}, { timestamps: true });

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;

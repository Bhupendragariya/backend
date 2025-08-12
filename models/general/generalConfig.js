import mongoose from "mongoose";


const generalConfigSchema = new mongoose.Schema({
  //-------company info-----------
  companyName: {
    type: String,
    default: 'NovaNectar Pvt Ltd'
  },
  companyEmail: {
    type: String,
    default: 'intership@novanectar.co.in'
  },
  companyAddress: {
    type: String,
    default: 'GMS Road,Dehradun, Uttarakhand, India'
  },

  //-------system defaults--------
  defaultTimezone: {
    type: String,
    default: 'UTC'
  },
  defaultCurrency: {
    type: String,
    default: 'Rs',
  },
  defaultFiscalYearStartMonth: {
    type: String,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    default: 'April',
  },

  //-------preferences--------
  appearance: {
    type: String,
    enum: ['bright', 'dark'],
    default: 'bright'
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  smsNotifications: {
    type: Boolean,
    default: false
  },
}, { timestamps: true });

const GeneralConfig = mongoose.model("GeneralConfig", generalConfigSchema);

export default GeneralConfig;
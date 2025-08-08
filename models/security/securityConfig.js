import mongoose from "mongoose";

const securityConfigSchema = new mongoose.Schema({
  //-------authentication setting----------
  isRequireTwoFactorAuthentication: {
    type: Boolean,
    default: false
  },
  sessionTimeout: {//min
    type: Number,
    min: 0,
    default: 30
  },
  maxLoginAttempts: {
    type: Number,
    min: 1,
    default: 5
  },
  accountLockoutDuration: {//min
    type: Number,
    min: 0,
    default: 30
  },


  //-------password policy-----------
  minPasswordLength: {
    type: Number,
    min: 1,
    default: 8
  },
  isRequireUppercase: {
    type: Boolean,
    default: true
  },
  isRequireNumber: {
    type: Boolean,
    default: true
  },
  isRequireSpecialChar: {
    type: Boolean,
    default: true
  },
  passwordExpirationDays: { //days
    type: Number,
    default: 90,
  },


  //-------leave type-----------
  leaveTypes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
  }],
}, { timestamps: true });

const SecurityConfig = mongoose.model("SecurityConfig", securityConfigSchema);

export default SecurityConfig;
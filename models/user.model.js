import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({

  fullName: {
    type: String,
    required: true,
    minLength: [3, "first name must contain at least 3 characters!"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },


  password:{
      type: String,
      required: [true, "Password is required"]
    
  },

  employeeId: {
    type: String,
    unique: true,
    
  },
  
   status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: "Active",

  },

  role: {
    type: String,
    enm: ["admin", "employee", "hr"],
    default: "employee",

  },
  photo: {
    type: String,
   
  },

  department:{
    type:String,
  
  },

  position:{
    type:String,

  },

  phone:{
    type: Number,

  },

  joinedOn:{
    type:Date,
    default: Date.now,

  
  },

  fatherName:{
    type:String,
    
  },

  emergencyContact:{
    name:String,
    phone: Number
  },

  currentAddress:{
    type:String,
    
  },

  permanentAddress:{
    type:String,
  },


   otp:{
    type:String,
   } ,


  otpExpires: {
    type:Date
  },

    refreshToken: {
      type: String,
    },


}, { timestamps: true });


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 7);
  next();
});

userSchema.methods.comparePassword = async function (Password) {
  return await bcrypt.compare(Password, this.password);
};


userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};





const User = mongoose.model("User", userSchema);

export default User;


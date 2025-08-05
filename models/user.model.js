import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  user:{
    type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, "Please enter a valid email address"],
  },


  password: {
    type: String,
    required: [true, "Password is required"]

  },

  role: {
    type: String,
    enum: ["Admin", "HR", "Employee"],
    default: "Employee",
  },


  refreshToken: {
    type: String,
    select: false
  },


  notificationEmail: {
    type: String,
    default: "",
  },


  otp: {
    type: String,
  },

  otpExpires: {
    type: Date
  }


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
      role: this.role,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};





const User = mongoose.model("User", userSchema);

export default User;


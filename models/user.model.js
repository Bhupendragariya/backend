import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  currAddress: {
    type: String,
  },
  permAddress: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
});

const photoSchema = new mongoose.Schema({
  url: {   //cloudinary url
    type: String,
  },
  publicId: { //cloudinary public id 
    type: String,
  }
})


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
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    enum: ["admin", "employee", "hr"],
    default: "employee",
  },
  photo: photoSchema,
  bio: { type: String },
  address: addressSchema,

  otp: {
    type: String,
  },

  otpExpires: {
    type: Date
  },

}, { timestamps: true });




const User = mongoose.model("User", userSchema);

export default User;


import mongoose from "mongoose";

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
    required: true,
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
  }


}, { timestamps: true });




const User = mongoose.model("User", userSchema);

export default User;


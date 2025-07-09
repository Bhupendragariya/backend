import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  employeeId: {
    type: String,
    required: true,
    unique: true,
  },
  contactNo: {
    type: Number,
    required: true,
  },
  emergencyContact: {
    name: String,
    phone: Number
  },
  bankDetails,
  //   status: {
  //   type: String,
  //   enum: ['Active', 'Inactive'],
  //   default: "Active",
  // },
  fatherName: {
    type: String,
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer not to say'],
  },
  department: {
    type: String,
  },
  position: {
    type: String,  //intern
  },
  joinedOn: {
    type: Date,
    default: Date.now,
  },
  bankDetails: bankDetailsSchema,
  salaryDetails: {
    type: mongoose.Schema.types.ObjectId,
    ref: 'Salary'
  },
  documents: [{
    types: mongoose.Schema.types.ObjectId,
    ref: 'Document'
  }],
  leaveDetails: [{
    types: mongoose.Schema.types.ObjectId,
    ref: 'Leave'
  }],
},
  { timestamps: true })

export const Employee = mongoose.model('Employee', employeeSchema);
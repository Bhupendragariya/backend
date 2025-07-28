import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    employeeId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },
    fullName: {
      type: String,
      required: true,
    },
    fatherName: {
      type: String,
    },
    contactNo: {
      type: Number,
      required: true,
    },
    emergencyContact: {
      name: String,
      phone: Number,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "prefer not to say"],
      default: 'prefer not to say'
    },
    joinedOn: {
      type: Date,
      required: true,
      default: Date.now,
    },
    currentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    pincode: {
      type: Number,
      default: 249201
    },
    city: {
      type: String,
      default: 'Dehradun'
    },
    state: {
      type: String,
      default: 'Uttarakhand'
    },

    department: {    //hr,design,it/development,marketing,sales
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    position: {      //web developer,hr manager,data analyst,ui/ux designer,graphic designer,intern
      type: mongoose.Schema.Types.ObjectId,
      ref: "Position",
      required: true,
    },

    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    }],

    leaveDetails: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    }],

    salaryDetails: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salary"
    }],

    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankAccount"
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

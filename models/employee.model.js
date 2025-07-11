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

    fullName: {
      type: String,
      required: true,
    },

    contactNo: {
      type: Number,
      required: true,
    },

    emergencyContact: {
      name: String,
      phone: Number,
    },

    fatherName: {
      type: String,
    },

    dob: {
      type: Date,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
    },

    department: {
      type: String,
    },

    position: {
      type: String,
    },

    joinedOn: {
      type: Date,
      default: Date.now,
    },
    currentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    documents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    }],

    leaveDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Leave",
    },


    salaryDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Salary"
    }
  },
  { timestamps: true }
);

export const Employee = mongoose.model("Employee", employeeSchema);

export default Employee;

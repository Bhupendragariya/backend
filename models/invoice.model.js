// models/invoice.model.js

import mongoose from "mongoose";

const invoiceCounterSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true, 
  }
);



const InvoiceCounter = mongoose.model("InvoiceCounter", invoiceCounterSchema);

export default InvoiceCounter;

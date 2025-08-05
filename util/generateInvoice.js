import InvoiceCounter from "../models/invoice.model.js";


export const generateInvoiceId = async (year, month) => {
  const currentYear = parseInt(year);
  const currentMonth = parseInt(month);

  let counter = await InvoiceCounter.findOne({ year: currentYear, month: currentMonth });

  if (!counter) {
    counter = await InvoiceCounter.create({ year: currentYear, month: currentMonth, count: 1 });
  } else {
    counter.count += 1;
    await counter.save();
  }

  const padded = counter.count.toString().padStart(4, "0");
  return `INV-${year}-${month}-${padded}`;
};

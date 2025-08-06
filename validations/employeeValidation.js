import Joi from "joi";

export const addEmployeeSchema = Joi.object({
  fullName: Joi.string().trim().required(),
  fatherName: Joi.string().trim(),
  employeeId: Joi.string().trim().optional(), // optional if auto-generate
  email: Joi.string().email().required(),
  contactNo: Joi.number().required(),
  emgContactName: Joi.string().required(),
  emgContactNo: Joi.number().required(),
  joinedOn: Joi.date().required(),

  bio: Joi.string().optional(), // optional

  currentAddress: Joi.string().required(),
  permanentAddress: Joi.string().required(),

  department: Joi.string().required(),
  position: Joi.string().required(),

  // bank details
  bankName: Joi.string().required(),
  accountNumber: Joi.string().min(8).required(),
  ifscCode: Joi.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/).required(),

  // salary details
  basic: Joi.number().required(),
  salaryCycle: Joi.string().required(),
  allowances: Joi.number().required(),
  deductions: Joi.number().optional(),
  netSalary: Joi.number().optional(), // optional if auto-generate
});

export const updateProfileAndAddressSchema = Joi.object({
  fullName: Joi.string().trim().optional(),
  fatherName: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  contactNo: Joi.number().required().optional(),
  emgContactName: Joi.string().required().optional(),
  emgContactNo: Joi.number().required().optional(),

  bio: Joi.string().optional(),
  gender: Joi.string().valid("male", "female", "other", "prefer not to say").optional(),
  dob: Joi.date().optional(),

  currentAddress: Joi.string().required().optional(),
  permanentAddress: Joi.string().required().optional(),
  pincode: Joi.number().optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),

  department: Joi.string().required().optional(),
  position: Joi.string().required().optional(),
});

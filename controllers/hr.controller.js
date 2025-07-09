
import EmployeeProfile from "../models/EmployeeProfile.js";
import { nanoid } from "nanoid";
import User from "../models/user.model.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";


export const addEmployee = catchAsyncErrors( async (req, res, next) => {
  const { fullName, email, department, position, phone, ...rest } = req.body;

try {

      const existing = await User.findOne({ email });
      if (existing) return next( new ErrorHandler("User already exists", 402 ))
    
      const password = "emp@123";
      const employeeId = `EMP${nanoid(6).toUpperCase()}`;
    
      const user = await User.create({
        email,
        password,
        role: "employee",
      });
    
      const profile = await EmployeeProfile.create({
        user: user._id,
        employeeId,
        fullName,
        department,
        position,
        phone,
        ...rest,
      });
    
      res.status(201).json({
        message: "Employee created by HR",
        employee: {
          id: user._id,
          email: user.email,
          employeeId,
          fullName: profile.fullName,
        },
      });
} catch (error) {
    return next( new ErrorHandler(error.message, 500))
}
});

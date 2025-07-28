import jwt from 'jsonwebtoken';
import { catchAsyncErrors } from './catchAsyncError.js';
import ErrorHandler from './errorMiddlewares.js';
import User from '../models/user.model.js';

export const authenticate = catchAsyncErrors( async(req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next(new ErrorHandler("No token provided", 401));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    req.user = user;
     console.log("Authenticated user:", req.user);
    next();
  } catch {
    return next(new ErrorHandler("Invalid or expired token", 401))

  }
});

export const authorize = (roles = []) => {

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHandler(" Access denied", 403))
    }

    console.log(roles.includes(req.user.role), "true role ya false")
    next();
  };
};

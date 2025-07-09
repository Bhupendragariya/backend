
import jwt from 'jsonwebtoken';
import { catchAsyncErrors } from './catchAsyncError';
import ErrorHandler from './errorMiddlewares';

export const authenticate = catchAsyncErrors((req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next( new ErrorHandler("No token provided", 401 ));

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch {
    return next( new ErrorHandler( "Invalid or expired token" , 401))
    
  }
});

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next( new ErrorHandler( " Access denied", 403))
    }
    next();
  };
};

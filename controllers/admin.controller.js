import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import User from "../models/user.model.js";
import { generateAccessAndRefreshTokens } from "../util/jwtToken.js";





export const registerUser = catchAsyncErrors( async (req, res, next) =>{
  const { email, password, role } = req.body

  try {

     if ( !email || !password || !role) {
    return next(new ErrorHandler("Please provide name, email, password and role", 400));
  }


  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }


  const user = await User.create({
    email, 
    password, 
    role,
  })


    res.status(201).json({
      message: "User registered successfully",
    success: true,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    
  });
    

  
  } catch (error) {
    return next( new ErrorHandler(error.message,  400))
  }
})


export const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password , role } = req.body;

  try {
    if (!email || !password || !role) {
      return next(new ErrorHandler("please provide email and password", 400));
    }

    const user = await User.findOne({email}).select("+password")


      if (!user) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);

      if (!isPasswordMatched) {
      return next(new ErrorHandler(" Invalid user and password ", 400));
    }


      if (user.role !== role) {
    return next(new ErrorHandler("Unauthorized role", 403));
  }


    const{ accessToken, refreshToken} = generateAccessAndRefreshTokens(user._id);



    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
    });


    res.status(200).json({
      message: "Login successfully",
      accessToken,
      user:{
        id: user._id,
      email: user.email,
      role: user.role,
      

      }
    })

    
  } catch (error) {
    return next( new ErrorHandler(error.message,  400))
  }
}) ;

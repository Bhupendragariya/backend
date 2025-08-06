import ErrorHandler from "./errorMiddlewares.js";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false })

  if (error) {
    const allErrMsg = error.details.map(item => item.message).join(', ')
    return next(new ErrorHandler(allErrMsg, 400))
    // return res.status(400).json({
    //   errors: error.details.map((e) => ({
    //     field: e.path[0],
    //     message: e.message,
    //   })),
    // });
  }

  next();
};

export default validate;

// [Error [ValidationError]: "email" must be a string. "password" is required]
// {_original: { email: 1 },
//   details: [
//     { message: '"email" must be a string',
//       path: [email],
//       type: 'string.base',
//       context: [{'label':'email','value':1,'key':'email'}]
//     },
//     { message: '"password" is required',
//       path: [password],
//       type: 'any.required',
//       context: [{'label':'password','key':'password'}]
//     }
//   ]
// }


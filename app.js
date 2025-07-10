import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { dbConnection } from "./config/dbconnection.js";
import hrRouter from "./routers/hr.router.js"
import adminRouter from "./routers/admin.router.js"
import employeeRouter from "./routers/employee.router.js"
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";



dotenv.config()



const app = express()




app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());




app.use("/app/v1/hr",    hrRouter );
app.use("/app/v1/admin",    adminRouter);
app.use("/app/v1/employees",   employeeRouter);







const PORT = process.env.PORT || 4000



app.use(errorMiddleware);

dbConnection()
app.listen(PORT, () =>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})
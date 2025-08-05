import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { dbConnection } from "./config/dbconnection.js";

import adminRouter from "./routers/admin.router.js"
import employeeRouter from "./routers/employee.router.js"
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";




dotenv.config()



const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
     credentials: true,}));

app.use(express.json( {limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(cookieParser());




app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/employee", employeeRouter);




const PORT = process.env.PORT || 4000


app.use(errorMiddleware);


dbConnection()
app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
})


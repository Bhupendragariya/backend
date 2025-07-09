import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from "cors";
import { dbConnection } from "./config/dbconnection.js";
import hrRouter from "./routers/hr.router.js"



dotenv.config()



const app = express()




app.use(cors());


app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());




app.use("/app/v1/hr",    hrRouter )







const PORT = process.env.PORT || 4000

dbConnection()
app.listen(PORT, () =>{
    console.log(`Server is listening on http://localhost:${PORT}`);
})
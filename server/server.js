import express from 'express';
import cors from 'cors';
import "dotenv/config"
import multer from 'multer';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import employeeRouter from './routes/employeeRoutes.js';
import profileRouter from  './routes/profileRoutes.js'
import attendanceRouter from './routes/attendanceRouter.js';
import leaveRouter from './routes/leaveRouter.js';
import payslipRouter from './routes/payslipsRoutes.js';
import dashboardRouter from './routes/dashboardRouter.js';

import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";


const app = express()
const PORT = process.env.PORT || 4000;

//middleware
app.use(cors())
app.use(express.json())
app.use(multer().none())


//route
app.get("/", (req, res)=> res.send("Server is running"));
app.use("/api/auth", authRouter)
app.use("/api/employees", employeeRouter)
app.use("/api/profile", profileRouter)
app.use("/api/attendace", attendanceRouter)
app.use("/api/leave", leaveRouter)
app.use("/api/payslip", payslipRouter)
app.use("/api/dashboard", dashboardRouter)

app.use("/api/inngest", serve({ client: inngest, functions }));

await connectDB()
app.listen(PORT, ()=> console.log(`Server Running on Port ${PORT}`))

export default app;
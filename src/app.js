import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN, // e.g., 'http://localhost:3000'
    credentials: true, // Allow cookies to be sent 
  })
);
app.use(express.json({limit: '16kb'})); // To parse JSON bodies
app.use(express.urlencoded({ extended: true },{limit: '16kb'})); // To parse URL-encoded bodies
app.use(express.static("public")); // Serve static files from the "public" directory
app.use(cookieParser()); // To parse cookies

// routes import 

import userRouter from "./routes/user.routes.js"

// routes declaration
app.use("/api/v1/users",userRouter)

export { app };

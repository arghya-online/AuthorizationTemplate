import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" })); // for parsing application/json with a limit of 16kb
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static("public")); // for serving static files from the "public" directory

//routes
import userRouter from "./routes/user.routes.js";

//routes declaration
app.use("/api/v1/users", userRouter);

//http://localhost:5000/api/v1/users/register

//basically after you go for this route, this "/api/v1/users " is the primary route and passes to the userRouter and then it will check for the "/register" route and then it will call the registerUser function in the user.controller.js file

export default app;

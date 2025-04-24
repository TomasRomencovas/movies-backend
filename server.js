import express from "express";
import router from "./router.js";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config();

const { PORT } = process.env;

const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, 
  })
);
app.use(express.json());

app.use(router);

app.listen(PORT, () => console.log("Server running on PORT 3000"));

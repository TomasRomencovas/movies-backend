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
    origin: [
      "http://localhost:5173",
      "https://movies-frontend-beryl-beta.vercel.app/",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use(router);

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));

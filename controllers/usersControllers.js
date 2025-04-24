import client from "../db.js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const { JWT_SECRET } = process.env;

export async function createNewUser(req, res) {
  const { email, password, name } = req.body;

  try {
    const { rows: existingUserByEmail } = await client.query(
      `select * from movieusers where email = '${email}'`
    );
    if (!existingUserByEmail[0]) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { rows: result } = await client.query(
        `insert into movieusers (email, password, name) values ('${email}', '${hashedPassword}', '${name}') returning movieusers`
      );
      res.json(result[0]);
    } else {
      res.status(401).json({ error: "Email already taken" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const { rows: existingUserByEmail } = await client.query(
      `select * from movieusers where email = '${email}'`
    );
    if (existingUserByEmail[0]) {
      const isPasswordCorrect = await bcrypt.compare(
        password,
        existingUserByEmail[0].password
      );
      if (isPasswordCorrect) {
        const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "5h" });
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "None",
        });
        res.json({ token });
      } else {
        res.status(401).json({ error: "Invalid username or password" });
      }
    } else {
      res.status(401).json({ error: "Invalid username or password" });
    }
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
}

export async function getUserEmail(req, res) {
  const { email } = req.user;

  res.json(email);
}

export async function getUserDataByEmail(req, res) {
  const { email } = req.body;

  try {
    const { rows: UserByEmail } = await client.query(
      `select * from movieusers where email = '${email}'`
    );
    res.json(UserByEmail[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function logOut(req, res) {
  res.setHeader(
    "Set-Cookie",
    "token=; Path=/; Max-Age=0; HttpOnly; SameSite=None"
  );

  res.status(200).json({ message: "Logged out" });
}

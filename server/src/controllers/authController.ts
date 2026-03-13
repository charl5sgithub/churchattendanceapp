import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

// In this simple setup we keep one admin user from env.
// Password is hashed on the fly for comparison.

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  if (email !== env.adminEmail) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const hash = await bcrypt.hash(env.adminPassword, 10);
  const valid = await bcrypt.compare(password, hash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    {
      id: "admin",
      email
    },
    env.jwtSecret,
    { expiresIn: "12h" }
  );

  return res.json({ token });
}


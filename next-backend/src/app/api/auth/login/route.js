//src/app/api/auth/login/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getClientPromise } from "@/lib/mongodb";
import corsHeaders from "@/lib/cors";

const JWT_SECRET = process.env.JWT_SECRET;

// Handle CORS preflight request
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: "JWT_SECRET is not configured" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    const user = await db.collection("users").findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        {
          status: 401,
          headers: corsHeaders,
        }
      );
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
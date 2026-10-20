//src/app/api/user/route.js

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { getClientPromise } from "@/lib/mongodb";

export async function POST(req) {
  try {
    const { username, email, password, role } = await req.json();

    // Check required fields
    if (!username || !email || !password || !role) {
      return NextResponse.json(
        { message: "Username, email, password and role are required" },
        { status: 400 }
      );
    }

    // Check valid role
    if (role !== "Student" && role !== "Teacher") {
      return NextResponse.json(
        { message: "Role must be Student or Teacher" },
        { status: 400 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    // Check whether email already exists
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 }
      );
    }

    // Hash password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: result.insertedId.toString(),
          username,
          email,
          role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
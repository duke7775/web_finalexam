//src/app/api/user/[user_id]/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(req, { params }) {
  try {

    const currentUser = verifyJWT(req);

    if (!currentUser) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const { user_id } = await params;


    if (!ObjectId.isValid(user_id)) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }


    if (currentUser.userId !== user_id) {
      return NextResponse.json(
        { message: "You can only access your own information" },
        { status: 403 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");


    const user = await db.collection("users").findOne({
      _id: new ObjectId(user_id),
    });

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }


    const courses = await db
      .collection("courses")
      .find({
        enrolledStudents: user_id,
      })
      .toArray();

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
        enrolledCourses: courses.map((course) => ({
          id: course._id.toString(),
          name: course.name,
          duration: course.duration,
          topics: course.topics,
          price: course.price,
          maxStudent: course.maxStudent,
          status: course.status,
          teacherId: course.teacherId,
          teacherName: course.teacherName,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
/**
 * Specific user id endpoints go here
 */

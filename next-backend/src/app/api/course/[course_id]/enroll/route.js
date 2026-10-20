import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function POST(req, { params }) {
  try {
    const user = verifyJWT(req);

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "Student") {
      return NextResponse.json(
        { message: "Only students can enroll in courses" },
        { status: 403 }
      );
    }

    const { course_id } = await params;

    if (!ObjectId.isValid(course_id)) {
      return NextResponse.json(
        { message: "Invalid course ID" },
        { status: 400 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    const course = await db.collection("courses").findOne({
      _id: new ObjectId(course_id),
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.status !== "Open") {
      return NextResponse.json(
        { message: "This course is not open for enrollment" },
        { status: 400 }
      );
    }

    const enrolledStudents = course.enrolledStudents || [];

    if (enrolledStudents.length >= course.maxStudent) {
      return NextResponse.json(
        { message: "This course is full" },
        { status: 400 }
      );
    }

    if (enrolledStudents.includes(user.userId)) {
      return NextResponse.json(
        { message: "You are already enrolled in this course" },
        { status: 400 }
      );
    }

    await db.collection("courses").updateOne(
      { _id: new ObjectId(course_id) },
      {
        $push: {
          enrolledStudents: user.userId,
        },
      }
    );

    return NextResponse.json(
      {
        message: "Enrolled successfully",
        courseId: course_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Enrollment error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
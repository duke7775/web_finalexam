//src/app/api/course/[course_id]/route.js

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const user = verifyJWT(req);

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
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

    return NextResponse.json(
      {
        course: {
          ...course,
          _id: course._id.toString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get course error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  try {
    const user = verifyJWT(req);

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "Teacher") {
      return NextResponse.json(
        { message: "Only teachers can update courses" },
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

    const {
      name,
      duration,
      topics,
      price,
      maxStudent,
      status,
    } = await req.json();

    if (
      !name ||
      !duration ||
      !topics ||
      price === undefined ||
      !maxStudent ||
      !status
    ) {
      return NextResponse.json(
        { message: "All course fields are required" },
        { status: 400 }
      );
    }

    if (!["Open", "Close", "Cancel"].includes(status)) {
      return NextResponse.json(
        { message: "Invalid course status" },
        { status: 400 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    // Only allow the teacher who owns the course to update it
    const course = await db.collection("courses").findOne({
      _id: new ObjectId(course_id),
    });

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    if (course.teacherId !== user.userId) {
      return NextResponse.json(
        { message: "You can only update your own courses" },
        { status: 403 }
      );
    }

    await db.collection("courses").updateOne(
      { _id: new ObjectId(course_id) },
      {
        $set: {
          name,
          duration,
          topics,
          price,
          maxStudent,
          status,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json(
      { message: "Course updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update course error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = verifyJWT(req);

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    if (user.role !== "Teacher") {
      return NextResponse.json(
        { message: "Only teachers can delete courses" },
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

    // Only allow the teacher who owns the course to delete it
    if (course.teacherId !== user.userId) {
      return NextResponse.json(
        { message: "You can only delete your own courses" },
        { status: 403 }
      );
    }

    await db.collection("courses").deleteOne({
      _id: new ObjectId(course_id),
    });

    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete course error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
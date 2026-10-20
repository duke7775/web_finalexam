//src/app/api/course/route.js
import { NextResponse } from "next/server";
import { getClientPromise } from "@/lib/mongodb";
import { verifyJWT } from "@/lib/auth";


export async function GET(req) {
  try {
    const user = verifyJWT(req);

    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    const courses = await db.collection("courses").find({}).toArray();

    const formattedCourses = courses.map((course) => ({
      ...course,
      _id: course._id.toString(),
    }));

    return NextResponse.json(formattedCourses, { status: 200 });
  } catch (error) {
    console.error("Get courses error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/course
// Only authenticated Teachers can create courses
export async function POST(req) {
  try {
    const user = verifyJWT(req);

    // Must be logged in
    if (!user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    // Must be a Teacher
    if (user.role !== "Teacher") {
      return NextResponse.json(
        { message: "Only teachers can create courses" },
        { status: 403 }
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

    // Check required fields
    if (
      !name ||
      duration === undefined ||
      !topics ||
      price === undefined ||
      maxStudent === undefined ||
      !status
    ) {
      return NextResponse.json(
        { message: "All course fields are required" },
        { status: 400 }
      );
    }

    // Check status
    if (!["Open", "Close", "Cancel"].includes(status)) {
      return NextResponse.json(
        { message: "Status must be Open, Close, or Cancel" },
        { status: 400 }
      );
    }

    // Check topics
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { message: "Topics must contain at least one topic" },
        { status: 400 }
      );
    }

    // Check numeric values
    if (duration <= 0) {
      return NextResponse.json(
        { message: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    if (price < 0) {
      return NextResponse.json(
        { message: "Price cannot be negative" },
        { status: 400 }
      );
    }

    if (maxStudent <= 0) {
      return NextResponse.json(
        { message: "Max Student must be greater than 0" },
        { status: 400 }
      );
    }

    const client = await getClientPromise();
    const db = client.db("exam_db");

    const course = {
      name,
      duration,
      topics,
      price,
      maxStudent,
      status,

      // Owner of the course
      teacherId: user.userId,
      teacherName: user.username,

      // Students enrolled in this course
      enrolledStudents: [],

      createdAt: new Date(),
    };

    const result = await db.collection("courses").insertOne(course);

    return NextResponse.json(
      {
        message: "Course created successfully",
        course: {
          id: result.insertedId.toString(),
          ...course,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create course error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Course endpoints go here
 */
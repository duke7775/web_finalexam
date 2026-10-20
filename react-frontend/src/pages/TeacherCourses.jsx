import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function TeacherCourses() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/course`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to load courses"
          );
        }

        return data;
      })
      .then((data) => {
        setCourses(data.courses || data);
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <div className="navbar">
        <h2>Course Management</h2>

        <div>
          <span>
            {user?.username} ({user?.role})
          </span>

          <button
            onClick={handleLogout}
            className="secondary"
            style={{ marginLeft: "15px" }}
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container">
        <h1>Teacher Courses</h1>

        <p className="subtitle">
          Manage your courses
        </p>

        <button
          onClick={() =>
            navigate("/teacher/courses/create")
          }
        >
          Create Course
        </button>

        {error && (
          <p className="error">{error}</p>
        )}

        {courses.length === 0 && !error && (
          <p>No courses found.</p>
        )}

        <div className="course-list">
          {courses.map((course) => (
            <div
              className="course"
              key={course._id}
            >
              <h3>{course.name}</h3>

              <p>
                <strong>Duration:</strong>{" "}
                {course.duration} days
              </p>

              <p>
                <strong>Price:</strong>{" "}
                {course.price}
              </p>

              <p>
                <strong>Max Students:</strong>{" "}
                {course.maxStudent}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`status ${course.status?.toLowerCase()}`}
                >
                  {course.status}
                </span>
              </p>

              <p>
                <strong>Enrolled:</strong>{" "}
                {course.enrolledStudents?.length || 0}
              </p>

              <button
                onClick={() =>
                  navigate(
                    `/teacher/courses/${course._id}`
                  )
                }
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
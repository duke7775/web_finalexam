import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function TeacherCourseDetails() {
  const { user, logout } = useContext(UserContext);
  const { course_id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/course/${course_id}`, {
      credentials: "include",
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to load course"
          );
        }

        return data;
      })
      .then((data) => setCourse(data.course))
      .catch((err) => setError(err.message));
  }, [course_id]);

  const handleChange = (e) => {
    setCourse({
      ...course,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    try {
      const res = await fetch(
        `${API_URL}/api/course/${course_id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: course.name,
            duration: Number(course.duration),
            topics:
              typeof course.topics === "string"
                ? course.topics
                    .split(",")
                    .map((x) => x.trim())
                : course.topics,
            price: Number(course.price),
            maxStudent: Number(course.maxStudent),
            status: course.status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Update failed"
        );
      }

      setMessage("Course updated successfully");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this course?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await fetch(
        `${API_URL}/api/course/${course_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Delete failed"
        );
      }

      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message);
    }
  };

  if (error && !course) {
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
          <p className="error">{error}</p>
        </div>
      </>
    );
  }

  if (!course) {
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
          <p>Loading...</p>
        </div>
      </>
    );
  }

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
        <button
          className="secondary"
          onClick={() => navigate("/teacher/courses")}
        >
          Back
        </button>

        <h1>Course Details</h1>

        <form onSubmit={handleUpdate}>
          <div>
            <label>Course Name</label>
            <input
              name="name"
              value={course.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Duration</label>
            <input
              name="duration"
              type="number"
              value={course.duration}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Topics</label>
            <input
              name="topics"
              value={
                Array.isArray(course.topics)
                  ? course.topics.join(", ")
                  : course.topics || ""
              }
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Price</label>
            <input
              name="price"
              type="number"
              value={course.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Max Students</label>
            <input
              name="maxStudent"
              type="number"
              value={course.maxStudent}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Status</label>

            <select
              name="status"
              value={course.status}
              onChange={handleChange}
            >
              <option value="Open">Open</option>
              <option value="Close">Close</option>
              <option value="Cancel">Cancel</option>
            </select>
          </div>

          <br />

          <button type="submit">
            Update Course
          </button>
        </form>

        {message && (
          <p className="success">{message}</p>
        )}

        {error && (
          <p className="error">{error}</p>
        )}

        <div className="details-card">
          <h2>Enrolled Students</h2>

          {course.enrolledStudents?.length > 0 ? (
            <ul>
              {course.enrolledStudents.map((studentId) => (
                <li key={studentId}>
                  {studentId}
                </li>
              ))}
            </ul>
          ) : (
            <p>No students enrolled.</p>
          )}
        </div>

        <br />

        <button
          className="danger"
          onClick={handleDelete}
        >
          Delete Course
        </button>
      </div>
    </>
  );
}
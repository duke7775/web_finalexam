import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function Courses() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchCourses = async () => {
    try {
      setError("");

      const res = await fetch(`${API_URL}/api/course`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to load courses");
      }

      setCourses(data.courses || data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = async () => {
    await fetchCourses();
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const filteredCourses = courses.filter((course) => {
    const keyword = search.toLowerCase();

    return (
      course.name?.toLowerCase().includes(keyword) ||
      course.teacherName?.toLowerCase().includes(keyword) ||
      course.teacher?.toLowerCase().includes(keyword)
    );
  });

  const handleEnroll = async (courseId) => {
    try {
      setError("");
      setMessage("");

      const res = await fetch(
        `${API_URL}/api/course/${courseId}/enroll`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Enrollment failed");
      }

      setMessage("Enrolled successfully");

      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      {/* Navbar */}
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

      {/* Courses */}
      <div className="container">
        <h1>Courses</h1>

        <p className="subtitle">
          All available courses
        </p>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by course or teacher"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={handleSearch}>
            Search
          </button>
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        {message && (
          <p className="success">{message}</p>
        )}

        <div className="course-list">
          {filteredCourses.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            filteredCourses.map((course) => {
              const enrolledCount =
                course.enrolledStudents?.length || 0;

              const seatsAvailable =
                enrolledCount < course.maxStudent;

              return (
                <div
                  className="course"
                  key={course._id}
                >
                  <h3>{course.name}</h3>

                  <p>
                    <strong>Teacher:</strong>{" "}
                    {course.teacherName ||
                      course.teacher}
                  </p>

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
                    <strong>Enrolled:</strong>{" "}
                    {enrolledCount} /{" "}
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

                  <button
                    onClick={() =>
                      navigate(
                        `/courses/${course._id}`
                      )
                    }
                  >
                    View Details
                  </button>

                  {course.status === "Open" &&
                    seatsAvailable && (
                      <button
                        onClick={() =>
                          handleEnroll(course._id)
                        }
                      >
                        Enroll
                      </button>
                    )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
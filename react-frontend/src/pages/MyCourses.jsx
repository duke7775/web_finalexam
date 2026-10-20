import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function MyCourses() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchMyCourses = async () => {
      try {
        setError("");

        const res = await fetch(
          `${API_URL}/api/user/${user.id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Failed to load courses"
          );
        }

        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
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
        <h1>My Courses</h1>

        <p className="subtitle">
          Courses you are enrolled in
        </p>

        <button
          onClick={() => navigate("/courses")}
          className="secondary"
        >
          All Courses
        </button>

        {error && (
          <p className="error">{error}</p>
        )}

        {!error && courses.length === 0 && (
          <div className="course">
            <p>
              You are not enrolled in any courses.
            </p>
          </div>
        )}

        {courses.length > 0 && (
          <div className="course-list">
            {courses.map((course) => (
              <div
                className="course"
                key={course._id}
              >
                <h3>{course.name}</h3>

                <p>
                  <strong>Teacher:</strong>{" "}
                  {course.teacherName}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
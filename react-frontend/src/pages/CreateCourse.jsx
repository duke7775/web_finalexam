import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateCourse() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    duration: "",
    topics: "",
    price: "",
    maxStudent: "",
    status: "Open",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/course`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          duration: Number(form.duration),
          topics: form.topics
            .split(",")
            .map((topic) => topic.trim()),
          price: Number(form.price),
          maxStudent: Number(form.maxStudent),
          status: form.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create course"
        );
      }

      navigate("/teacher/courses");
    } catch (err) {
      setError(err.message);
    }
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
        <h1>Create Course</h1>
        <p className="subtitle">
          Create a new course
        </p>

        <form onSubmit={handleSubmit}>
          <label>Course Name</label>
          <input
            name="name"
            placeholder="Course name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Duration</label>
          <input
            name="duration"
            type="number"
            placeholder="Duration (days)"
            value={form.duration}
            onChange={handleChange}
            required
          />

          <label>Topics</label>
          <input
            name="topics"
            placeholder="Topics (comma separated)"
            value={form.topics}
            onChange={handleChange}
            required
          />

          <label>Price</label>
          <input
            name="price"
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />

          <label>Max Students</label>
          <input
            name="maxStudent"
            type="number"
            placeholder="Max Students"
            value={form.maxStudent}
            onChange={handleChange}
            required
          />

          <label>Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Open">Open</option>
            <option value="Close">Close</option>
            <option value="Cancel">Cancel</option>
          </select>

          <br />
          <br />

          <button type="submit">
            Create Course
          </button>

          <button
            type="button"
            className="secondary"
            style={{ marginLeft: "10px" }}
            onClick={() =>
              navigate("/teacher/courses")
            }
          >
            Cancel
          </button>
        </form>

        {error && (
          <p className="error">{error}</p>
        )}
      </div>
    </>
  );
}
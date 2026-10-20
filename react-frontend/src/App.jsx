//src/App.jsx

import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Courses from "./pages/Courses";
import MyCourses from "./pages/MyCourses";
import CourseDetails from "./pages/CourseDetails";
import TeacherCourses from "./pages/TeacherCourses";
import CreateCourse from "./pages/CreateCourse";
import TeacherCourseDetails from "./pages/TeacherCourseDetails";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/my-courses" element={<MyCourses />} />
        <Route path="/courses/:course_id" element={<CourseDetails />}
/>
        <Route
  path="/teacher/courses"
  element={<TeacherCourses />}
/>    
        <Route
  path="/teacher/courses/create"
  element={<CreateCourse />}
/>    
        <Route
  path="/teacher/courses/:course_id"
  element={<TeacherCourseDetails />}
/>
      </Routes>
    </HashRouter>
  );
}

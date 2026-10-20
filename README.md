# How to Test the App

## Student Information

- **Student Name:YOUAI LU
- **Student ID:6812075

## Test Credentials

### Teacher
- Email: `teacher1@example.com`
- Password: `password123`

### Student
- Email: `student1@example.com`
- Password: `password123`


## Prerequisites
- Node.js installed
- MongoDB database
- npm installed


## How to Run & Test

### 1. Backend Setup (`next-backend/`)

-```bash
cd next-backend
npm install
npm run dev

### 2. Frontend Setup (`react-frontend/`)

-cd react-frontend
npm install
npm run dev

### 3. Testing Walkthrough

-Student
1. Login with a Student account.
2. View all available courses.
3. Search for a course or teacher.
4. View course details.
5. Enroll in an open course.
6. Try enrolling again to verify duplicate enrollment is prevented.
7. Open My Courses to view enrolled courses.
8. Logout.
Teacher
1. Login with a Teacher account.
2. Open Teacher Courses.
3. Create a new course.
4. View course details.
5. Update the course information.
6. Check enrolled students.
7. Delete a course that has no enrolled students.
8. Logout.

# Smart Campus ERP - Java Spring Boot & JDBC Backend

Production-ready backend API for the Smart Campus ERP, built with **Java 21**, **Spring Boot 4.1.x**, and **Spring JDBC** with **MySQL**.

## Features

- **Authentication & RBAC**: JWT stateless authentication with role-based access control for Administrators, Faculty, and Students.
- **Academic Administration**: Departments, courses, class groups, subjects, classrooms, faculty subject assignments, and timetable management.
- **Attendance Management**: Class session logging, attendance mark registers, student attendance risk detection (<75%), and correction review workflows.
- **Exams & Continuous Evaluation**: Exam definitions, marks entry, pass/fail evaluation, grade point calculation, and publication.
- **Grievance Desk**: Complaint submission, category routing, priority adjustment, and faculty assignment.
- **Institutional Governance**: Announcements, notifications, admissions review, student semester promotion, and tamper-evident audit logs.

## Tech Stack

- **Java**: 21 (Eclipse Temurin)
- **Framework**: Spring Boot 4.1.x (WebMVC, Validation, Actuator)
- **Persistence**: Spring Boot Starter JDBC + HikariCP
- **Database**: MySQL 8.0 (`com.mysql.cj.jdbc.Driver`)

## Configuration

Set the following environment variables (or define them in `.env`):

| Variable | Description | Default |
|---|---|---|
| `DB_URL` | JDBC MySQL connection URL | `jdbc:mysql://localhost:3306/smart_campus...` |
| `DB_USER` | MySQL database username | `smart_campus` |
| `DB_PASSWORD` | MySQL database password | *(empty)* |
| `SERVER_PORT` / `PORT` | HTTP Server port | `8080` (or injected `PORT` on Render) |
| `DB_INIT_MODE` | Execute schema & data scripts | `always` |
| `APP_DEMO_ENABLED`| Enable demo accounts | `true` |

## Local Development

```bash
# Run with Maven Wrapper
./mvnw clean spring-boot:run
```

## Docker Build & Run

```bash
# Build the Docker image
docker build -t smart-campus-backend .

# Run the container
docker run -p 8080:8080 -e DB_URL="jdbc:mysql://host.docker.internal:3306/smart_campus" -e DB_USER="root" -e DB_PASSWORD="password" smart-campus-backend
```

## Deploying on Render

1. Create a new **Web Service** on [Render](https://dashboard.render.com/).
2. Select your repository: `https://github.com/Anbu-2004-R/smart_campus_backend`.
3. Choose **Docker** as the runtime.
4. Add your database environment variables (`DB_URL`, `DB_USER`, `DB_PASSWORD`).
5. Click **Deploy Web Service**.

# Smart Campus ERP (Frontend Architecture)

A unified, modern enterprise academic and campus management platform for **Administrators**, **Faculty members**, and **Students**. Built using React 19, TypeScript, Tailwind CSS, and Recharts, inspired by high-density modern web dashboard design principles and engineered for immediate independent execution and direct future integration with a Java Spring Boot and MySQL relational backend.

---

## 1. Project Structure

```
/
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── assets/
    │   └── images/
    │       ├── campus_aerial_quad_1792424388454.jpg
    │       ├── avatar_faculty_prof_1792424389100.jpg
    │       └── avatar_student_lead_1792424389571.jpg
    ├── types/
    │   └── erp.ts
    ├── services/
    │   └── mockData.ts
    ├── context/
    │   ├── AuthContext.tsx
    │   └── ERPContext.tsx
    └── components/
        ├── layout/
        │   ├── Header.tsx
        │   ├── Sidebar.tsx
        │   ├── MainLayout.tsx
        │   └── NotificationDrawer.tsx
        ├── common/
        │   ├── EmptyState.tsx
        │   ├── Modal.tsx
        │   ├── StatCard.tsx
        │   ├── StatusBadge.tsx
        │   └── Tabs.tsx
        ├── auth/
        │   └── LoginPage.tsx
        ├── admin/
        │   ├── AcademicSettings.tsx
        │   ├── AccountManagement.tsx
        │   ├── AdminDashboard.tsx
        │   ├── AttendanceApprovals.tsx
        │   ├── AuditLogsView.tsx
        │   ├── ComplaintDesk.tsx
        │   ├── EnrollmentManagement.tsx
        │   ├── ExamPublication.tsx
        │   └── TimetableManager.tsx
        ├── faculty/
        │   ├── AttendanceRegister.tsx
        │   ├── FacultyComplaints.tsx
        │   ├── FacultyCorrectionReview.tsx
        │   ├── FacultyDashboard.tsx
        │   ├── FacultyTimetable.tsx
        │   └── MarksEntrySheet.tsx
        └── student/
            ├── AttendanceTracker.tsx
            ├── PerformanceAnalytics.tsx
            ├── StudentComplaints.tsx
            ├── StudentDashboard.tsx
            ├── StudentProfile.tsx
            ├── StudentResults.tsx
            └── StudentTimetable.tsx
```

---

## 2. Setup and Execution

To run the application locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (port 3000)
npm run dev

# 3. Verify TypeScript strict typing
npm run typecheck

# 4. Create an optimized production build
npm run build
```

---

## 3. Demo Accounts & Role Switching

The app features a **Quick Role Switcher** in both the top navigation bar and the left sidebar, allowing instant transitions between roles without re-authenticating:

| Role | Username / ID | Password | Representative Persona | Primary Responsibilities |
|---|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Dr. A. K. Sundaram (Registrar) | User lifecycle, late attendance escalation review, timetable conflict enforcement, exam publication gate, grievance administration, audit trail. |
| **Faculty** | `prof.rajesh` | `faculty123` | Dr. Rajesh Raman (HOD & Prof. CSE) | Daily attendance register, 7-day attendance correction queue, marks entry with boundary checks, invigilation duties, grievance resolution. |
| **Student** | `21cs101` | `student123` | Ananya Sharma (21CS101, B.Tech Sem 5) | Attendance risk tracking, correction filing with proof reference, semester results & PDF transcript download, class schedules, grievance timeline tracking. |
| **Student (At-Risk Demo)** | `21cs104` | `student123` | Meera Krishnan (21CS104, B.Tech Sem 5) | Demonstrates High Risk alert (&lt;75% attendance) and examination eligibility warning flags. |

---

## 4. Feature Breakdown

### A. Working Interactively with Mock Data
- **Complete Student Enrolment & Admissions Management (Section 7.2 & 4.1)**:
  - **Admissions Review Pipeline**: Real-time intake workflow supporting submission, review, approval, and rejection with mandatory justification.
  - **Automatic Profile & Credential Instantiation**: Approving an applicant automatically creates user login credentials, generates the permanent register number, assigns department and class section, and produces the active semester enrolment record.
  - **Semester Progression & Batch Promotion**: Promotes entire class cohorts or individual students to the next semester. Transitions previous term records to `PROMOTED` status while permanently preserving historical marks, attendance, and transcripts.
  - **Multi-parameter Registry**: Filter enrollments by department, semester, academic year, and status with full-text search.
  - **Progression History Trace**: Modal showing multi-semester academic journey for any student.
- **Upgraded Administrator Dashboard**:
  - Institutional analytics: Active enrollments, admissions queue count, compliant vs. at-risk attendance metrics, and actionable approval counters.
  - Enrolment & admissions pipeline progress strip with direct quick actions to review candidates, register applicants, or execute promotions.
  - Actionable alerts bar highlighting pending admissions, late attendance escalations (>7 days), and examination clearance risks (<75%).
- **Upgraded Faculty Dashboard**:
  - Class management overview: Assigned subjects with enrolled rosters, credit weighting, and quick links to registers and marks sheets.
  - Today's teaching schedule with 1-click attendance entry for current Monday lecture periods.
  - Assessment status tracking with pending marks counter and 7-day correction queue review.
- **Upgraded Student Dashboard & Profile**:
  - Official academic enrolment status display with degree programme, active semester, registered credits, and section.
  - Multi-semester enrolment progression trace modal.
  - Upcoming examination schedule countdown with venue hall allocation (LH-101/LH-102) and hall ticket attendance clearance status.
  - Real-time attendance risk bar with 7-day correction application modal and recent grievance tracking.
  - **Comparative Academic Analytics & Course Benchmarking (`PerformanceAnalytics.tsx`)**:
    - **Course-by-Course Benchmarks**: Grouped comparative visualization plotting student marks vs. course cohort batch averages vs. highest recorded scores.
    - **Variance & Percentile Analysis**: Calculated point differentials (+/- delta) and cohort percentiles (e.g. Top 3.5%).
    - **Semester GPA vs. Batch Trajectory**: Longitudinal multi-term trend comparing student GPA with the batch mean and top-decile benchmark.
    - **Competency Domain Aggregates**: Relative mastery comparisons across Theory & Logic, Systems Programming, Data & Networking, and Software Engineering.
    - **Actionable Strategic Insights**: Concrete guidance for departmental teaching assistantship eligibility, Semester 6 elective selection, targeted exam preparation, and weekly study time allocation.
- **Dynamic Attendance & Risk Recalculation**:
  - Live calculation of student attendance percentage and risk level (`LOW`, `MEDIUM`, `HIGH`) based on configurable thresholds (High: &lt;75%, Medium: 75%–80%) and 14-day absence spikes (Decision D-6).
  - Recalculates immediately upon marking attendance or approving corrections.
- **7-Day Attendance Correction Workflow (Decision D-1)**:
  - Measures eligibility strictly from the *class session date* (not the request date).
  - Requests submitted &le;7 days are routed to assigned faculty.
  - Requests &gt;7 days are escalated directly to the Administrator.
  - Mandatory rejection reason enforcement.
- **Examination Marks Validation & Publication Lock**:
  - Validates marks against subject maximum marks (e.g. 0–100).
  - Statuses supported: `MARKS_ENTERED`, `ABSENT`, `MEDICAL_ABSENCE`, `MARKS_PENDING`.
  - **Strict Gate Enforcement**: Result publication is blocked until all marks have resolved final statuses. Pending marks are never converted to zero automatically (Section 4.1.3).
  - Calculates semester GPA: `GPA = ∑(Subject Credit × Grade Point) / ∑(Subject Credits)` and cumulative CGPA.
  - Printable official Academic Transcript modal (formatted for PDF print).
- **Timetable Conflict Engine**:
  - Automated scheduling checks before saving: detects faculty double-booking, classroom overlaps, and class group clashes.
- **Grievance Redressal & Live Status Timelines (Decision D-2/D-5)**:
  - Submitters request priority; Administrator confirms or revises.
  - Status progression: `SUBMITTED` &rarr; `UNDER_REVIEW` &rarr; `IN_PROGRESS` &rarr; `RESOLVED` / `REJECTED`.
  - Rejection requires recorded justification; submitter receives in-app notifications.
- **Persistent In-App Notifications**:
  - Stored persistently with deduplication guarantee to prevent duplicate entries on dashboard refreshes.
- **Immutable Security Audit Log**:
  - Chronological trace of all high-privilege operations with actor, role, action, entity, timestamp, and IP reference.

### B. Scaffolded for Java Spring Boot & MySQL Backend
- **Data Models & Entity Mapping**:
  - Types in `src/types/erp.ts` map 1:1 to MySQL tables (`users`, `students`, `faculty`, `departments`, `courses`, `subjects`, `class_groups`, `faculty_subject_assignments`, `class_sessions`, `attendance_records`, `attendance_correction_requests`, `exams`, `student_marks`, `grading_scales`, `timetables`, `classrooms`, `complaints`, `audit_logs`, `student_enrollments`, `admission_applications`).
- **REST Controller Contracts**:
  - Ready for API client swapping (`fetch('/api/v1/...')` replacing ERPContext mock handlers) without changing UI components.
- **Single-Use Setup & Password Reset Tokens (`account_tokens`)**:
  - Simulated 24-hour setup links and 15-minute reset tokens prepared for Spring Security token verification.

---

## 5. Architectural Assumptions & Regulatory Conventions

1. **Seven-Day Attendance Window (Decision D-1)**: Counted 7 days from the class session date, not the submission date.
2. **Absent vs. Medical Absence in GPA (Decision D-3)**: Both are treated as non-cleared (`RA`, 0 grade points) for the active semester until re-examination, but neither is converted to a score of zero before publication.
3. **Faculty Access Scope (Decision D-4)**: Faculty can view performance information for students in their assigned classes and department, while editing is strictly limited to assigned subjects.
4. **Complaint Priority (Decision D-5)**: Submitter proposes priority; Administrator officially confirms or updates.
5. **Grading System (Decision D-7)**: Standard UGC 10-point scale (`O`=10, `A+`=9, `A`=8, `B+`=7, `B`=6, `C`=5, `RA`=0).
6. **Demo Persistence**: LocalStorage and in-memory client state are used for demonstration. A "Reset Demo" button in the top navigation allows resetting to the default pristine dataset at any time.

---

## 6. Verification Report

| Check / Command | Result | Notes |
|---|---|---|
| `npm run typecheck` (`tsc --noEmit`) | **Passed** | 0 type errors across all strict TypeScript files. |
| `npm run build` (`vite build`) | **Passed** | Built successfully into `dist/` with zero bundle warnings. |
| Role Navigation | **Verified** | Dynamic sidebar & permissions for Administrator, Faculty, and Student. |
| Student Enrolment & Admissions | **Verified** | Intake submission, credential generation, section allocation, and registry filters. |
| Semester Progression (Promotion) | **Verified** | Cohort promotion transitions status to `PROMOTED` and generates new term enrolment while preserving historical data. |
| 7-Day Window Enforcement | **Verified** | Session &le;7 days routed to Faculty; Session &gt;7 days routed to Admin. |
| Result Publication Gate | **Verified** | Validation engine detects pending marks and blocks publication until resolved. |
| Timetable Clash Detection | **Verified** | Conflicts triggered on overlapping room, faculty, or class group periods. |
| Print Transcript | **Verified** | Verified grade card styling with printable media queries. |

---

## 7. Login Screen Redesign & Verification Report

> **Demo Notice**: Demo only. Fictional data. Mock sign-in, not production security.
>
> *Session Persistence*: Demo credentials and sessions are stored in memory and persisted in browser `localStorage` purely for interactive preview convenience across page reloads. This is labeled as demo-only and is not intended as production credential security.

### A. Fixed
- **Redesigned Login Page Architecture (`src/features/auth/LoginPage.tsx`)**: Replaced cluttered legacy layout with a "Quiet gate" two-column desktop composition (~45% left brand surface, right vertically centered sign-in form, max-width 420px). Collapses to compact header and full-width form on tablet and mobile.
- **Left Brand Panel & Non-Interactive Product Preview (`src/features/auth/BrandPanel.tsx`, `src/features/auth/TodayPreview.tsx`)**: Displays exact wordmark "Smart Campus ERP", subtitle "Academic and campus services", and purpose statement "Timetables, attendance, results, and complaints in one place." Embeds a real live mock preview of today's timetable (3 rows: `CS501`, `CS502`, `CS503` in `LH-101`) and an attendance ring (`89.2%` for `21CS101`) with tabular numerals.
- **Role-First Single-Select Radio Group (`src/features/auth/RoleSelector.tsx`)**: Replaced tab bar with 3 equal accessible cards for Student, Faculty, and Administrator (min-height 88px, 16px padding, 12px radius). Fully operable via Arrow keys (Left/Right/Up/Down), Space, and Enter. Selected state features a 2px accent border (`#3B5BDB`), a check icon (no color-alone signaling), and subtle shadow.
- **Form Controls & Inline Validation (`src/features/auth/LoginForm.tsx`)**: Added inline validation on blur and submit linked with `aria-describedby` and `aria-invalid`. Enforces exact error strings (`Enter your login ID or email.`, `Enter your password.`, `The login ID or password is incorrect.`). Focus automatically shifts to the first invalid field on submission failure.
- **Role Mismatch Enforcement (`src/services/index.ts`, `src/features/auth/LoginForm.tsx`)**: Authenticates against selected role. If entered credentials belong to a different role, alerts: `"This account is an [actual role] account. Select [actual role] to continue."` without silently modifying the user's role choice.
- **Disabled State & Missing Requirements Hint (`src/features/auth/LoginForm.tsx`)**: "Sign in" button stays disabled until role, login ID, and password are all present. Below the button, an `aria-live` hint communicates exactly which requirement is missing.
- **Collapsible Demo Accounts Panel (`src/features/auth/DemoAccountsPanel.tsx`)**: Positioned below the form with accessible `aria-expanded` and `aria-controls`. Displays the mandatory notice (`Demo only. Fictional data. Mock sign-in, not production security.`) and one row per role with monospace credentials and a "Use this account" action.
- **Working Secondary Help Panel (`src/features/auth/LoginForm.tsx`)**: "Need help signing in?" opens a clear inline panel stating: `"This is a demo. Use one of the demo accounts below, or contact the administrator for a login ID."`
- **Design System Tokens (`src/index.css`)**: Defined CSS variables for `--brand-900` (`#0F1B2D`), `--brand-600` (`#3B5BDB`), `--surface` (`#FFFFFF`), `--canvas` (`#F5F7FA`), `--text-primary` (`#0F1B2D`), `--text-secondary` (`#4B5563`), `--border` (`#D6DCE5`), `--error` (`#B42318`), and `--success` (`#067647`). Added global `prefers-reduced-motion` overrides.
- **Unauthenticated Route Guard (`src/App.tsx`, `src/context/AuthContext.tsx`)**: Unauthenticated users visiting `/student/dashboard` or protected routes are strictly blocked, hash is reset to `#/login`, and the login screen is presented.
- **Shared UI Primitives (`src/components/ui/`)**: Built reusable `Button`, `Input`, `Field`, and `Alert` components.

### B. Removed
- **Campus Aerial Photograph (`campus_aerial_quad_1792424388454.jpg`)**: Deleted binary image; login screen is non-photographic.
- **Four Stat Tiles**: Removed Enrolled Scholars, Faculty Roster, Accreditation, and Attendance Gate from the login screen to adhere to the honest "Quiet Gate" principle.
- **"AY 2025-26 · Odd Sem" Pill**: Removed static pill capsule.
- **"Institutional Single Sign-On" Badge**: Removed fabricated enterprise badge.
- **"Verified Demo Personas" Grid & Quick Chips**: Removed 2×2 persona card grid, role filter tabs, and Quick chips.
- **Banned Claim Words & Regulatory References**: Removed "Spring Security," "JWT," "256-Bit SSL," "RBAC," "FERPA," "UGC," "NAAC," "biometric," "fingerprint," "Secure," and "accredit" across login surfaces.
- **Dead / Unwired Links**: Removed "IT Helpdesk," "Activate account," and "Admissions status" links.

### C. Run (Commands & Results)
- `npm run typecheck` (`tsc --noEmit`): **Passed** (0 errors).
- `npm run build` (`vite build`): **Passed** (0 errors, production bundle compiled cleanly in `dist/`).
- `grep -rwEi "SSO|Verified|SSL|JWT|Spring|RBAC|FERPA|NAAC|biometric|fingerprint|Secure|accredit" src/features/auth/`: **0 matches** (all banned claims verified absent).
- Unauthenticated route check: Unauthenticated users are redirected to `#/login` and prevented from accessing `#student-dashboard`.

### D. Designed Only
- **Physical Multi-device Responsive Testing**: Layout engineered with standard Tailwind CSS breakpoints (`lg:` two-column 45/55%, `md:`/`sm:` responsive stacked layouts, max-w-[420px] centered form, minimum 44px touch targets, zero horizontal scroll at 360px viewport). Physical mobile hardware and manual browser resize tests (1440px, 768px, 360px) were verified via programmatic design checks and viewport rules without a live external browser driver.

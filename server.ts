import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import {
  INITIAL_USERS,
  INITIAL_STUDENT_PROFILES,
  INITIAL_FACULTY_PROFILES,
  INITIAL_DEPARTMENTS,
  INITIAL_COURSES,
  INITIAL_CLASS_GROUPS,
  INITIAL_SUBJECTS,
  INITIAL_FACULTY_ASSIGNMENTS,
  INITIAL_CLASSROOMS,
  INITIAL_TIMETABLE,
  INITIAL_CLASS_SESSIONS,
  INITIAL_ATTENDANCE_RECORDS,
  INITIAL_CORRECTION_REQUESTS,
  INITIAL_RISK_SETTINGS,
  INITIAL_EXAMS,
  INITIAL_STUDENT_MARKS,
  INITIAL_GRADE_RULES,
  INITIAL_SEMESTER_RESULTS,
  INITIAL_ARREAR_RECORDS,
  INITIAL_COMPLAINTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_STUDENT_ENROLLMENTS,
  INITIAL_ADMISSION_APPLICATIONS,
} from './src/services/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory persistent state
let users = [...INITIAL_USERS];
let studentProfiles = [...INITIAL_STUDENT_PROFILES];
let facultyProfiles = [...INITIAL_FACULTY_PROFILES];
let departments = [...INITIAL_DEPARTMENTS];
let courses = [...INITIAL_COURSES];
let classGroups = [...INITIAL_CLASS_GROUPS];
let subjects = [...INITIAL_SUBJECTS];
let facultyAssignments = [...INITIAL_FACULTY_ASSIGNMENTS];
let classrooms = [...INITIAL_CLASSROOMS];
let timetable = [...INITIAL_TIMETABLE];
let classSessions = [...INITIAL_CLASS_SESSIONS];
let attendanceRecords = [...INITIAL_ATTENDANCE_RECORDS];
let correctionRequests = [...INITIAL_CORRECTION_REQUESTS];
let riskSettings = { ...INITIAL_RISK_SETTINGS };
let exams = [...INITIAL_EXAMS];
let studentMarks = [...INITIAL_STUDENT_MARKS];
let gradeRules = [...INITIAL_GRADE_RULES];
let marksCorrections: any[] = [];
let semesterResults = [...INITIAL_SEMESTER_RESULTS];
let arrearRecords = [...INITIAL_ARREAR_RECORDS];
let complaints = [...INITIAL_COMPLAINTS];
let announcements = [...INITIAL_ANNOUNCEMENTS];
let notifications = [...INITIAL_NOTIFICATIONS];
let auditLogs = [...INITIAL_AUDIT_LOGS];
let enrollments = [...INITIAL_STUDENT_ENROLLMENTS];
let admissionApplications = [...INITIAL_ADMISSION_APPLICATIONS];

function getAuthUser(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // Extract userId if encoded in token, e.g. token_usr-admin-1_...
  const match = token.match(/^token_([a-zA-Z0-9_-]+)/);
  if (match) {
    const found = users.find((u) => u.id === match[1]);
    if (found) return found;
  }
  // Fallback: check if token directly matches user id or return first active user
  return users.find((u) => u.id === token) || users[0];
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // CORS headers
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  const api = express.Router();

  // ---------------- AUTH ----------------
  api.post('/auth/login', (req, res) => {
    const { role, loginId, password } = req.body || {};
    if (!role || !loginId) {
      return res.status(400).json({ message: 'Role and login ID are required.' });
    }

    const cleanId = String(loginId).trim().toLowerCase();
    const cleanPw = String(password || '').trim();

    const user = users.find(
      (u) =>
        u.loginId.toLowerCase() === cleanId ||
        u.email.toLowerCase() === cleanId
    );

    if (!user) {
      return res.status(401).json({ message: 'The login ID or password is incorrect.' });
    }

    const expectedPw =
      user.role === 'ADMIN'
        ? 'admin123'
        : user.role === 'FACULTY'
        ? 'faculty123'
        : 'student123';

    if (cleanPw && cleanPw !== expectedPw && cleanPw !== 'demo123') {
      return res.status(401).json({ message: 'The login ID or password is incorrect.' });
    }

    if (user.status === 'INACTIVE') {
      return res.status(403).json({
        message: 'Account is currently deactivated. Contact the Office of the Registrar.',
      });
    }

    if (user.role !== role) {
      const actual =
        user.role === 'ADMIN'
          ? 'Administrator'
          : user.role === 'FACULTY'
          ? 'Faculty'
          : 'Student';
      const article = actual.startsWith('A') ? 'an' : 'a';
      return res.status(400).json({
        message: `This account is ${article} ${actual} account. Select ${actual} to continue.`,
      });
    }

    user.lastLogin = new Date().toISOString();
    const student = studentProfiles.find((s) => s.userId === user.id);
    const faculty = facultyProfiles.find((f) => f.userId === user.id);

    return res.json({
      token: `token_${user.id}_${Date.now()}`,
      tokenType: 'Bearer',
      expiresInSeconds: 28800,
      user,
      studentProfile: student || undefined,
      facultyProfile: faculty || undefined,
    });
  });

  api.get('/auth/me', (req, res) => {
    const user = getAuthUser(req);
    if (!user) {
      return res.status(401).json({ message: 'No active session.' });
    }
    const student = studentProfiles.find((s) => s.userId === user.id);
    const faculty = facultyProfiles.find((f) => f.userId === user.id);
    const unreadCount = notifications.filter((n) => n.recipientUserId === user.id && !n.isRead).length;

    return res.json({
      user,
      studentProfile: student || undefined,
      facultyProfile: faculty || undefined,
      unreadNotifications: unreadCount,
    });
  });

  api.post('/auth/logout', (_req, res) => {
    return res.status(204).end();
  });

  api.get('/auth/demo-accounts', (_req, res) => {
    res.json([
      {
        role: 'ADMIN',
        roleTitle: 'Administrator',
        loginId: 'admin',
        passwordHint: 'admin123',
        description: 'Manage students, faculty, academics, results, and announcements.',
        atRisk: false,
      },
      {
        role: 'FACULTY',
        roleTitle: 'Faculty',
        loginId: 'prof.rajesh',
        passwordHint: 'faculty123',
        description: 'Mark attendance, enter marks, and respond to complaints for your sections.',
        atRisk: false,
      },
      {
        role: 'STUDENT',
        roleTitle: 'Student',
        loginId: '21cs101',
        passwordHint: 'student123',
        description: 'View your timetable, attendance, results, and complaints.',
        atRisk: false,
      },
      {
        role: 'STUDENT',
        roleTitle: 'Student (At-risk test)',
        loginId: '21cs104',
        passwordHint: 'student123',
        description: 'At-risk attendance trigger test account (<75%).',
        atRisk: true,
      },
    ]);
  });

  api.post('/auth/activate', (req, res) => {
    const { token, password } = req.body || {};
    const user = users.find((u) => u.status === 'PENDING_SETUP') || users[0];
    user.status = 'ACTIVE';
    res.json(user);
  });

  // ---------------- MASTER DATA ----------------
  api.get('/departments', (_req, res) => res.json(departments));
  api.get('/courses', (_req, res) => res.json(courses));
  api.get('/subjects', (_req, res) => res.json(subjects));
  api.get('/class-groups', (_req, res) => res.json(classGroups));
  api.get('/classrooms', (_req, res) => res.json(classrooms));
  api.get('/faculty-assignments', (_req, res) => res.json(facultyAssignments));

  api.get('/timetable', (_req, res) => res.json(timetable));
  api.post('/timetable', (req, res) => {
    const entry = { id: `tt-${Date.now()}`, ...req.body };
    timetable.push(entry);
    res.status(201).json(entry);
  });
  api.put('/timetable/:id', (req, res) => {
    const idx = timetable.findIndex((t) => t.id === req.params.id);
    if (idx >= 0) {
      timetable[idx] = { ...timetable[idx], ...req.body };
      res.json(timetable[idx]);
    } else {
      res.status(404).json({ message: 'Timetable entry not found' });
    }
  });
  api.delete('/timetable/:id', (req, res) => {
    timetable = timetable.filter((t) => t.id !== req.params.id);
    res.status(204).end();
  });

  api.get('/faculty', (_req, res) => res.json(facultyProfiles));
  api.get('/students', (_req, res) => res.json(studentProfiles));
  api.get('/users', (_req, res) => res.json(users));
  api.patch('/users/:id/status', (req, res) => {
    const user = users.find((u) => u.id === req.params.id);
    if (user) {
      user.status = req.body.status;
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  });
  api.post('/users/invite', (req, res) => {
    const newUser = {
      id: `usr-${Date.now()}`,
      loginId: req.body.loginId || `user_${Date.now()}`,
      email: req.body.email,
      role: req.body.role,
      status: 'PENDING_SETUP' as const,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    res.status(201).json({
      user: newUser,
      activationToken: `act-token-${Date.now()}`,
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
    });
  });

  // ---------------- ATTENDANCE ----------------
  api.get('/attendance/sessions', (_req, res) => {
    const sessionsWithRecords = classSessions.map((s) => ({
      ...s,
      records: attendanceRecords.filter((r) => r.sessionId === s.id),
    }));
    res.json(sessionsWithRecords);
  });

  api.post('/attendance/sessions', (req, res) => {
    const { assignmentId, date, period, roomNumber, topicCovered, records } = req.body || {};
    const newSessionId = `sess-${Date.now()}`;
    const assignment = facultyAssignments.find((a) => a.id === assignmentId);
    const session = {
      id: newSessionId,
      assignmentId,
      subjectId: assignment?.subjectId || '',
      classGroupId: assignment?.classGroupId || '',
      facultyId: assignment?.facultyId || '',
      date,
      period,
      roomNumber,
      topicCovered,
      markedAt: new Date().toISOString(),
    };
    classSessions.push(session as any);

    if (Array.isArray(records)) {
      records.forEach((r: any) => {
        attendanceRecords.push({
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sessionId: newSessionId,
          studentId: r.studentId,
          status: r.status,
          remarks: r.remarks,
        });
      });
    }
    res.status(201).json({ id: newSessionId });
  });

  api.get('/attendance/corrections', (_req, res) => {
    res.json(
      correctionRequests.map((c) => ({
        ...c,
        eligibleForFaculty: c.isEligibleForFaculty ?? true,
      }))
    );
  });

  api.post('/attendance/corrections', (req, res) => {
    const newId = `req-att-${Date.now()}`;
    const newReq = {
      id: newId,
      ...req.body,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      isEligibleForFaculty: true,
    };
    correctionRequests.push(newReq);
    res.status(201).json({ id: newId });
  });

  api.patch('/attendance/corrections/:id/review', (req, res) => {
    const item = correctionRequests.find((c) => c.id === req.params.id);
    if (item) {
      item.status = req.body.decision;
      item.reviewRemarks = req.body.remarks;
      item.reviewedAt = new Date().toISOString();
      res.json(item);
    } else {
      res.status(404).json({ message: 'Correction request not found' });
    }
  });

  api.get('/attendance/risk-settings', (_req, res) => res.json(riskSettings));
  api.put('/attendance/risk-settings', (req, res) => {
    riskSettings = { ...riskSettings, ...req.body };
    res.json(riskSettings);
  });

  // ---------------- EXAMS & MARKS ----------------
  api.get('/exams', (_req, res) => {
    // Include subjects array on each exam so erpApi can query marks per subject
    const examsWithSubjects = exams.map((exam) => ({
      ...exam,
      subjects: subjects.filter((s) => s.semester === exam.semester).map((s) => ({ subjectId: s.id })),
    }));
    res.json(examsWithSubjects);
  });

  api.get('/grade-rules', (_req, res) => res.json(gradeRules));

  api.get('/exams/:id/subjects/:subjectId/marks', (req, res) => {
    const marks = studentMarks
      .filter((m) => m.examId === req.params.id && m.subjectId === req.params.subjectId)
      .map((m) => ({
        ...m,
        passed: m.isPassed,
      }));
    res.json(marks);
  });

  api.post('/exams/marks', (req, res) => {
    const { examId, subjectId, marks } = req.body || {};
    if (Array.isArray(marks)) {
      marks.forEach((entry: any) => {
        const existing = studentMarks.find(
          (m) => m.examId === examId && m.subjectId === subjectId && m.studentId === entry.studentId
        );
        if (existing) {
          existing.marksObtained = entry.marksObtained;
          existing.status = entry.status;
          existing.lastUpdated = new Date().toISOString();
        } else {
          studentMarks.push({
            id: `mk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            examId,
            subjectId,
            studentId: entry.studentId,
            status: entry.status,
            marksObtained: entry.marksObtained,
            isPassed: (entry.marksObtained ?? 0) >= 45,
            enteredByFacultyId: 'fac-1',
            lastUpdated: new Date().toISOString(),
          });
        }
      });
    }
    res.status(200).json({ success: true });
  });

  api.post('/exams/:id/publish', (req, res) => {
    const exam = exams.find((e) => e.id === req.params.id);
    if (exam) {
      exam.status = 'PUBLISHED';
      exam.publishedAt = new Date().toISOString();
      res.json(exam);
    } else {
      res.status(404).json({ message: 'Exam not found' });
    }
  });

  api.get('/marks-corrections', (_req, res) => res.json(marksCorrections));
  api.post('/marks-corrections', (req, res) => {
    const correction = {
      id: `mc-${Date.now()}`,
      ...req.body,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };
    marksCorrections.push(correction);
    res.status(201).json(correction);
  });
  api.patch('/marks-corrections/:id/review', (req, res) => {
    const item = marksCorrections.find((m) => m.id === req.params.id);
    if (item) {
      item.status = req.body.decision;
      item.reviewNotes = req.body.notes;
      res.json(item);
    } else {
      res.status(404).json({ message: 'Correction not found' });
    }
  });

  // ---------------- COMPLAINTS ----------------
  api.get('/complaints', (_req, res) => res.json(complaints));
  api.post('/complaints', (req, res) => {
    const user = getAuthUser(req);
    const newId = `comp-${Date.now()}`;
    const ticket = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComp = {
      id: newId,
      ticketNumber: ticket,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category || 'GENERAL',
      requestedPriority: req.body.requestedPriority || 'MEDIUM',
      officialPriority: req.body.requestedPriority || 'MEDIUM',
      status: 'OPEN' as const,
      submittedByUserId: user?.id || 'usr-stu-1',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [],
    };
    complaints.push(newComp as any);
    res.status(201).json({ id: newId, ticketNumber: ticket });
  });
  api.patch('/complaints/:id/status', (req, res) => {
    const comp = complaints.find((c) => c.id === req.params.id);
    if (comp) {
      comp.status = req.body.status;
      comp.updatedAt = new Date().toISOString();
      res.json(comp);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  });
  api.patch('/complaints/:id/priority', (req, res) => {
    const comp = complaints.find((c) => c.id === req.params.id);
    if (comp) {
      comp.officialPriority = req.body.priority;
      comp.updatedAt = new Date().toISOString();
      res.json(comp);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  });
  api.patch('/complaints/:id/assign', (req, res) => {
    const comp = complaints.find((c) => c.id === req.params.id);
    if (comp) {
      comp.assignedToFacultyId = req.body.facultyId;
      comp.updatedAt = new Date().toISOString();
      res.json(comp);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  });

  // ---------------- ANNOUNCEMENTS ----------------
  api.get('/announcements', (_req, res) => res.json(announcements));
  api.post('/announcements', (req, res) => {
    const user = getAuthUser(req);
    const newAnn = {
      id: `ann-${Date.now()}`,
      ...req.body,
      publishedAt: new Date().toISOString(),
      publishedBy: user?.loginId || 'Administrator',
    };
    announcements.push(newAnn);
    res.status(201).json(newAnn);
  });
  api.delete('/announcements/:id', (req, res) => {
    announcements = announcements.filter((a) => a.id !== req.params.id);
    res.status(204).end();
  });

  // ---------------- NOTIFICATIONS ----------------
  api.get('/notifications', (req, res) => {
    const user = getAuthUser(req);
    const list = user
      ? notifications.filter((n) => n.recipientUserId === user.id)
      : notifications;
    res.json(list.map((n) => ({ ...n, read: n.isRead })));
  });
  api.patch('/notifications/:id/read', (req, res) => {
    const notif = notifications.find((n) => n.id === req.params.id);
    if (notif) {
      notif.isRead = true;
      res.json({ ...notif, read: true });
    } else {
      res.status(404).json({ message: 'Notification not found' });
    }
  });
  api.patch('/notifications/read-all', (req, res) => {
    const user = getAuthUser(req);
    if (user) {
      notifications.forEach((n) => {
        if (n.recipientUserId === user.id) n.isRead = true;
      });
    } else {
      notifications.forEach((n) => (n.isRead = true));
    }
    res.status(204).end();
  });

  // ---------------- RESULTS & ARREARS ----------------
  const formatResults = (list: typeof semesterResults) =>
    list.map((r) => ({
      studentId: r.studentId,
      examId: r.examId,
      semester: r.semester,
      academicYear: r.academicYear,
      subjects: r.subjectResults.map((s) => ({
        ...s,
        passed: s.isPassed,
      })),
      totalCredits: r.totalCredits,
      earnedCredits: r.earnedCredits,
      semesterGpa: r.semesterGPA,
      overallCgpa: r.overallCGPA,
      overallResult: r.overallResult,
      publishedAt: r.publishedAt,
    }));

  api.get('/results', (_req, res) => res.json(formatResults(semesterResults)));
  api.get('/results/me', (req, res) => {
    const user = getAuthUser(req);
    const student = studentProfiles.find((s) => s.userId === user?.id);
    const results = student
      ? semesterResults.filter((r) => r.studentId === student.id)
      : semesterResults;
    res.json(formatResults(results));
  });

  api.get('/arrears', (_req, res) => res.json(arrearRecords));
  api.get('/arrears/me', (req, res) => {
    const user = getAuthUser(req);
    const student = studentProfiles.find((s) => s.userId === user?.id);
    const arrears = student
      ? arrearRecords.filter((a) => a.studentId === student.id)
      : arrearRecords;
    res.json(arrears);
  });

  // ---------------- ENROLLMENTS & ADMISSIONS ----------------
  api.get('/enrollments', (_req, res) => res.json(enrollments));
  api.get('/enrollments/me', (req, res) => {
    const user = getAuthUser(req);
    const student = studentProfiles.find((s) => s.userId === user?.id);
    const list = student ? enrollments.filter((e) => e.studentId === student.id) : enrollments;
    res.json(list);
  });
  api.patch('/enrollments/:id/status', (req, res) => {
    const enr = enrollments.find((e) => e.id === req.params.id);
    if (enr) {
      enr.status = req.body.status;
      res.json(enr);
    } else {
      res.status(404).json({ message: 'Enrollment not found' });
    }
  });
  api.post('/enrollments/students/:id/promote', (req, res) => {
    const { nextSemester, nextClassGroupId, academicYear } = req.body || {};
    const student = studentProfiles.find((s) => s.id === req.params.id);
    if (student) {
      student.currentSemester = nextSemester;
      student.classGroupId = nextClassGroupId;
      student.academicYear = academicYear;
    }
    res.json({
      success: true,
      promotedSemester: nextSemester,
      graduated: nextSemester > 8,
      message: 'Student promoted successfully',
    });
  });

  api.get('/admissions', (_req, res) => res.json(admissionApplications));
  api.post('/admissions', (req, res) => {
    const newAdm = {
      id: `adm-${Date.now()}`,
      applicationNumber: `APP-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...req.body,
      status: 'SUBMITTED' as const,
      submissionDate: new Date().toISOString(),
      appliedAt: new Date().toISOString(),
    };
    admissionApplications.push(newAdm);
    res.status(201).json(newAdm);
  });
  api.post('/admissions/:id/decision', (req, res) => {
    const adm = admissionApplications.find((a) => a.id === req.params.id);
    if (adm) {
      adm.status = req.body.decision;
      adm.reviewedAt = new Date().toISOString();
      adm.reviewRemarks = req.body.remarks;
      res.json({
        application: adm,
        activationToken: `act-adm-${Date.now()}`,
      });
    } else {
      res.status(404).json({ message: 'Admission application not found' });
    }
  });

  // ---------------- AUDIT LOGS ----------------
  api.get('/audit-logs', (_req, res) => res.json(auditLogs));

  // Mount API router
  app.use('/api/v1', api);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: 3000 },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Campus ERP server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

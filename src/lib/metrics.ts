/**
 * Single source of truth for derived student metrics, academic identity formatting,
 * and statistical comparison calculations.
 */

export interface StudentAcademicIdentity {
  programme: string;
  semester: number;
  section: string;
  formattedString: string;
}

export const formatAcademicIdentity = (
  degree: string = 'B.Tech',
  departmentName: string = 'Computer Science & Engineering',
  semester: number = 5,
  section: string = 'A'
): StudentAcademicIdentity => {
  const programme = `${degree} ${departmentName}`;
  return {
    programme,
    semester,
    section,
    formattedString: `${programme} · Semester ${semester} · Section ${section}`,
  };
};

export interface DomainMasteryMetric {
  domain: string;
  studentScore: number;
  cohortAverage: number;
  highestScore: number;
}

export const CANONICAL_DOMAIN_MASTERY: DomainMasteryMetric[] = [
  { domain: 'Theory & Logic', studentScore: 92.5, cohortAverage: 72.6, highestScore: 96.0 },
  { domain: 'Systems Programming', studentScore: 89.0, cohortAverage: 74.1, highestScore: 94.0 },
  { domain: 'Data & Networking', studentScore: 94.0, cohortAverage: 73.8, highestScore: 98.0 },
  { domain: 'Software Engineering', studentScore: 88.5, cohortAverage: 76.2, highestScore: 92.0 },
];

/**
 * Computes comparative advantage in percentage points (pts).
 * Advantage figures comparing two percentages must read "+19.9 pts" (percentage points).
 */
export const calculatePercentagePointAdvantage = (
  studentPct: number,
  cohortPct: number
): { pointsDiffString: string; pointsDiffNumber: number; relativeChangePercentString: string } => {
  const diff = Number((studentPct - cohortPct).toFixed(1));
  const sign = diff >= 0 ? '+' : '';
  const pointsDiffString = `${sign}${diff} pts`;

  const relativePct = cohortPct > 0 ? Number(((diff / cohortPct) * 100).toFixed(1)) : 0;
  const relSign = relativePct >= 0 ? '+' : '';
  const relativeChangePercentString = `${relSign}${relativePct}% relative`;

  return {
    pointsDiffString,
    pointsDiffNumber: diff,
    relativeChangePercentString,
  };
};

/**
 * Computes the overall average score advantage across all competency domains
 * derived dynamically from CANONICAL_DOMAIN_MASTERY.
 */
export const computeOverallDomainAdvantage = () => {
  const totalStudent = CANONICAL_DOMAIN_MASTERY.reduce((sum, d) => sum + d.studentScore, 0);
  const totalCohort = CANONICAL_DOMAIN_MASTERY.reduce((sum, d) => sum + d.cohortAverage, 0);
  const avgStudent = totalStudent / CANONICAL_DOMAIN_MASTERY.length;
  const avgCohort = totalCohort / CANONICAL_DOMAIN_MASTERY.length;

  const pts = calculatePercentagePointAdvantage(avgStudent, avgCohort);
  return {
    studentAverage: Number(avgStudent.toFixed(1)),
    cohortAverage: Number(avgCohort.toFixed(1)),
    advantageString: pts.pointsDiffString,
    relativeString: pts.relativeChangePercentString,
  };
};

/**
 * Single canonical definition of Student academic standing (Ananya Sharma 21CS101)
 */
export const CANONICAL_STUDENT_METRICS = {
  registerNumber: '21CS101',
  fullName: 'Ananya Sharma',
  email: 'ananya.s@smartcampus.edu',
  cumulativeCGPA: 9.42, // Single metric with one name: "Cumulative CGPA"
  semesterGPA: 9.60,
  attendancePercentage: 89.2,
  cohortSize: 64,
  academicIdentity: formatAcademicIdentity('B.Tech', 'Computer Science & Engineering', 5, 'A'),
};

/**
 * Risk status definitions ensuring icon and text label are paired (no color alone).
 */
export type AcademicRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskStatusBadgeConfig {
  level: AcademicRiskLevel;
  label: 'Safe standing' | 'Monitor' | 'Action required';
  iconName: 'ShieldCheck' | 'AlertTriangle' | 'AlertOctagon';
  colorClasses: string;
}

export const getRiskStatusConfig = (
  attendancePct: number,
  daysToExamCutoff: number = 14
): RiskStatusBadgeConfig => {
  if (attendancePct < 75 || (daysToExamCutoff <= 14 && attendancePct < 80)) {
    return {
      level: 'HIGH',
      label: 'Action required',
      iconName: 'AlertOctagon',
      colorClasses: 'text-rose-700 bg-rose-50 border-rose-200',
    };
  }
  if (attendancePct < 80) {
    return {
      level: 'MEDIUM',
      label: 'Monitor',
      iconName: 'AlertTriangle',
      colorClasses: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }
  return {
    level: 'LOW',
    label: 'Safe standing',
    iconName: 'ShieldCheck',
    colorClasses: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  };
};

/**
 * Attendance Projection Calculator
 * Calculates how many upcoming classes a student must attend to reach >= 75%,
 * or how many classes they can miss and still maintain >= 75%.
 */
export interface AttendanceProjection {
  subjectCode: string;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
  targetPercentage: number;
  projectionMessage: string;
  status: 'SAFE' | 'AT_RISK' | 'BORDERLINE';
}

export const calculateAttendanceProjection = (
  subjectCode: string,
  subjectName: string,
  attended: number,
  total: number,
  targetPercentage: number = 75
): AttendanceProjection => {
  const currentPct = total > 0 ? (attended / total) * 100 : 100;

  if (currentPct < targetPercentage) {
    // Need to attend next x classes: (attended + x) / (total + x) >= target/100
    // attended + x >= 0.75 * total + 0.75 * x
    // 0.25 * x >= 0.75 * total - attended
    // x >= (0.75 * total - attended) / 0.25
    const targetDec = targetPercentage / 100;
    const needed = Math.max(1, Math.ceil((targetDec * total - attended) / (1 - targetDec)));
    return {
      subjectCode,
      subjectName,
      attended,
      total,
      percentage: Number(currentPct.toFixed(1)),
      targetPercentage,
      projectionMessage: `Attend the next ${needed} ${needed === 1 ? 'class' : 'classes'} to reach ${targetPercentage}% in ${subjectCode}.`,
      status: 'AT_RISK',
    };
  } else {
    // Can miss y classes: attended / (total + y) >= target/100
    // attended >= 0.75 * total + 0.75 * y
    // 0.75 * y <= attended - 0.75 * total
    // y <= (attended - 0.75 * total) / 0.75
    const targetDec = targetPercentage / 100;
    const canMiss = Math.max(0, Math.floor((attended - targetDec * total) / targetDec));
    if (canMiss === 0) {
      return {
        subjectCode,
        subjectName,
        attended,
        total,
        percentage: Number(currentPct.toFixed(1)),
        targetPercentage,
        projectionMessage: `Borderline attendance. Do not miss any upcoming classes in ${subjectCode}.`,
        status: 'BORDERLINE',
      };
    }
    return {
      subjectCode,
      subjectName,
      attended,
      total,
      percentage: Number(currentPct.toFixed(1)),
      targetPercentage,
      projectionMessage: `You can miss ${canMiss} more ${canMiss === 1 ? 'class' : 'classes'} in ${subjectCode} and stay eligible.`,
      status: 'SAFE',
    };
  }
};

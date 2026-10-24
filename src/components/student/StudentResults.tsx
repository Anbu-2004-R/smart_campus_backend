import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useERP } from '../../context/ERPContext';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import {
  GraduationCap,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  School,
  FileText,
} from 'lucide-react';
import { SemesterResult } from '../../types/erp';

export const StudentResults: React.FC = () => {
  const { currentStudentProfile } = useAuth();
  const {
    exams,
    semesterResults,
    arrearRecords,
    subjects,
  } = useERP();

  const studentId = currentStudentProfile?.id || 'stu-1';
  const myResults = semesterResults.filter((r) => r.studentId === studentId);
  const myArrears = arrearRecords.filter((a) => a.studentId === studentId);

  const [selectedResult, setSelectedResult] = useState<SemesterResult | null>(
    myResults[myResults.length - 1] || null
  );
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header (Canonical Title & Single Heading) */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Results</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified institutional examination records with GPA & CGPA computed per official credit rules.
          </p>
        </div>

        {selectedResult && (
          <button
            onClick={() => setIsTranscriptModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Generate Official PDF Transcript</span>
          </button>
        )}
      </div>

      {myResults.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-xl p-12 text-center shadow-2xs">
          <Lock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No Published Examination Results</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
            Per University Regulations, semester marks are strictly withheld until the Controller of Examinations and Registrar review and officially publish the results.
          </p>
        </div>
      ) : (
        <>
          {/* GPA & CGPA Banner Card */}
          {selectedResult && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">
                      Semester {selectedResult.semester} Examination Record
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {selectedResult.overallResult}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Academic Year {selectedResult.academicYear} · Published: {new Date(selectedResult.publishedAt || '').toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Semester GPA</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">
                      {selectedResult.semesterGPA.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Cumulative CGPA</span>
                    <span className="text-2xl font-extrabold text-indigo-700 font-mono">
                      {selectedResult.overallCGPA.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Total Credits: <strong className="font-mono text-slate-800">{selectedResult.totalCredits}</strong> · Earned Credits: <strong className="font-mono text-emerald-700">{selectedResult.earnedCredits}</strong></span>
                <span className="font-mono text-slate-400">Formula: &sum;(Credits &times; GradePoint) / &sum;(Credits)</span>
              </div>
            </div>
          )}

          {/* Subject-wise Marks Table */}
          {selectedResult && (
            <div className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="px-5 py-3">Subject Code & Title</th>
                      <th className="px-4 py-3">Credits</th>
                      <th className="px-4 py-3">Max Marks</th>
                      <th className="px-4 py-3">Marks Obtained</th>
                      <th className="px-4 py-3">Grade</th>
                      <th className="px-4 py-3">Grade Point</th>
                      <th className="px-5 py-3 text-right">Pass / Fail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                    {selectedResult.subjectResults.map((sr) => (
                      <tr key={sr.subjectId} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-sans">
                          <div className="font-bold text-slate-900 font-mono">{sr.subjectCode}</div>
                          <div className="text-xs text-slate-600">{sr.subjectName}</div>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">{sr.credits}</td>
                        <td className="px-4 py-3.5 text-slate-500">{sr.maxMarks}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">
                          {sr.marksObtained !== undefined ? sr.marksObtained : 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-indigo-700">{sr.grade || '-'}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {sr.gradePoint !== undefined ? sr.gradePoint : '-'}
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          {sr.isPassed ? (
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              PASS
                            </span>
                          ) : (
                            <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                              ARREAR
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Arrear History if applicable */}
          {myArrears.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Arrear &amp; Re-examination Records</h3>
              </div>
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                Per official university regulations, original attempts are permanently preserved. Re-examinations are recorded separately.
              </p>

              <div className="space-y-2">
                {myArrears.map((arr) => {
                  const sub = subjects.find((s) => s.id === arr.subjectId);
                  return (
                    <div key={arr.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{sub?.code} - {sub?.name}</span>
                        <div className="text-[11px] text-slate-500">
                          Original Grade: <strong className="text-rose-600 font-mono">{arr.originalGrade}</strong> in {arr.originalExamId}
                        </div>
                      </div>
                      <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {arr.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Official PDF-Like Transcript Modal (Printable) */}
      {selectedResult && (
        <Modal
          isOpen={isTranscriptModalOpen}
          onClose={() => setIsTranscriptModalOpen(false)}
          title="Official Grade Sheet & Academic Transcript"
          subtitle="Autonomous College of Engineering and Technology (Accredited A++)"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs" id="transcript-printable">
            {/* Header Lockup */}
            <div className="text-center pb-4 border-b-2 border-slate-900">
              <div className="text-base font-extrabold tracking-tight text-slate-900 uppercase">
                SMART CAMPUS AUTONOMOUS INSTITUTE OF TECHNOLOGY
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                Approved by AICTE · Affiliated to State Technological University
              </div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mt-2">
                GRADE CARD · SEMESTER {selectedResult.semester} EXAMINATION
              </div>
            </div>

            {/* Candidate Details Grid */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-300 rounded font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block">Candidate Name</span>
                <span className="font-bold text-slate-900 font-sans">{currentStudentProfile?.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Register Number</span>
                <span className="font-bold text-slate-900">{currentStudentProfile?.registerNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Degree & Programme</span>
                <span className="font-bold text-slate-900 font-sans">B.Tech - Computer Science & Engg</span>
              </div>
              <div>
                <span className="text-slate-500 block">Academic Period</span>
                <span className="font-bold text-slate-900">{selectedResult.academicYear}</span>
              </div>
            </div>

            {/* Transcript Marks Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <tr>
                  <th className="p-2 border-r border-slate-300">Course Code</th>
                  <th className="p-2 border-r border-slate-300">Course Title</th>
                  <th className="p-2 border-r border-slate-300 text-center">Credits</th>
                  <th className="p-2 border-r border-slate-300 text-center">Grade</th>
                  <th className="p-2 border-r border-slate-300 text-center">Points</th>
                  <th className="p-2 text-center">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {selectedResult.subjectResults.map((sr) => (
                  <tr key={sr.subjectId}>
                    <td className="p-2 border-r border-slate-300 font-bold">{sr.subjectCode}</td>
                    <td className="p-2 border-r border-slate-300 font-sans">{sr.subjectName}</td>
                    <td className="p-2 border-r border-slate-300 text-center">{sr.credits}</td>
                    <td className="p-2 border-r border-slate-300 text-center font-bold">{sr.grade}</td>
                    <td className="p-2 border-r border-slate-300 text-center">{sr.gradePoint}</td>
                    <td className="p-2 text-center font-sans font-semibold text-emerald-700">
                      {sr.isPassed ? 'PASS' : 'FAIL'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Summary Strip */}
            <div className="flex items-center justify-between p-3 bg-slate-100 border border-slate-300 rounded font-mono text-xs">
              <div>
                Credits Earned: <strong className="text-slate-900">{selectedResult.earnedCredits} / {selectedResult.totalCredits}</strong>
              </div>
              <div>
                Semester GPA: <strong className="text-slate-900">{selectedResult.semesterGPA.toFixed(2)}</strong>
              </div>
              <div>
                Overall CGPA: <strong className="text-indigo-900 font-bold">{selectedResult.overallCGPA.toFixed(2)}</strong>
              </div>
              <div>
                Result: <strong className="text-emerald-800">{selectedResult.overallResult}</strong>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="pt-8 flex items-center justify-between text-center text-xs font-medium text-slate-700">
              <div className="w-40 border-t border-slate-400 pt-1">
                <div>Section Officer</div>
                <div className="text-[10px] text-slate-400">Exam Cell</div>
              </div>
              <div className="w-40 border-t border-slate-400 pt-1">
                <div>Controller of Examinations</div>
                <div className="text-[10px] text-slate-400">Autonomous Cell</div>
              </div>
              <div className="w-40 border-t border-slate-400 pt-1">
                <div>Registrar</div>
                <div className="text-[10px] text-slate-400">Smart Campus</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 no-print">
              <button
                type="button"
                onClick={() => setIsTranscriptModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Transcript</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

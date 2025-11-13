import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';

// Course catalog with prerequisites (agents must reference external PDF)
const COURSE_CATALOG = {
  'Intro to Programming': [],
  'Data Structures': ['Intro to Programming'],
  'Algorithms': ['Data Structures'],
  'Database Design': ['Intro to Programming'],
  'Advanced SQL': ['Database Design'],
  'Machine Learning': ['Algorithms', 'Advanced SQL'],
  'Web Development': ['Intro to Programming'],
  'Cloud Architecture': ['Web Development']
};

const ALL_COURSES = Object.keys(COURSE_CATALOG);

type Course = keyof typeof COURSE_CATALOG;

type Decision = 'pending' | 'approve' | 'deny' | 'defer';
type DenialReason = '' | 'Prerequisites Not Met' | 'Course Full' | 'Budget Constraint' | 'Manager Approval Required';

type CourseDecision = {
  course: string;
  decision: Decision;
  reason: DenialReason;
  prerequisitesMet: boolean;
};

type EnrollmentRequest = {
  employeeName: string;
  employeeId: string;
  completedCourses: string[];
  requestedCourses: string[];
  decisions: CourseDecision[];
};

type ProcessedEnrollment = {
  employeeName: string;
  employeeId: string;
  completedCourses: string[];
  requestedCourses: string[];
  decisions: CourseDecision[];
  processedAt: string;
};

const Task33: React.FC = () => {
  const [enrollmentRequests, setEnrollmentRequests] = useState<EnrollmentRequest[]>([
    { employeeName: '', employeeId: '', completedCourses: [], requestedCourses: [], decisions: [] },
    { employeeName: '', employeeId: '', completedCourses: [], requestedCourses: [], decisions: [] },
    { employeeName: '', employeeId: '', completedCourses: [], requestedCourses: [], decisions: [] },
    { employeeName: '', employeeId: '', completedCourses: [], requestedCourses: [], decisions: [] },
    { employeeName: '', employeeId: '', completedCourses: [], requestedCourses: [], decisions: [] }
  ]);

  const [processedEnrollments, setProcessedEnrollments] = useState<ProcessedEnrollment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [currentRequestIndex, setCurrentRequestIndex] = useState<number | null>(null);

  // Form fields for modal
  const [employeeNameInput, setEmployeeNameInput] = useState('');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [completedCoursesInput, setCompletedCoursesInput] = useState<string[]>([]);
  const [requestedCoursesInput, setRequestedCoursesInput] = useState<string[]>([]);

  const checkPrerequisites = (course: string, completedCourses: string[]): boolean => {
    const prerequisites = COURSE_CATALOG[course as Course];
    if (!prerequisites) return false;
    if (prerequisites.length === 0) return true;
    return prerequisites.every(prereq => completedCourses.includes(prereq));
  };

  const handleReviewRequest = (index: number) => {
    const request = enrollmentRequests[index];
    setCurrentRequestIndex(index);
    setEmployeeNameInput(request.employeeName);
    setEmployeeIdInput(request.employeeId);
    setCompletedCoursesInput([...request.completedCourses]);
    setRequestedCoursesInput([...request.requestedCourses]);
    setShowModal(true);
  };

  const addCompletedCourse = (course: string) => {
    if (!completedCoursesInput.includes(course)) {
      setCompletedCoursesInput([...completedCoursesInput, course]);
    }
  };

  const removeCompletedCourse = (course: string) => {
    setCompletedCoursesInput(completedCoursesInput.filter(c => c !== course));
  };

  const addRequestedCourse = (course: string) => {
    if (!requestedCoursesInput.includes(course)) {
      setRequestedCoursesInput([...requestedCoursesInput, course]);
    }
  };

  const removeRequestedCourse = (course: string) => {
    setRequestedCoursesInput(requestedCoursesInput.filter(c => c !== course));
  };

  const handleSaveRequest = () => {
    if (currentRequestIndex === null) return;

    const completedCourses = [...completedCoursesInput];
    const requestedCourses = [...requestedCoursesInput];

    const decisions: CourseDecision[] = requestedCourses.map(course => {
      const existing = enrollmentRequests[currentRequestIndex].decisions.find(d => d.course === course);
      const prerequisitesMet = checkPrerequisites(course, completedCourses);
      return {
        course,
        decision: existing?.decision || 'pending',
        reason: existing?.reason || '',
        prerequisitesMet
      };
    });

    const updatedRequests = [...enrollmentRequests];
    updatedRequests[currentRequestIndex] = {
      employeeName: employeeNameInput.trim(),
      employeeId: employeeIdInput.trim(),
      completedCourses,
      requestedCourses,
      decisions
    };

    setEnrollmentRequests(updatedRequests);
    // Don't close modal - user needs to make approval decisions
  };

  const handleDecisionChange = (courseIndex: number, decision: Decision) => {
    if (currentRequestIndex === null) return;

    const updatedRequests = [...enrollmentRequests];
    const request = updatedRequests[currentRequestIndex];
    if (request.decisions[courseIndex]) {
      request.decisions[courseIndex].decision = decision;
      // Clear reason if not deny
      if (decision !== 'deny') {
        request.decisions[courseIndex].reason = '';
      }
    }
    setEnrollmentRequests(updatedRequests);
  };

  const handleReasonChange = (courseIndex: number, reason: DenialReason) => {
    if (currentRequestIndex === null) return;

    const updatedRequests = [...enrollmentRequests];
    const request = updatedRequests[currentRequestIndex];
    if (request.decisions[courseIndex]) {
      request.decisions[courseIndex].reason = reason;
    }
    setEnrollmentRequests(updatedRequests);
  };

  const handleSubmit = () => {
    const validRequests = enrollmentRequests.filter(req => 
      req.employeeName && req.employeeId && req.decisions.length > 0
    );

    const processed: ProcessedEnrollment[] = validRequests.map(req => ({
      ...req,
      processedAt: new Date().toISOString()
    }));

    setProcessedEnrollments(processed);
  };

  const getDecisionStats = (request: EnrollmentRequest) => {
    const approved = request.decisions.filter(d => d.decision === 'approve').length;
    const denied = request.decisions.filter(d => d.decision === 'deny').length;
    const deferred = request.decisions.filter(d => d.decision === 'defer').length;
    const pending = request.decisions.filter(d => d.decision === 'pending').length;
    return { approved, denied, deferred, pending };
  };

  // Expose app state for validation
  useEffect(() => {
    (window as any).app_state = {
      enrollmentRequests: enrollmentRequests.map(req => ({
        employeeName: req.employeeName,
        employeeId: req.employeeId,
        completedCourses: req.completedCourses,
        requestedCourses: req.requestedCourses,
        decisions: req.decisions.map(d => ({
          course: d.course,
          decision: d.decision,
          reason: d.reason,
          prerequisitesMet: d.prerequisitesMet
        }))
      })),
      processedEnrollments: processedEnrollments.map(pe => ({
        employeeName: pe.employeeName,
        employeeId: pe.employeeId,
        completedCourses: pe.completedCourses,
        requestedCourses: pe.requestedCourses,
        decisions: pe.decisions.map(d => ({
          course: d.course,
          decision: d.decision,
          reason: d.reason,
          prerequisitesMet: d.prerequisitesMet
        })),
        processedAt: pe.processedAt
      }))
    };
  }, [enrollmentRequests, processedEnrollments]);

  const currentRequest = currentRequestIndex !== null ? enrollmentRequests[currentRequestIndex] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Training Enrollment Approval System</h1>
          <p className="text-sm text-gray-600 mt-1">Review course enrollment requests and validate prerequisites</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {enrollmentRequests.map((request, index) => {
              const stats = getDecisionStats(request);
              const hasData = request.employeeName && request.employeeId;
              
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {request.employeeName || `Employee ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">{request.employeeId || 'No ID'}</p>
                    </div>
                    {hasData && (
                      <div className="flex gap-1">
                        {stats.approved > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                            {stats.approved}
                          </span>
                        )}
                        {stats.denied > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            {stats.denied}
                          </span>
                        )}
                        {stats.deferred > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            {stats.deferred}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {hasData && (
                    <div className="space-y-2 mb-3">
                      <div className="text-xs">
                        <span className="text-gray-500">Completed: </span>
                        <span className="text-gray-700">{request.completedCourses.length} courses</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-gray-500">Requested: </span>
                        <span className="text-gray-700">{request.requestedCourses.length} courses</span>
                      </div>
                      {stats.pending > 0 && (
                        <div className="text-xs text-orange-600">
                          {stats.pending} pending decision(s)
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleReviewRequest(index)}
                    className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                  >
                    Review Request
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
            >
              Submit All Approvals
            </button>
          </div>
        </div>

        {processedEnrollments.length > 0 && (
          <div className="p-6 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Processed Enrollments</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Employee</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">ID</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Courses</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Approved</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Denied</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Deferred</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedEnrollments.map((enrollment, index) => {
                    const stats = {
                      approved: enrollment.decisions.filter(d => d.decision === 'approve').length,
                      denied: enrollment.decisions.filter(d => d.decision === 'deny').length,
                      deferred: enrollment.decisions.filter(d => d.decision === 'defer').length
                    };
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{enrollment.employeeName}</td>
                        <td className="px-4 py-2 text-gray-600">{enrollment.employeeId}</td>
                        <td className="px-4 py-2">{enrollment.requestedCourses.length}</td>
                        <td className="px-4 py-2">
                          <span className="text-green-600 font-medium">{stats.approved}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-red-600 font-medium">{stats.denied}</span>
                        </td>
                        <td className="px-4 py-2">
                          <span className="text-yellow-600 font-medium">{stats.deferred}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showModal && currentRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900">Enrollment Request Review</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Employee Info Form */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Name
                  </label>
                  <input
                    type="text"
                    value={employeeNameInput}
                    onChange={(e) => setEmployeeNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    value={employeeIdInput}
                    onChange={(e) => setEmployeeIdInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter employee ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completed Courses
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  {/* Selected courses as pills */}
                  {completedCoursesInput.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {completedCoursesInput.map((course) => (
                        <span
                          key={course}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {course}
                          <button
                            onClick={() => removeCompletedCourse(course)}
                            className="hover:bg-blue-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Course selector dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addCompletedCourse(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course to add...</option>
                    {ALL_COURSES.filter(c => !completedCoursesInput.includes(c)).map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requested Courses
                </label>
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  {/* Selected courses as pills */}
                  {requestedCoursesInput.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {requestedCoursesInput.map((course) => (
                        <span
                          key={course}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {course}
                          <button
                            onClick={() => removeRequestedCourse(course)}
                            className="hover:bg-green-200 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Course selector dropdown */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addRequestedCourse(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a course to add...</option>
                    {ALL_COURSES.filter(c => !requestedCoursesInput.includes(c)).map((course) => (
                      <option key={course} value={course}>
                        {course}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSaveRequest}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Review Process
                </button>
              </div>

              {/* Course Decisions */}
              {currentRequest.decisions.length > 0 && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Approval Decisions</h3>
                  <div className="space-y-4">
                    {currentRequest.decisions.map((decision, courseIndex) => (
                      <div key={courseIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{decision.course}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              {decision.prerequisitesMet ? (
                                <span className="inline-flex items-center gap-1 text-xs text-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                  Prerequisites met
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-red-700">
                                  <XCircle className="w-4 h-4" />
                                  Prerequisites not met
                                </span>
                              )}
                            </div>
                            {!decision.prerequisitesMet && COURSE_CATALOG[decision.course as Course] && (
                              <div className="text-xs text-gray-600 mt-1">
                                Required: {COURSE_CATALOG[decision.course as Course].join(', ')}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Decision
                            </label>
                            <select
                              value={decision.decision}
                              onChange={(e) => handleDecisionChange(courseIndex, e.target.value as Decision)}
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="pending">Pending</option>
                              <option value="approve">Approve</option>
                              <option value="deny">Deny</option>
                              <option value="defer">Defer</option>
                            </select>
                          </div>

                          {decision.decision === 'deny' && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Reason
                              </label>
                              <select
                                value={decision.reason}
                                onChange={(e) => handleReasonChange(courseIndex, e.target.value as DenialReason)}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select reason</option>
                                <option value="Prerequisites Not Met">Prerequisites Not Met</option>
                                <option value="Course Full">Course Full</option>
                                <option value="Budget Constraint">Budget Constraint</option>
                                <option value="Manager Approval Required">Manager Approval Required</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowModal(false);
                  setCurrentRequestIndex(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task33;


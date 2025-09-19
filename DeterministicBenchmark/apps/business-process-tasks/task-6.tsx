import React, { useState, useEffect } from 'react';
import { CheckCircle, User, BookOpen, FileText, X } from 'lucide-react';

// Generate 5 student transcript records with interview notes and recommendation letters
const generateStudentData = () => {
  const students = [
    { id: 1, name: 'Emily Johnson', studentId: 'ST001', major: 'Computer Science' },
    { id: 2, name: 'Michael Chen', studentId: 'ST002', major: 'Computer Science' },
    { id: 3, name: 'Sarah Williams', studentId: 'ST003', major: 'Computer Science' },
    { id: 4, name: 'David Rodriguez', studentId: 'ST004', major: 'Computer Science' },
    { id: 5, name: 'Jessica Brown', studentId: 'ST005', major: 'Computer Science' }
  ];

  // Course prerequisite requirements for advanced CS course enrollment
  const prerequisites = [
    { code: 'CS101', name: 'Introduction to Programming', minGrade: 'B+', gradePoints: 3.3 },
    { code: 'MATH201', name: 'Calculus II', minGrade: 'C+', gradePoints: 2.3 },
    { code: 'CS201', name: 'Data Structures', minGrade: 'B', gradePoints: 3.0 }
  ];

  const gradeToPoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  // Available criteria for tagging
  const criteriaOptions = {
    academic: ['CS101 Pass', 'MATH201 Pass', 'CS201 Pass', 'GPA ≥3.0'],
    interview: ['Leadership', 'Communication', 'Problem-solving', 'Teamwork', 'Professionalism', 'Preparation', 'Enthusiasm'],
    recommendation: ['Exceptional Student', 'Strong Analytical Skills', 'Creative Thinking', 'Natural Leader', 'Top Performer', 'Reliable', 'Innovative']
  };

  // Generate transcripts with interview notes and recommendation letters
  const transcripts = students.map((student, index) => {
    let courses: any[] = [];
    let gpa = 0;
    let interviewNotes = '';
    let recommendationLetter = '';
    let expectedTags = {
      academic: [] as string[],
      interview: [] as string[],
      recommendation: [] as string[]
    };
    
    if (index === 0) {
      // Emily Johnson - Strong candidate with excellent academics and leadership
      courses = [
        { code: 'CS101', name: 'Introduction to Programming', grade: 'A', credits: 3 },
        { code: 'MATH201', name: 'Calculus II', grade: 'A-', credits: 4 },
        { code: 'CS201', name: 'Data Structures', grade: 'A', credits: 3 },
        { code: 'ENG101', name: 'English Composition', grade: 'B+', credits: 3 },
        { code: 'PHYS101', name: 'Physics I', grade: 'A-', credits: 4 }
      ];
      gpa = 3.8;
      expectedTags.academic = ['CS101 Pass', 'MATH201 Pass', 'CS201 Pass', 'GPA ≥3.0'];
      
      interviewNotes = `Emily demonstrated exceptional problem-solving skills during our technical discussion. She articulated complex algorithms clearly showing strong communication abilities. When asked about teamwork, she provided specific examples of leading study groups and mentoring struggling classmates, displaying natural leadership qualities. Her communication is polished and professional. She asked insightful questions about our research projects and seemed well-prepared for the interview. Overall impression: highly motivated with strong enthusiasm for the field.`;
      expectedTags.interview = ['Problem-solving', 'Communication', 'Leadership', 'Teamwork', 'Professionalism', 'Preparation', 'Enthusiasm'];
      
      recommendationLetter = `I have had the pleasure of teaching Emily in two advanced courses. She consistently ranks as a top performer among students I have encountered in my 15-year career. Emily possesses exceptional analytical skills and demonstrates remarkable creative thinking in her approach to complex problems. Her final project was truly outstanding—innovative, well-executed, and presented with clarity. She is a natural leader who elevates the performance of her peers and is truly an exceptional student. I recommend her without reservation for your program.`;
      expectedTags.recommendation = ['Exceptional Student', 'Strong Analytical Skills', 'Creative Thinking', 'Natural Leader', 'Top Performer', 'Innovative'];
      
    } else if (index === 1) {
      // Michael Chen - Good grades but concerning interview performance
      courses = [
        { code: 'CS101', name: 'Introduction to Programming', grade: 'A-', credits: 3 },
        { code: 'MATH201', name: 'Calculus II', grade: 'B+', credits: 4 },
        { code: 'CS201', name: 'Data Structures', grade: 'A-', credits: 3 },
        { code: 'ENG101', name: 'English Composition', grade: 'B', credits: 3 },
        { code: 'PHYS101', name: 'Physics I', grade: 'B+', credits: 4 }
      ];
      gpa = 3.5;
      expectedTags.academic = ['CS101 Pass', 'MATH201 Pass', 'CS201 Pass', 'GPA ≥3.0'];
      
      interviewNotes = `Michael demonstrated adequate technical knowledge but significant weaknesses became apparent during our discussion. His explanations lacked clarity and he struggled to communicate complex ideas effectively. When discussing team collaboration, he provided only superficial responses with no concrete examples of successful partnerships. He seemed unprepared for standard program questions and appeared uncomfortable throughout the interview. While his technical foundation exists, his poor communication skills and apparent difficulty with collaborative work raise serious concerns about his fit for our research environment.`;
      expectedTags.interview = []; // No positive criteria demonstrated
      
      recommendationLetter = `Michael is a methodical student who meets basic requirements consistently. He completes assignments punctually and follows detailed instructions without deviation. His work demonstrates technical accuracy and careful attention to procedural details. However, he lacks innovation and creative problem-solving abilities. He strongly prefers individual work over collaboration and requires highly structured guidance to succeed. While dependable for routine tasks, he has not shown the intellectual curiosity or leadership potential typically expected in graduate programs.`;
      expectedTags.recommendation = []; // No positive criteria demonstrated
      
    } else if (index === 2) {
      // Sarah Williams - Average grades but outstanding personal qualities
      courses = [
        { code: 'CS101', name: 'Introduction to Programming', grade: 'B+', credits: 3 },
        { code: 'MATH201', name: 'Calculus II', grade: 'B', credits: 4 },
        { code: 'CS201', name: 'Data Structures', grade: 'B', credits: 3 },
        { code: 'ENG101', name: 'English Composition', grade: 'A-', credits: 3 },
        { code: 'PHYS101', name: 'Physics I', grade: 'B-', credits: 4 }
      ];
      gpa = 3.1;
      expectedTags.academic = ['CS101 Pass', 'MATH201 Pass', 'CS201 Pass', 'GPA ≥3.0'];
      
      interviewNotes = `Sarah exhibited outstanding enthusiasm and natural collaborative instincts throughout our conversation. Her technical foundation is solid, and she demonstrated exceptional creative problem-solving approaches when presented with challenging scenarios. She spoke with genuine passion about her volunteer work leading coding workshops for underserved youth, clearly showcasing her leadership abilities and community commitment. Her communication was articulate and engaging, and she came well-prepared with thoughtful questions about our research directions. Her interpersonal skills and growth-oriented mindset were immediately apparent and impressive.`;
      expectedTags.interview = ['Enthusiasm', 'Teamwork', 'Problem-solving', 'Leadership', 'Communication', 'Professionalism', 'Preparation'];
      
      recommendationLetter = `While Sarah may not rank among my highest-achieving students in terms of raw grades, she exemplifies the kind of exceptional character and leadership that defines program success. Her work ethic is extraordinary and she approaches every challenge with creative determination. She consistently emerges as the natural leader in group settings, inspiring collaboration and elevating team performance. Her innovative thinking and ability to find novel solutions to complex problems sets her apart. Combined with her outstanding leadership qualities and unwavering determination, she represents exactly the kind of transformative student who will contribute meaningfully to your program.`;
      expectedTags.recommendation = ['Exceptional Student', 'Creative Thinking', 'Natural Leader', 'Innovative'];
      
    } else if (index === 3) {
      // David Rodriguez - Mixed signals and concerning background
      courses = [
        { code: 'CS101', name: 'Introduction to Programming', grade: 'B-', credits: 3 },
        { code: 'MATH201', name: 'Calculus II', grade: 'C+', credits: 4 },
        { code: 'CS201', name: 'Data Structures', grade: 'B', credits: 3 },
        { code: 'ENG101', name: 'English Composition', grade: 'C', credits: 3 },
        { code: 'PHYS101', name: 'Physics I', grade: 'C+', credits: 4 }
      ];
      gpa = 2.8;
      expectedTags.academic = ['MATH201 Pass', 'CS201 Pass']; // CS101 needs B+, has B-. GPA below 3.0
      
      interviewNotes = `David showed up 10 minutes late and seemed unprepared. His technical knowledge has gaps and he struggled with basic algorithmic concepts. When discussing his academic performance, he made excuses rather than taking responsibility. He was dismissive when asked about teamwork and claimed he "works better alone." His attitude came across as arrogant despite his mediocre performance. Red flags about professionalism and attitude toward collaboration.`;
      expectedTags.interview = []; // No positive criteria demonstrated
      
      recommendationLetter = `David is a student who has faced some challenges during his time in my course. While he demonstrates basic understanding of the material, his performance has been inconsistent. There have been some concerns about his approach to group work and meeting deadlines. He tends to be somewhat resistant to feedback and can be difficult to work with in collaborative settings. With additional maturity and focus, he might develop into a stronger candidate.`;
      expectedTags.recommendation = []; // No positive criteria demonstrated
      
    } else {
      // Jessica Brown - Solid all-around candidate
      courses = [
        { code: 'CS101', name: 'Introduction to Programming', grade: 'A-', credits: 3 },
        { code: 'MATH201', name: 'Calculus II', grade: 'B+', credits: 4 },
        { code: 'CS201', name: 'Data Structures', grade: 'B+', credits: 3 },
        { code: 'ENG101', name: 'English Composition', grade: 'A', credits: 3 },
        { code: 'PHYS101', name: 'Physics I', grade: 'B+', credits: 4 }
      ];
      gpa = 3.4;
      expectedTags.academic = ['CS101 Pass', 'MATH201 Pass', 'CS201 Pass', 'GPA ≥3.0'];
      
      interviewNotes = `Jessica presented herself professionally and answered questions thoughtfully. Her technical knowledge is solid and she demonstrated good problem-solving skills. She provided relevant examples of successful teamwork and showed emotional intelligence when discussing conflicts. While not the most charismatic candidate, she seems reliable and competent. Her questions about the program were practical and well-informed, showing good preparation. Overall a well-rounded candidate with no major concerns.`;
      expectedTags.interview = ['Professionalism', 'Problem-solving', 'Teamwork', 'Preparation'];
      
      recommendationLetter = `Jessica has been a consistently reliable performer in my classes. She demonstrates solid technical competence and strong analytical skills. Her work is always well-organized and submitted on time. She contributes meaningfully to class discussions and works well with others. While not the most exceptional student I've taught, she is dependable, intelligent, and has good potential for success in graduate studies. I can recommend her with confidence.`;
      expectedTags.recommendation = ['Reliable', 'Strong Analytical Skills'];
    }

    return {
      ...student,
      courses,
      gpa: Math.round(gpa * 100) / 100,
      interviewNotes,
      recommendationLetter,
      expectedTags,
      enrollmentStatus: 'pending',
      decision: '',
      reason: '',
      reviewedAt: null
    };
  });

  return { transcripts, prerequisites, gradeToPoints, criteriaOptions };
};

const Task6: React.FC = () => {
  const [data] = useState(() => generateStudentData());
  const [transcripts] = useState(data.transcripts);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [studentTags, setStudentTags] = useState<{ [key: number]: { academic: string[], interview: string[], recommendation: string[] } }>({});
  const [reviewedStudents, setReviewedStudents] = useState<number[]>([]);
  
  // Function to restore state from JSON
  const restoreState = (jsonString: string) => {
    try {
      const parsedTags = JSON.parse(jsonString);
      
      // Convert string keys to numbers
      const numericTags: { [key: number]: { academic: string[], interview: string[], recommendation: string[] } } = {};
      Object.entries(parsedTags).forEach(([key, value]) => {
        numericTags[parseInt(key)] = value as { academic: string[], interview: string[], recommendation: string[] };
      });
      
      setStudentTags(numericTags);
      
      // Mark all students as reviewed
      const allStudentIds = Object.keys(numericTags).map(id => parseInt(id));
      setReviewedStudents(allStudentIds);
      
      console.log('[Restore] State restored successfully!');
      console.log('[Restore] Students tagged:', allStudentIds.length);
      console.log('[Restore] Current selected student:', selectedStudent);
      
      // If a student is currently selected, show their updated tags
      if (selectedStudent && numericTags[selectedStudent]) {
        const tags = numericTags[selectedStudent];
        console.log(`[Restore] ${selectedStudent} tags:`, tags);
        
        // Force a re-render by briefly deselecting and reselecting the student
        const currentSelected = selectedStudent;
        setSelectedStudent(null);
        setTimeout(() => setSelectedStudent(currentSelected), 10);
      }
      
      return { success: true, message: `Restored tags for ${allStudentIds.length} students` };
    } catch (error) {
      console.error('[Restore] Failed to restore state:', error);
      return { success: false, message: 'Invalid JSON format' };
    }
  };

  // Expose app state and restore function for testing
  useEffect(() => {
    (window as any).app_state = {
      transcripts,
      totalStudents: transcripts.length,
      studentTags,
      reviewedStudents,
      prerequisites: data.prerequisites,
      selectedStudent,
      completedReviews: Object.keys(studentTags).length,
      criteriaOptions: data.criteriaOptions
    };
    
    // Expose restore function globally
    (window as any).restoreTaskState = restoreState;
  }, [transcripts, studentTags, reviewedStudents, selectedStudent, data.prerequisites, data.criteriaOptions]);

  const addTag = (studentId: number, section: 'academic' | 'interview' | 'recommendation', tag: string) => {
    setStudentTags(prev => {
      const current = prev[studentId] || { academic: [], interview: [], recommendation: [] };
      if (!current[section].includes(tag)) {
        const newTags = {
          ...prev,
          [studentId]: {
            ...current,
            [section]: [...current[section], tag]
          }
        };
        
        // Remove from reviewed students when tags are modified
        setReviewedStudents(prev => prev.filter(id => id !== studentId));
        
        // Update live cheat display for selected student
        if (studentId === selectedStudent) {
          const student = transcripts.find(s => s.id === studentId);
          if (student) {
            const currentTags = newTags[studentId] || { academic: [], interview: [], recommendation: [] };
            
            const formatTags = (expected: string[], current: string[]) => {
              const expectedWithStatus = expected.map(tag => current.includes(tag) ? `${tag}✅` : `${tag}🔴`);
              const extra = current.filter(tag => !expected.includes(tag)).map(tag => `${tag}🔴`);
              return [...expectedWithStatus, ...extra].join(' | ') || 'None';
            };
            
            console.log(`[Cheat] ${student.name} - Live status:`);
            console.log(`[Cheat]   Academic: ${formatTags(student.expectedTags.academic, currentTags.academic)}`);
            console.log(`[Cheat]   Interview: ${formatTags(student.expectedTags.interview, currentTags.interview)}`);
            console.log(`[Cheat]   Recommendation: ${formatTags(student.expectedTags.recommendation, currentTags.recommendation)}`);
          }
        }
        
        return newTags;
      }
      return prev;
    });
  };

  const removeTag = (studentId: number, section: 'academic' | 'interview' | 'recommendation', tag: string) => {
    setStudentTags(prev => {
      const current = prev[studentId] || { academic: [], interview: [], recommendation: [] };
      const newTags = {
        ...prev,
        [studentId]: {
          ...current,
          [section]: current[section].filter(t => t !== tag)
        }
      };
      
      // Remove from reviewed students when tags are modified
      setReviewedStudents(prev => prev.filter(id => id !== studentId));
      
      // Update live cheat display for selected student
      if (studentId === selectedStudent) {
        const student = transcripts.find(s => s.id === studentId);
        if (student) {
          const currentTags = newTags[studentId] || { academic: [], interview: [], recommendation: [] };
          
          const formatTags = (expected: string[], current: string[]) => {
            const expectedWithStatus = expected.map(tag => current.includes(tag) ? `${tag}✅` : `${tag}🔴`);
            const extra = current.filter(tag => !expected.includes(tag)).map(tag => `${tag}🔴`);
            return [...expectedWithStatus, ...extra].join(' | ') || 'None';
          };
          
          console.log(`[Cheat] ${student.name} - Live status:`);
          console.log(`[Cheat]   Academic: ${formatTags(student.expectedTags.academic, currentTags.academic)}`);
          console.log(`[Cheat]   Interview: ${formatTags(student.expectedTags.interview, currentTags.interview)}`);
          console.log(`[Cheat]   Recommendation: ${formatTags(student.expectedTags.recommendation, currentTags.recommendation)}`);
        }
      }
      
      return newTags;
    });
  };

  const submitEvaluation = (studentId: number) => {
    if (!reviewedStudents.includes(studentId)) {
      setReviewedStudents(prev => [...prev, studentId]);
    }
  };

  const selectedStudentData = selectedStudent ? transcripts.find(s => s.id === selectedStudent) : null;
  const currentTags = selectedStudent ? studentTags[selectedStudent] || { academic: [], interview: [], recommendation: [] } : { academic: [], interview: [], recommendation: [] };


  const TagDropdown: React.FC<{ 
    options: string[], 
    onSelect: (tag: string) => void, 
    selectedTags: string[],
    placeholder: string 
  }> = ({ options, onSelect, selectedTags, placeholder }) => {
    const availableOptions = options.filter(option => !selectedTags.includes(option));
    
    return (
      <select
        className="w-full p-2 border border-gray-300 rounded text-sm mb-2"
        value=""
        onChange={(e) => {
          if (e.target.value) {
            onSelect(e.target.value);
            e.target.value = '';
          }
        }}
      >
        <option value="">{placeholder}</option>
        {availableOptions.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    );
  };

  const TagPills: React.FC<{ 
    tags: string[], 
    onRemove: (tag: string) => void 
  }> = ({ tags, onRemove }) => {
    return (
      <div className="flex flex-wrap gap-1 min-h-[2rem]">
        {tags.map(tag => (
          <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {tag}
            <button
              onClick={() => onRemove(tag)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-16 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <h1 className="text-2xl font-bold text-gray-800">Graduate School Application Review</h1>
        <p className="text-gray-600 mt-1">Tag criteria demonstrated in academic records, interviews, and recommendations</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Student List */}
        <div className="w-1/3 bg-white border-r">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Students ({transcripts.length})</h3>
            <div className="text-sm text-gray-600 mt-1">
              Reviewed: {reviewedStudents.length} / {transcripts.length}
            </div>
          </div>
          
          <div className="overflow-y-auto h-full">
            {transcripts.map((student) => {
              const isReviewed = reviewedStudents.includes(student.id);
              const tags = studentTags[student.id];
              const totalTags = tags ? tags.academic.length + tags.interview.length + tags.recommendation.length : 0;
              
              return (
                <div
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student.id);
                    
                    // Console log expected tags for selected student (always show current state)
                    const currentTags = studentTags[student.id] || { academic: [], interview: [], recommendation: [] };
                    
                    const formatTags = (expected: string[], current: string[]) => {
                      const expectedWithStatus = expected.map(tag => current.includes(tag) ? `${tag}✅` : `${tag}🔴`);
                      const extra = current.filter(tag => !expected.includes(tag)).map(tag => `${tag}🔴`);
                      return [...expectedWithStatus, ...extra].join(' | ') || 'None';
                    };
                    
                    console.log(`[Cheat] Selected ${student.name} - Expected tags:`);
                    console.log(`[Cheat]   Academic: ${formatTags(student.expectedTags.academic, currentTags.academic)}`);
                    console.log(`[Cheat]   Interview: ${formatTags(student.expectedTags.interview, currentTags.interview)}`);
                    console.log(`[Cheat]   Recommendation: ${formatTags(student.expectedTags.recommendation, currentTags.recommendation)}`);
                  }}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedStudent === student.id
                      ? 'bg-blue-50 border-l-4 border-blue-500'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{student.name}</span>
                        {isReviewed && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{student.studentId}</div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="font-medium text-gray-800">
                          GPA: {student.gpa}
                        </span>
                        <span className="text-gray-600">
                          Tags: {totalTags}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel - Student Details */}
        <div className="flex-1 flex flex-col">
          {selectedStudentData ? (
            <>
              {/* Student Info Header */}
              <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedStudentData.name}</h2>
                    <p className="text-gray-600">{selectedStudentData.studentId} - {selectedStudentData.major}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">
                      GPA: {selectedStudentData.gpa}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  {/* Academic Performance */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Academic Performance
                    </h3>
                    
                    <div className="bg-white rounded-lg border overflow-hidden mb-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Course Code</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Course Name</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Credits</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Grade</th>
                            <th className="px-4 py-3 text-left font-medium text-gray-700">Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudentData.courses.map((course, index) => {
                            const isPrerequisite = data.prerequisites.some(p => p.code === course.code);
                            const points = data.gradeToPoints[course.grade] || 0;
                            
                            return (
                              <tr 
                                key={index}
                                className={`${isPrerequisite ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}
                              >
                                <td className="px-4 py-3 font-medium">
                                  {course.code}
                                  {isPrerequisite && (
                                    <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-1 py-0.5 rounded">
                                      PREREQ
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3">{course.name}</td>
                                <td className="px-4 py-3">{course.credits}</td>
                                <td className="px-4 py-3">
                                  <span className="font-medium text-gray-800">
                                    {course.grade}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{points.toFixed(1)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-medium mb-3">Academic Criteria</h4>
                      <TagDropdown
                        options={data.criteriaOptions.academic}
                        onSelect={(tag) => addTag(selectedStudentData.id, 'academic', tag)}
                        selectedTags={currentTags.academic}
                        placeholder="Select academic criteria..."
                      />
                      <TagPills
                        tags={currentTags.academic}
                        onRemove={(tag) => removeTag(selectedStudentData.id, 'academic', tag)}
                      />
                    </div>
                  </div>

                  {/* Interview Notes */}
                  <div className="mb-6">
                    <div className="bg-white rounded-lg border p-4 mb-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Interview Notes
                      </h4>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {selectedStudentData.interviewNotes}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-medium mb-3">Interview Criteria</h4>
                      <TagDropdown
                        options={data.criteriaOptions.interview}
                        onSelect={(tag) => addTag(selectedStudentData.id, 'interview', tag)}
                        selectedTags={currentTags.interview}
                        placeholder="Select interview criteria..."
                      />
                      <TagPills
                        tags={currentTags.interview}
                        onRemove={(tag) => removeTag(selectedStudentData.id, 'interview', tag)}
                      />
                    </div>
                  </div>

                  {/* Faculty Recommendation */}
                  <div className="mb-6">
                    <div className="bg-white rounded-lg border p-4 mb-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Faculty Recommendation
                      </h4>
                      <div className="text-sm text-gray-700 leading-relaxed">
                        {selectedStudentData.recommendationLetter}
                      </div>
                    </div>

                    <div className="bg-white rounded-lg border p-4">
                      <h4 className="font-medium mb-3">Recommendation Criteria</h4>
                      <TagDropdown
                        options={data.criteriaOptions.recommendation}
                        onSelect={(tag) => addTag(selectedStudentData.id, 'recommendation', tag)}
                        selectedTags={currentTags.recommendation}
                        placeholder="Select recommendation criteria..."
                      />
                      <TagPills
                        tags={currentTags.recommendation}
                        onRemove={(tag) => removeTag(selectedStudentData.id, 'recommendation', tag)}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Panel */}
                <div className="w-80 bg-gray-50 border-l p-6 flex flex-col">
                  <div className="bg-white rounded-lg border p-4 flex-1">
                    <h4 className="font-medium mb-3">Evaluation Summary</h4>
                    
                    <div className="space-y-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Academic ({currentTags.academic.length})</div>
                        <div className="text-gray-600">
                          {currentTags.academic.length > 0 ? currentTags.academic.join(', ') : 'No criteria selected'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Interview ({currentTags.interview.length})</div>
                        <div className="text-gray-600">
                          {currentTags.interview.length > 0 ? currentTags.interview.join(', ') : 'No criteria selected'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-700 mb-1">Recommendation ({currentTags.recommendation.length})</div>
                        <div className="text-gray-600">
                          {currentTags.recommendation.length > 0 ? currentTags.recommendation.join(', ') : 'No criteria selected'}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      {reviewedStudents.includes(selectedStudentData.id) ? (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <div className="text-green-700 font-medium">Evaluation Complete</div>
                        </div>
                      ) : (
                        <button
                          onClick={() => submitEvaluation(selectedStudentData.id)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Submit Evaluation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Student</h3>
                <p className="text-gray-500">Choose a student from the list to review their application and identify relevant criteria.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Task6;
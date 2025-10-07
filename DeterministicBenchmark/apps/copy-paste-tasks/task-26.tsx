import React, { useState, useEffect } from 'react';

// Expected student data from Excel
const expectedStudents = [
  {
    studentName: 'Emily Rodriguez',
    dateOfBirth: '2010-05-15',
    parentGuardian: 'Maria Rodriguez',
    contactEmail: 'm.rodriguez@outlook.com',
    homeAddress: '789 Pine Street, Denver, CO 80202',
    programChoice: 'Visual Arts Program',
    gradeLevel: '8',
    startDate: '2024-08-15',
    specialNeeds: 'None'
  },
  {
    studentName: 'Marcus Thompson',
    dateOfBirth: '2008-11-22',
    parentGuardian: 'Linda Thompson',
    contactEmail: 'lthompson@gmail.com',
    homeAddress: '1456 Oak Ridge Drive, Phoenix, AZ 85016',
    programChoice: 'Advanced Mathematics',
    gradeLevel: '10',
    startDate: '2024-08-15',
    specialNeeds: 'Learning Support'
  },
  {
    studentName: 'Sophie Chen',
    dateOfBirth: '2009-03-08',
    parentGuardian: 'David Chen',
    contactEmail: 'd.chen@techcorp.com',
    homeAddress: '2234 Maple Avenue, San Jose, CA 95110',
    programChoice: 'International Baccalaureate',
    gradeLevel: '9',
    startDate: '2024-08-15',
    specialNeeds: 'Gifted Program'
  }
];

// Available programs with details
const availablePrograms = [
  {
    id: 'visual-arts',
    name: 'Visual Arts Program',
    description: 'Comprehensive arts education with studio courses',
    color: '#FF6B9D',
    icon: '🎨',
    curriculum: 'Drawing, Painting, Sculpture, Digital Media, Art History'
  },
  {
    id: 'advanced-math',
    name: 'Advanced Mathematics',
    description: 'Accelerated mathematics curriculum for high achievers',
    color: '#4ECDC4',
    icon: '📐',
    curriculum: 'Calculus, Statistics, Linear Algebra, Number Theory'
  },
  {
    id: 'international-baccalaureate',
    name: 'International Baccalaureate',
    description: 'Globally recognized IB Diploma Programme',
    color: '#95E1D3',
    icon: '🌍',
    curriculum: 'Theory of Knowledge, Extended Essay, CAS, Six Subject Groups'
  },
  {
    id: 'stem-academy',
    name: 'STEM Academy',
    description: 'Science, Technology, Engineering, Mathematics focus',
    color: '#F38181',
    icon: '🔬',
    curriculum: 'Robotics, Programming, Engineering Design, Research Methods'
  },
  {
    id: 'performing-arts',
    name: 'Performing Arts',
    description: 'Theater, Music, and Dance programs',
    color: '#AA96DA',
    icon: '🎭',
    curriculum: 'Theater Arts, Vocal Music, Dance, Musical Production'
  },
  {
    id: 'humanities',
    name: 'Humanities Track',
    description: 'Literature, History, and Social Sciences emphasis',
    color: '#FCBAD3',
    icon: '📚',
    curriculum: 'World Literature, Philosophy, World History, Social Studies'
  }
];

const specialNeedsOptions = [
  'None',
  'Learning Support',
  'Gifted Program',
  'ESL Services',
  'Physical Accommodations',
  'Counseling Support',
  'Medical Plan (504)',
  'IEP Services'
];

const Task26: React.FC = () => {
  // Form state
  const [studentName, setStudentName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [parentGuardian, setParentGuardian] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [startDate, setStartDate] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  
  // UI state
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [draggedProgram, setDraggedProgram] = useState<string | null>(null);
  const [detailModalProgram, setDetailModalProgram] = useState<any>(null);
  
  // Enrolled students
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);

  // Calculate age from date of birth
  const calculateAge = () => {
    if (!dateOfBirth) return;
    
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    setCalculatedAge(age);
  };

  // Handle program card drag
  const handleProgramDragStart = (programName: string) => {
    setDraggedProgram(programName);
  };

  const handleProgramDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedProgram) {
      setSelectedProgram(draggedProgram);
      setDraggedProgram(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle special needs checkbox
  const toggleSpecialNeed = (need: string) => {
    if (specialNeeds.includes(need)) {
      setSpecialNeeds(specialNeeds.filter(n => n !== need));
    } else {
      setSpecialNeeds([...specialNeeds, need]);
    }
  };

  // Enroll student
  const enrollStudent = () => {
    // Silent validation
    if (!studentName.trim() || !dateOfBirth || !parentGuardian.trim() || 
        !contactEmail.trim() || !homeAddress.trim() || !selectedProgram || 
        !gradeLevel || !startDate || specialNeeds.length === 0) {
      return;
    }

    const enrollment = {
      studentName: studentName.trim(),
      dateOfBirth,
      parentGuardian: parentGuardian.trim(),
      contactEmail: contactEmail.trim(),
      homeAddress: homeAddress.trim(),
      programChoice: selectedProgram,
      gradeLevel,
      startDate,
      specialNeeds: specialNeeds.join(', '),
      enrolledAt: new Date().toISOString()
    };

    setEnrolledStudents([...enrolledStudents, enrollment]);

    // Reset form
    setStudentName('');
    setDateOfBirth('');
    setParentGuardian('');
    setContactEmail('');
    setHomeAddress('');
    setSelectedProgram('');
    setGradeLevel('');
    setStartDate('');
    setSpecialNeeds([]);
    setCalculatedAge(null);
  };

  // Expose app state
  useEffect(() => {
    (window as any).app_state = {
      enrolledStudents,
      currentFormEntry: {
        studentName,
        dateOfBirth,
        parentGuardian,
        contactEmail,
        homeAddress,
        programChoice: selectedProgram,
        gradeLevel,
        startDate,
        specialNeeds: specialNeeds.join(', ')
      },
      formFieldsCompleted: {
        hasStudentName: studentName.trim() !== '',
        hasDateOfBirth: dateOfBirth !== '',
        hasParentGuardian: parentGuardian.trim() !== '',
        hasContactEmail: contactEmail.trim() !== '',
        hasHomeAddress: homeAddress.trim() !== '',
        hasProgramChoice: selectedProgram !== '',
        hasGradeLevel: gradeLevel !== '',
        hasStartDate: startDate !== '',
        hasSpecialNeeds: specialNeeds.length > 0
      },
      totalEnrolledStudents: enrolledStudents.length
    };
  }, [enrolledStudents, studentName, dateOfBirth, parentGuardian, contactEmail, 
      homeAddress, selectedProgram, gradeLevel, startDate, specialNeeds]);

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px'
      }}>
        {/* Left Panel - Program Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Program Cards */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: '#2d3748'
            }}>
              Available Programs
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
              {availablePrograms.map(program => (
                <div
                  key={program.id}
                  draggable
                  onDragStart={() => handleProgramDragStart(program.name)}
                  onDoubleClick={() => setDetailModalProgram(program)}
                  style={{
                    background: program.color,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'grab',
                    transition: 'all 0.2s',
                    border: selectedProgram === program.name ? '3px solid #2d3748' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                    {program.icon}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: 'white',
                    marginBottom: '4px'
                  }}>
                    {program.name}
                  </div>
                  <div style={{ 
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: '1.4'
                  }}>
                    {program.description}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'rgba(255,255,255,0.8)',
                    marginTop: '8px',
                    fontStyle: 'italic'
                  }}>
                    Double-click for details
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students List */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0',
              fontSize: '20px',
              color: '#2d3748'
            }}>
              Enrolled Students ({enrolledStudents.length})
            </h3>
            {enrolledStudents.length === 0 ? (
              <div style={{
                padding: '32px',
                textAlign: 'center',
                color: '#a0aec0',
                fontSize: '14px'
              }}>
                No students enrolled yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {enrolledStudents.map((student, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '16px',
                      background: '#f7fafc',
                      borderRadius: '8px',
                      borderLeft: '4px solid #667eea'
                    }}
                  >
                    <div style={{ 
                      fontWeight: '600',
                      color: '#2d3748',
                      marginBottom: '8px'
                    }}>
                      {student.studentName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>
                      <strong>Program:</strong> {student.programChoice}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a5568', marginBottom: '4px' }}>
                      <strong>Grade:</strong> {student.gradeLevel} | <strong>Start:</strong> {student.startDate}
                    </div>
                    <div style={{ fontSize: '13px', color: '#4a5568' }}>
                      <strong>Guardian:</strong> {student.parentGuardian}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Enrollment Form */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <h3 style={{ 
            margin: '0 0 24px 0',
            fontSize: '24px',
            color: '#2d3748'
          }}>
            Student Enrollment Form
          </h3>

          {/* Student Information */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Student Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Full name"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Date of Birth with Age Calculator */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Date of Birth
            </label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={calculateAge}
                style={{
                  padding: '10px 16px',
                  background: '#4299e1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Calculate Age
              </button>
            </div>
            {calculatedAge !== null && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#e6fffa',
                border: '1px solid #81e6d9',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#234e52'
              }}>
                Age: {calculatedAge} years old
              </div>
            )}
          </div>

          {/* Parent/Guardian */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Parent/Guardian
            </label>
            <input
              type="text"
              value={parentGuardian}
              onChange={(e) => setParentGuardian(e.target.value)}
              placeholder="Guardian name"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Contact Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="email@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Home Address */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Home Address
            </label>
            <input
              type="text"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder="Street, City, State ZIP"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Program Selection Drop Zone */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '6px'
            }}>
              Program Selection
            </label>
            <div
              onDrop={handleProgramDrop}
              onDragOver={handleDragOver}
              style={{
                padding: '24px',
                border: selectedProgram ? '2px solid #48bb78' : '2px dashed #cbd5e0',
                borderRadius: '8px',
                background: selectedProgram ? '#f0fff4' : '#f7fafc',
                textAlign: 'center',
                minHeight: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {selectedProgram ? (
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                    {availablePrograms.find(p => p.name === selectedProgram)?.icon}
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    {selectedProgram}
                  </div>
                  <button
                    onClick={() => setSelectedProgram('')}
                    style={{
                      marginTop: '8px',
                      padding: '4px 12px',
                      background: '#fc8181',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div style={{ color: '#a0aec0', fontSize: '14px' }}>
                  Drag a program card here
                </div>
              )}
            </div>
          </div>

          {/* Grade Level and Start Date */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px'
              }}>
                Grade Level
              </label>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select grade</option>
                {[6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#4a5568',
                marginBottom: '6px'
              }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Special Accommodations */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4a5568',
              marginBottom: '10px'
            }}>
              Special Accommodations
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {specialNeedsOptions.map(need => (
                <label
                  key={need}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                    background: specialNeeds.includes(need) ? '#e6fffa' : '#f7fafc',
                    border: specialNeeds.includes(need) ? '2px solid #38b2ac' : '2px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={specialNeeds.includes(need)}
                    onChange={() => toggleSpecialNeed(need)}
                    style={{ marginRight: '8px', cursor: 'pointer' }}
                  />
                  <span style={{ color: '#2d3748' }}>{need}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Enroll Button */}
          <button
            onClick={enrollStudent}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ✓ Enroll Student
          </button>
        </div>
      </div>

      {/* Program Detail Modal */}
      {detailModalProgram && (
        <div
          onClick={() => setDetailModalProgram(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px', textAlign: 'center' }}>
              {detailModalProgram.icon}
            </div>
            <h2 style={{ 
              margin: '0 0 16px 0',
              fontSize: '24px',
              color: '#2d3748',
              textAlign: 'center'
            }}>
              {detailModalProgram.name}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#4a5568',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              {detailModalProgram.description}
            </p>
            <div style={{
              padding: '16px',
              background: '#f7fafc',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2d3748',
                marginBottom: '8px'
              }}>
                Curriculum Overview:
              </div>
              <div style={{
                fontSize: '13px',
                color: '#4a5568',
                lineHeight: '1.6'
              }}>
                {detailModalProgram.curriculum}
              </div>
            </div>
            <button
              onClick={() => setDetailModalProgram(null)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task26;

import React, { useState, useEffect, useRef } from 'react';
import { UserPlus, RotateCcw, BarChart3, Download, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import StudentCard from './StudentCard';
import AddStudentModal from './AddStudentModal';
import { useStudentData } from '../hooks/useStudentData';
import { SOUND_CONFIG } from '../utils/constants';

const StudentCardGrid = () => {
  const {
    students,
    sortedStudents,
    highlightedId,
    isLoading,
    stats,
    addStudent,
    removeStudent,
    updateScore,
    resetScores,
    resetToDefault,
    changeAvatar,
    editStudentName
  } = useStudentData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const dingSound = useRef(null);

  // Setup audio และ event listeners
  useEffect(() => {
    // Prevent page refresh warning
    const handleBeforeUnload = (e) => {
      if (students.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Setup audio
    try {
      dingSound.current = new Audio(SOUND_CONFIG.dingSound);
      dingSound.current.preload = SOUND_CONFIG.preload;
      dingSound.current.volume = SOUND_CONFIG.volume;
      
      dingSound.current.onerror = () => {
        console.warn("ไม่สามารถโหลดไฟล์เสียง", SOUND_CONFIG.dingSound);
        dingSound.current = null;
      };
    } catch (error) {
      console.warn("ไม่สามารถสร้าง Audio element:", error);
      dingSound.current = null;
    }

    // Load sound preference
    const savedSoundPref = localStorage.getItem('soundEnabled');
    if (savedSoundPref !== null) {
      setSoundEnabled(JSON.parse(savedSoundPref));
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [students.length]);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  // เล่นเสียงที่ปลอดภัย
  const playDingSound = () => {
    if (soundEnabled && dingSound.current) {
      try {
        dingSound.current.currentTime = 0;
        dingSound.current.play().catch(error => {
          console.warn("ไม่สามารถเล่นเสียงได้:", error);
        });
      } catch (error) {
        console.warn("เกิดข้อผิดพลาดในการเล่นเสียง:", error);
      }
    }
  };

  // Handle score changes with effects
  const handleScoreChange = (id, delta) => {
    updateScore(id, delta);
    
    if (delta > 0) {
      playDingSound();
      
      // Confetti effect
      confetti({
        particleCount: delta * 20,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']
      });
    }
  };

  // Handle remove student with confirmation
  const handleRemoveStudent = (id) => {
    const student = students.find(s => s.id === id);
    const studentName = student ? student.name : 'นักเรียน';
    
    if (confirm(`คุณต้องการลบ "${studentName}" ออกจากระบบใช่ไหม?`)) {
      removeStudent(id);
    }
  };

  // Handle reset scores with confirmation
  const handleResetScores = () => {
    if (confirm('คุณต้องการรีเซตคะแนนของนักเรียนทั้งหมดเป็น 0 ใช่ไหม?')) {
      resetScores();
    }
  };

  // Handle reset to default with confirmation
  const handleResetToDefault = () => {
    if (confirm('คุณต้องการรีเซตข้อมูลกลับไปเป็นรายชื่อเริ่มต้นใช่ไหม?\n\n⚠️ ข้อมูลปัจจุบันทั้งหมดจะหายไป!')) {
      resetToDefault();
    }
  };

  // Export data
  const handleExportData = () => {
    try {
      const dataToExport = {
        exportDate: new Date().toISOString(),
        students: students,
        stats: stats
      };
      
      const dataStr = JSON.stringify(dataToExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `student-scores-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('ส่งออกข้อมูลเรียบร้อยแล้ว!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  // Import data
  const handleImportData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        
        if (importedData.students && Array.isArray(importedData.students)) {
          if (confirm('คุณต้องการนำเข้าข้อมูลใหม่ใช่ไหม?\n\n⚠️ ข้อมูลปัจจุบันจะถูกแทนที่!')) {
            localStorage.setItem('studentScores', JSON.stringify(importedData.students));
            window.location.reload(); // Reload to apply imported data
          }
        } else {
          alert('รูปแบบไฟล์ไม่ถูกต้อง');
        }
      } catch (error) {
        console.error('Error importing data:', error);
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์');
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">กำลังโหลดข้อมูล...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                🏆 Leaderboard นักเรียน
              </h1>
              <p className="text-gray-600">
                จำนวนนักเรียน: <span className="font-semibold text-blue-600">{stats.totalStudents}</span> คน
                {stats.totalStudents > 0 && (
                  <span className="ml-4">
                    คะแนนเฉลี่ย: <span className="font-semibold text-green-600">{stats.averageScore}</span>
                  </span>
                )}
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Add Student */}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
              >
                <UserPlus size={18} />
                <span className="hidden sm:inline">เพิ่มนักเรียน</span>
              </button>

              {/* Stats */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2 shadow-md"
              >
                <BarChart3 size={18} />
                <span className="hidden sm:inline">สถิติ</span>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 shadow-md ${
                  soundEnabled 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
                title={soundEnabled ? 'ปิดเสียง' : 'เปิดเสียง'}
              >
                {soundEnabled ? '🔊' : '🔇'}
              </button>

              {/* Export */}
              <button
                onClick={handleExportData}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2 shadow-md"
                title="ส่งออกข้อมูล"
              >
                <Download size={18} />
              </button>

              {/* Import */}
              <label className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 shadow-md cursor-pointer">
                <Upload size={18} />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>

              {/* Reset Scores */}
              <button
                onClick={handleResetScores}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors shadow-md"
                title="รีเซตคะแนน"
              >
                <span className="hidden sm:inline">รีเซตคะแนน</span>
                <span className="sm:hidden">🔄</span>
              </button>

              {/* Reset All */}
              <button
                onClick={handleResetToDefault}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2 shadow-md"
                title="รีเซตทั้งหมด"
              >
                <RotateCcw size={18} />
                <span className="hidden sm:inline">รีเซตทั้งหมด</span>
              </button>
            </div>
          </div>

          {/* Stats Panel */}
          {showStats && stats.totalStudents > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 สถิติรายละเอียด</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalStudents}</div>
                  <div className="text-sm text-blue-800">จำนวนนักเรียน</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
                  <div className="text-sm text-green-800">คะแนนเฉลี่ย</div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.highestScore}</div>
                  <div className="text-sm text-yellow-800">คะแนนสูงสุด</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.studentsWithMaxScore}</div>
                  <div className="text-sm text-purple-800">คะแนนเต็ม 100</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        <AddStudentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={(name, avatar) => {
            const success = addStudent(name);
            if (success === false) {
              return false; // ชื่อซ้ำ
            }
            return true;
          }}
        />

        {/* Student Grid */}
        {sortedStudents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {sortedStudents.map((student, index) => (
              <StudentCard
                key={student.id}
                student={student}
                rank={index + 1}
                highlighted={highlightedId === student.id}
                onScoreChange={handleScoreChange}
                onRemove={handleRemoveStudent}
                onEditName={editStudentName}
                onChangeAvatar={changeAvatar}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ยังไม่มีนักเรียนในระบบ
            </h3>
            <p className="text-gray-500 mb-6">
              เริ่มต้นโดยการเพิ่มนักเรียนคนแรกของคุณ
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto shadow-lg"
            >
              <UserPlus size={20} />
              เพิ่มนักเรียนคนแรก
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>💡 คลิก Avatar หรือชื่อเพื่อแก้ไข • คะแนนสูงสุด 100 คะแนน</p>
        </div>
      </div>
    </div>
  );
};

export default StudentCardGrid;
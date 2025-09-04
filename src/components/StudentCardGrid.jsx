import React from 'react';
// ไม่ต้อง import canvas-confetti แล้ว

import { useEffect, useState, useRef } from "react";

// ใช้ Unicode แทน lucide-react
const XIcon = () => <span>❌</span>;
const UserPlusIcon = () => <span>👤➕</span>;
const RotateCcwIcon = () => <span>🔄</span>;

const AVATARS = [
  "🐯", "🦁", "🦄", "🐼", "🐸", "🐵", "🐨", "🐰", "🐱",
  "🐮", "🐔", "🐧", "🐦", "🐤", "🦉", "🦅", "🐢", "🐍",
  "🐙", "🦕", "🦖", "🐳", "🐬", "🐠", "🦋", "🐝", "🐞",
  "🐲", "🐉", "🦊", "🦝", "🦓", "🦒", "🦘", "🦔", "🦦", "🦥"
];

const DEFAULT_NAMES = [
  "จิรพัฒน์","ชยพล","ชวนากร","ณัฐชนน","ณัฐนันท์","ธนโชติ","พัสกร","ธรณินทร์","นภัสกร","ปิโยรส",
  "พิชิต","ภัทรธร","ภาวัต","วชิรวิชญ์","ศักดิธัช","ศุภณัฐ","กัญญ์วรา","กันตพร","กิรณา","จิรชญาดา",
  "จิราพัช","ฐริตา","ปภาดา","ปภาวรินท์","ปรีดานันท์","เปมิกา","พิชญ์ลลิดา","ภัทรภร","อลิสา","กนกพงศ์",
  "กฤตเมธ","ก้องภพ","เกริกฤทธิ์","เตชินท์","ธนกร","ธนวรรธน์","ปุณยวีร์","พัชรกูล","ภานุวัฒน์","วชิรวิชญ์",
  "วสุวัญญ์","ศตคุณ","อติเทพ","อรงณ์กร","จิราพัชร","โจโซฟิน","ณิชนันทน์","ธัญพิชชา","นันท์นภัส","ผกากรอง",
  "โยสิตา","รัชนีวรรณ","รุ่งนิภา","วชิรญาณ์","วรัทธิตา","วิลาสินี","สุประวีณ์"
];

function App() {
  const maxScore = 100;
  const dingSound = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    // Setup audio
    try {
      dingSound.current = new Audio("/ding.mp3");
      dingSound.current.preload = "auto";
      dingSound.current.onerror = () => {
        console.warn("ไม่สามารถโหลดไฟล์เสียง ding.mp3 ได้");
        dingSound.current = null;
      };
    } catch (error) {
      console.warn("ไม่สามารถสร้าง Audio element ได้:", error);
      dingSound.current = null;
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const createInitialStudents = (names) => {
    return names.map((name, index) => ({
      id: Date.now() + index,
      name,
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      score: 0
    }));
  };

  const [students, setStudents] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');

  // โหลดข้อมูล
  useEffect(() => {
    const saved = localStorage.getItem("studentScores");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStudents(parsed);
        } else {
          setStudents(createInitialStudents(DEFAULT_NAMES));
        }
      } catch (err) {
        console.error("Error parsing saved scores:", err);
        setStudents(createInitialStudents(DEFAULT_NAMES));
      }
    } else {
      setStudents(createInitialStudents(DEFAULT_NAMES));
    }
  }, []);

  // เซฟข้อมูล
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("studentScores", JSON.stringify(students));
    }
  }, [students]);

  const playDingSound = () => {
  try {
    // สร้างเสียง beep ด้วย Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // ตั้งค่าเสียง
    oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // โน๊ตสูง
    oscillator.type = 'sine';
    
    // ความดัง
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    // เล่นเสียง
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    console.log("🔊 เล่นเสียง beep!");
  } catch (error) {
    console.log("ไม่สามารถเล่นเสียงได้:", error);
  }
};

  // 🚀 ฟังก์ชันเอฟเฟคพลุวิ่งขึ้นบน - สีเหลืองครอบคลุมจอ
  const fireConfetti = (score) => {
    console.log("🚀 ยิงพลุขึ้นบน! คะแนน:", score);
    
    // สร้าง confetti elements ด้วย DOM manipulation
    const createConfettiPiece = (color, x, y, delay = 0) => {
      setTimeout(() => {
        const confettiPiece = document.createElement('div');
        confettiPiece.style.cssText = `
          position: fixed;
          width: 12px;
          height: 12px;
          background-color: ${color};
          left: ${x}px;
          top: ${y}px;
          z-index: 9999;
          pointer-events: none;
          border-radius: 50%;
          box-shadow: 0 0 6px ${color};
          animation: fireworkUp 2s ease-out forwards;
        `;
        
        document.body.appendChild(confettiPiece);
        
        // ลบ element หลัง animation เสร็จ
        setTimeout(() => {
          if (confettiPiece.parentNode) {
            confettiPiece.parentNode.removeChild(confettiPiece);
          }
        }, 3000);
      }, delay);
    };

    // เพิ่ม CSS animation ถ้ายังไม่มี
    if (!document.getElementById('confetti-styles')) {
      const style = document.createElement('style');
      style.id = 'confetti-styles';
      style.textContent = `
        @keyframes fireworkUp {
  0% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(-800px);
    opacity: 0;
  }
}
        @keyframes confetti-explode {
          0% {
            transform: scale(0) rotateZ(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.5) rotateZ(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotateZ(360deg);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    // กำหนดจำนวนและสีตามคะแนน (ใช้สีเหลืองเป็นหลัก)
    let colors, particleCount;
    
    if (score === 100) {
      // 🏆 พลุพิเศษ - สีเหลืองทอง
      colors = ['#FFD700', '#FFA500', '#FFFF00', '#F0E68C', '#DAA520'];
      particleCount = 80;
      console.log("🏆 พลุพิเศษ 100 คะแนน!");
    } else if (score >= 90) {
      // 🥇 พลุใหญ่ - สีเหลืองสด
      colors = ['#FFD700', '#FFFF00', '#FFA500'];
      particleCount = 60;
      console.log("🥇 พลุใหญ่ 90+ คะแนน!");
    } else if (score >= 70) {
      // 🥈 พลุกลาง - สีเหลืองอ่อน
      colors = ['#FFFF00', '#F0E68C', '#FFD700'];
      particleCount = 45;
      console.log("🥈 พลุกลาง 70+ คะแนน!");
    } else if (score >= 50) {
      // 🥉 พลุธรรมดา - สีเหลืองปนส้ม
      colors = ['#FFA500', '#FFD700', '#FFFF00'];
      particleCount = 35;
      console.log("🥉 พลุธรรมดา 50+ คะแนน!");
    } else if (score >= 30) {
      // 🌈 พลุเล็ก - สีเหลืองอ่อน
      colors = ['#F0E68C', '#FFFF00', '#DAA520'];
      particleCount = 25;
      console.log("🌈 พลุเล็ก 30+ คะแนน!");
    } else if (score >= 10) {
      // ✨ พลุมินิ - สีเหลืองอ่อน
      colors = ['#FFFF00', '#F0E68C', '#FFD700'];
      particleCount = 20;
      console.log("✨ พลุมินิ 10+ คะแนน!");
    } else {
      // 🎉 พลุเล็กๆ - สีเหลืองอ่อนมาก
      colors = ['#F0E68C', '#FFFACD', '#DAA520'];
      particleCount = 15;
      console.log("🎉 พลุเล็กๆ 1-9 คะแนน!");
    }

    // สร้าง confetti pieces ครอบคลุมความกว้างของจอ - วิ่งขึ้นจากล่าง
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // กระจายเต็มความกว้างจอ
      const x = Math.random() * screenWidth;
      // เริ่มจากด้านล่างจอ
      const y = screenHeight + 50 + (Math.random() * 100);
      
      // หน่วงเวลาการออกมาแบบสุ่ม
      const delay = Math.random() * 500;
      
      createConfettiPiece(color, x, y, delay);
    }

    // พลุพิเศษสำหรับ 100 คะแนน - หลายรอบ
    if (score === 100) {
      // รอบที่ 2
      setTimeout(() => {
        for (let i = 0; i < 50; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const x = Math.random() * screenWidth;
          const y = screenHeight + 100 + (Math.random() * 100);
          createConfettiPiece(color, x, y, Math.random() * 300);
        }
      }, 600);
      
      // รอบที่ 3
      setTimeout(() => {
        for (let i = 0; i < 40; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const x = Math.random() * screenWidth;
          const y = screenHeight + 150 + (Math.random() * 100);
          createConfettiPiece(color, x, y, Math.random() * 200);
        }
      }, 1200);
    } else if (score >= 90) {
      // พลุเสริมสำหรับ 90+ คะแนน
      setTimeout(() => {
        for (let i = 0; i < 30; i++) {
          const color = colors[Math.floor(Math.random() * colors.length)];
          const x = Math.random() * screenWidth;
          const y = screenHeight + 75 + (Math.random() * 100);
          createConfettiPiece(color, x, y, Math.random() * 400);
        }
      }, 400);
    }
  };

  const handleScore = (id, delta) => {
    let newScore = 0;
    
    setStudents(prev =>
      prev.map(student => {
        if (student.id === id) {
          newScore = Math.max(0, Math.min(student.score + delta, maxScore));
          return {
            ...student,
            score: newScore,
          };
        }
        return student;
      })
    );

    setHighlightedId(id);
    setTimeout(() => setHighlightedId(null), 2000);
    
    if (delta > 0) {
      playDingSound();
      
      // 🚀 ยิงพลุขึ้นบนหลังจากอัพเดตคะแนนแล้ว
      setTimeout(() => {
        fireConfetti(newScore);
      }, 100);
    }
  };

  const addStudent = () => {
    if (newStudentName.trim()) {
      const newStudent = {
        id: Date.now(),
        name: newStudentName.trim(),
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        score: 0
      };
      setStudents(prev => [...prev, newStudent]);
      setNewStudentName('');
      setShowAddForm(false);
    }
  };

  const removeStudent = (id) => {
    if (confirm('คุณต้องการลบนักเรียนคนนี้ใช่ไหม?')) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const resetScores = () => {
    if (confirm('คุณต้องการรีเซตคะแนนทั้งหมดใช่ไหม?')) {
      setStudents(prev => prev.map(student => ({ ...student, score: 0 })));
    }
  };

  const resetToDefault = () => {
    if (confirm('คุณต้องการรีเซตข้อมูลกลับไปเป็นรายชื่อเริ่มต้นใช่ไหม?')) {
      setStudents(createInitialStudents(DEFAULT_NAMES));
    }
  };

  const sortedStudents = [...students].sort((a, b) => b.score - a.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h2 className="text-2xl font-bold text-gray-800">
              🏆 Leaderboard นักเรียน ({students.length} คน)
            </h2>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 shadow-md"
              >
                <UserPlusIcon />
                เพิ่มนักเรียน
              </button>

              {/* ปุ่มทดสอบพลุ */}
              <button
                onClick={() => {
                  console.log("ทดสอบพลุขึ้นบน!");
                  fireConfetti(75); // ทดสอบด้วยคะแนน 75
                }}
                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 shadow-md"
              >
                🚀 ทดสอบพลุ
              </button>
              
              <button
                onClick={resetScores}
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 shadow-md"
              >
                รีเซตคะแนน
              </button>
              
              <button
                onClick={resetToDefault}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2 shadow-md"
              >
                <RotateCcwIcon />
                รีเซตทั้งหมด
              </button>
            </div>
          </div>

          {/* Add Student Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 className="text-lg font-bold mb-4">เพิ่มนักเรียนใหม่</h3>
                
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="ชื่อนักเรียน"
                  className="w-full px-3 py-2 border border-gray-300 rounded mb-4 focus:outline-none focus:border-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && addStudent()}
                  autoFocus
                />
                
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewStudentName('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={addStudent}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    disabled={!newStudentName.trim()}
                  >
                    เพิ่ม
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Student Grid */}
        {sortedStudents.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {sortedStudents.map((student, index) => (
              <div
                key={student.id}
                className={`bg-white rounded-lg p-3 flex flex-col items-center relative transition-all duration-300 border-2
                  ${
                    highlightedId === student.id
                      ? "scale-110 shadow-2xl z-10 ring-4 ring-yellow-400 border-yellow-300"
                      : "shadow-md hover:shadow-lg border-gray-200"
                  } hover:scale-105`}
              >
                {/* อันดับ */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-500 text-white' : 
                  index === 1 ? 'bg-gray-400 text-white' : 
                  index === 2 ? 'bg-orange-600 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {index + 1}
                </div>

                {/* ปุ่มลบ */}
                <button
                  onClick={() => removeStudent(student.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  title="ลบนักเรียน"
                >
                  <XIcon />
                </button>

                {/* คะแนน */}
                <div className={`text-4xl font-bold mb-2 ${
                  student.score === 100 ? 'text-yellow-500' : // สีทองสำหรับ 100
                  student.score >= 90 ? 'text-green-600' : 
                  student.score >= 70 ? 'text-blue-600' : 
                  student.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {student.score}
                  {student.score === 100 && <span className="text-2xl"> 🏆</span>}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      student.score === 100 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      student.score >= 90 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                      student.score >= 70 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      student.score >= 50 ? 'bg-gradient-to-r from-yellow-300 to-yellow-500' :
                      'bg-gradient-to-r from-red-300 to-red-500'
                    }`}
                    style={{ width: `${student.score}%` }}
                  ></div>
                </div>

                {/* Avatar */}
                <div className="text-4xl mb-2">{student.avatar}</div>

                {/* ชื่อ */}
                <div className="text-lg font-semibold mb-3 text-center break-words">
                  {student.name}
                </div>

                {/* ปุ่ม + / - */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleScore(student.id, -1)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 active:scale-95 transition-all"
                    disabled={student.score <= 0}
                  >
                    -1
                  </button>
                  <button
                    onClick={() => handleScore(student.id, 1)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 active:scale-95 transition-all"
                    disabled={student.score >= 100}
                  >
                    +1
                  </button>
                </div>

                {/* ปุ่มเพิ่มเร็ว */}
                <div className="flex gap-1 mt-2 opacity-75">
                  <button
                    onClick={() => handleScore(student.id, 5)}
                    className="bg-blue-400 text-white px-2 py-1 rounded text-xs hover:bg-blue-500 active:scale-95 transition-all"
                    disabled={student.score >= 100}
                  >
                    +5
                  </button>
                  <button
                    onClick={() => handleScore(student.id, 10)}
                    className="bg-purple-400 text-white px-2 py-1 rounded text-xs hover:bg-purple-500 active:scale-95 transition-all"
                    disabled={student.score >= 100}
                  >
                    +10
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              ยังไม่มีนักเรียนในระบบ
            </h3>
            <p className="text-gray-500 mb-6">
              เริ่มต้นโดยการเพิ่มนักเรียนคนแรกของคุณ
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <UserPlusIcon />
              เพิ่มนักเรียนคนแรก
            </button>
          </div>
        )}

        {/* คำแนะนำการใช้งาน */}
        <div className="mt-8 text-center text-gray-600">
          <p className="mb-2">🚀 เอฟเฟคพลุสีเหลืองวิ่งขึ้นบน:</p>
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span>🏆 100 คะแนน = พลุสีทองยิ่งใหญ่ 3 รอบ</span>
            <span>🥇 90+ = พลุสีเหลืองใหญ่ 2 รอบ</span>
            <span>🥈 70+ = พลุสีเหลืองกลาง</span>
            <span>🥉 50+ = พลุสีเหลืองปนส้ม</span>
            <span>🌈 30+ = พลุสีเหลืองอ่อน</span>
            <span>✨ 10+ = พลุสีเหลืองมินิ</span>
            <span>🎉 1+ = พลุสีเหลืองเล็กๆ</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">🌟 พลุจะวิ่งขึ้นจากด้านล่างครอบคลุมทั้งหน้าจอ</p>
        </div>
      </div>
    </div>
  );
}

export default App;
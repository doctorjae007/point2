import { useState, useEffect, useCallback } from 'react';
import { AVATARS, DEFAULT_NAMES, MAX_SCORE, STORAGE_KEY } from '../utils/constants';

// ฟังก์ชันสร้างนักเรียนเริ่มต้น
const createInitialStudents = (names) => {
  return names.map((name, index) => ({
    id: Date.now() + index,
    name,
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    score: 0,
    createdAt: new Date().toISOString()
  }));
};

// ฟังก์ชันสุ่ม avatar
const getRandomAvatar = () => {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
};

export const useStudentData = () => {
  const [students, setStudents] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // โหลดข้อมูลจาก localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // ตรวจสอบว่าข้อมูลมี structure ที่ถูกต้องหรือไม่
          const validStudents = parsed.filter(student => 
            student && 
            typeof student.id !== 'undefined' && 
            typeof student.name === 'string' && 
            typeof student.score === 'number'
          );
          
          if (validStudents.length > 0) {
            setStudents(validStudents);
          } else {
            setStudents(createInitialStudents(DEFAULT_NAMES));
          }
        } else {
          setStudents(createInitialStudents(DEFAULT_NAMES));
        }
      } else {
        setStudents(createInitialStudents(DEFAULT_NAMES));
      }
    } catch (err) {
      console.error("Error parsing saved scores:", err);
      setStudents(createInitialStudents(DEFAULT_NAMES));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // เซฟข้อมูลทุกครั้งที่เปลี่ยน
  useEffect(() => {
    if (students.length > 0 && !isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
      } catch (err) {
        console.error("Error saving student data:", err);
      }
    }
  }, [students, isLoading]);

  // เพิ่มนักเรียนใหม่
  const addStudent = useCallback((name) => {
    if (!name || typeof name !== 'string' || !name.trim()) {
      console.warn("Invalid student name provided");
      return false;
    }

    // ตรวจสอบว่าชื่อซ้ำหรือไม่
    const existingStudent = students.find(
      student => student.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingStudent) {
      console.warn("Student with this name already exists");
      return false;
    }

    const newStudent = {
      id: Date.now() + Math.random(), // เพิ่ม random เพื่อป้องกัน collision
      name: name.trim(),
      avatar: getRandomAvatar(),
      score: 0,
      createdAt: new Date().toISOString()
    };

    setStudents(prev => [...prev, newStudent]);
    return true;
  }, [students]);

  // ลบนักเรียน
  const removeStudent = useCallback((id) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  }, []);

  // อัพเดตคะแนน
  const updateScore = useCallback((id, delta) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              score: Math.max(0, Math.min(student.score + delta, MAX_SCORE)),
              lastUpdated: new Date().toISOString()
            }
          : student
      )
    );
    
    // Highlight effect
    setHighlightedId(id);
    const timeoutId = setTimeout(() => setHighlightedId(null), 2000);
    
    // คืนค่า cleanup function
    return () => clearTimeout(timeoutId);
  }, []);

  // รีเซตคะแนนทั้งหมด
  const resetScores = useCallback(() => {
    setStudents(prev => 
      prev.map(student => ({ 
        ...student, 
        score: 0,
        lastUpdated: new Date().toISOString()
      }))
    );
  }, []);

  // รีเซตกลับไปใช้ข้อมูลเริ่มต้น
  const resetToDefault = useCallback(() => {
    setStudents(createInitialStudents(DEFAULT_NAMES));
  }, []);

  // เปลี่ยน avatar ของนักเรียน
  const changeAvatar = useCallback((id) => {
    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              avatar: getRandomAvatar(),
              lastUpdated: new Date().toISOString()
            }
          : student
      )
    );
  }, []);

  // แก้ไขชื่อนักเรียน
  const editStudentName = useCallback((id, newName) => {
    if (!newName || typeof newName !== 'string' || !newName.trim()) {
      return false;
    }

    // ตรวจสอบว่าชื่อใหม่ซ้ำกับคนอื่นหรือไม่
    const existingStudent = students.find(
      student => student.id !== id && student.name.toLowerCase() === newName.trim().toLowerCase()
    );
    
    if (existingStudent) {
      return false;
    }

    setStudents(prev =>
      prev.map(student =>
        student.id === id
          ? {
              ...student,
              name: newName.trim(),
              lastUpdated: new Date().toISOString()
            }
          : student
      )
    );
    return true;
  }, [students]);

  // เรียงลำดับนักเรียนตามคะแนน
  const sortedStudents = [...students].sort((a, b) => {
    // เรียงตามคะแนนก่อน
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // ถ้าคะแนนเท่ากัน เรียงตามชื่อ
    return a.name.localeCompare(b.name, 'th');
  });

  // สถิติต่างๆ
  const stats = {
    totalStudents: students.length,
    averageScore: students.length > 0 
      ? Math.round((students.reduce((sum, s) => sum + s.score, 0) / students.length) * 100) / 100 
      : 0,
    highestScore: students.length > 0 ? Math.max(...students.map(s => s.score)) : 0,
    lowestScore: students.length > 0 ? Math.min(...students.map(s => s.score)) : 0,
    studentsWithMaxScore: students.filter(s => s.score === MAX_SCORE).length
  };

  return {
    // ข้อมูล
    students,
    sortedStudents,
    highlightedId,
    isLoading,
    stats,
    
    // ฟังก์ชัน
    addStudent,
    removeStudent,
    updateScore,
    resetScores,
    resetToDefault,
    changeAvatar,
    editStudentName
  };
};
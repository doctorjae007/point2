import React, { useState } from 'react';
import { X, Edit3, RotateCcw } from 'lucide-react';

const StudentCard = ({ 
  student, 
  highlighted, 
  rank,
  onScoreChange, 
  onRemove, 
  onEditName,
  onChangeAvatar 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(student.name);
  const [isHovered, setIsHovered] = useState(false);

  const handleEditSubmit = () => {
    if (editName.trim() && editName.trim() !== student.name) {
      const success = onEditName(student.id, editName.trim());
      if (success) {
        setIsEditing(false);
      } else {
        alert('ชื่อนี้มีอยู่แล้ว หรือชื่อไม่ถูกต้อง');
        setEditName(student.name); // รีเซตกลับไปเป็นชื่อเดิม
      }
    } else {
      setIsEditing(false);
      setEditName(student.name);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditName(student.name);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white'; // ทอง
      case 2: return 'bg-gray-400 text-white';   // เงิน
      case 3: return 'bg-orange-600 text-white'; // ทองแดง
      default: return 'bg-blue-500 text-white';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div
      className={`bg-white rounded-lg p-3 flex flex-col items-center relative transition-all duration-300 border-2
        ${
          highlighted
            ? "scale-110 shadow-2xl z-10 ring-4 ring-yellow-400 border-yellow-300"
            : "shadow-md hover:shadow-lg border-gray-200"
        } hover:scale-105 group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* อันดับ */}
      <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankBadgeColor(rank)}`}>
        {rank}
      </div>

      {/* ปุ่มควบคุมต่างๆ */}
      <div className={`absolute top-1 right-1 flex gap-1 transition-opacity duration-200 ${isHovered || isEditing ? 'opacity-100' : 'opacity-0'}`}>
        {/* ปุ่มเปลี่ยน Avatar */}
        <button
          onClick={() => onChangeAvatar(student.id)}
          className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-blue-600 transition-colors"
          title="เปลี่ยน Avatar"
        >
          <RotateCcw size={10} />
        </button>
        
        {/* ปุ่มแก้ไขชื่อ */}
        <button
          onClick={() => setIsEditing(true)}
          className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-green-600 transition-colors"
          title="แก้ไขชื่อ"
        >
          <Edit3 size={10} />
        </button>
        
        {/* ปุ่มลบ */}
        <button
          onClick={() => onRemove(student.id)}
          className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
          title="ลบนักเรียน"
        >
          <X size={10} />
        </button>
      </div>

      {/* คะแนน */}
      <div className={`text-5xl font-bold mb-3 ${getScoreColor(student.score)}`}>
        {student.score}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div 
          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${student.score}%` }}
        ></div>
      </div>

      {/* Avatar - คลิกเพื่อเปลี่ยน */}
      <button
        onClick={() => onChangeAvatar(student.id)}
        className="text-5xl mb-3 hover:scale-110 transition-transform cursor-pointer"
        title="คลิกเพื่อเปลี่ยน Avatar"
      >
        {student.avatar}
      </button>

      {/* ชื่อ */}
      <div className="text-center mb-3 min-h-[3rem] flex items-center justify-center w-full">
        {isEditing ? (
          <div className="w-full">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyPress}
              onBlur={handleEditSubmit}
              className="w-full text-lg font-semibold text-center border border-blue-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
              autoFocus
              maxLength={20}
            />
            <div className="flex gap-1 mt-1 justify-center">
              <button
                onClick={handleEditSubmit}
                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                ✓
              </button>
              <button
                onClick={handleEditCancel}
                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div
            className="text-lg font-semibold text-center break-words cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => setIsEditing(true)}
            title="คลิกเพื่อแก้ไขชื่อ"
          >
            {student.name}
          </div>
        )}
      </div>

      {/* ปุ่ม + / - */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={() => onScoreChange(student.id, -1)}
          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-red-600 transition-colors shadow-md hover:shadow-lg active:scale-95"
          disabled={student.score <= 0}
        >
          -1
        </button>
        
        <button
          onClick={() => onScoreChange(student.id, 1)}
          className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-md hover:shadow-lg active:scale-95"
          disabled={student.score >= 100}
        >
          +1
        </button>
      </div>

      {/* ปุ่มเพิ่ม/ลดแบบ bulk (แสดงเฉพาะตอน hover) */}
      {isHovered && (
        <div className="flex gap-2 mt-2 opacity-75">
          <button
            onClick={() => onScoreChange(student.id, -5)}
            className="bg-red-400 text-white px-2 py-1 rounded text-xs hover:bg-red-500 transition-colors"
            disabled={student.score <= 0}
          >
            -5
          </button>
          
          <button
            onClick={() => onScoreChange(student.id, 5)}
            className="bg-green-400 text-white px-2 py-1 rounded text-xs hover:bg-green-500 transition-colors"
            disabled={student.score >= 100}
          >
            +5
          </button>
          
          <button
            onClick={() => onScoreChange(student.id, 10)}
            className="bg-blue-400 text-white px-2 py-1 rounded text-xs hover:bg-blue-500 transition-colors"
            disabled={student.score >= 100}
          >
            +10
          </button>
        </div>
      )}

      {/* แสดงเวลาที่อัพเดตล่าสุด (ถ้ามี) */}
      {student.lastUpdated && isHovered && (
        <div className="text-xs text-gray-400 mt-2">
          อัพเดต: {new Date(student.lastUpdated).toLocaleTimeString('th-TH', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </div>
  );
};

export default StudentCard;
import React, { useState, useMemo } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import CreateTaskOverlay from '../../components/CreateTaskOverlay/CreateTaskOverlay';
import { useTasks } from '../../context/TaskContext';

import TasksIcon from '../../assets/icons/TasksIcon.svg';
import NetworkIcon from '../../assets/icons/NetworkIcon.svg';
import ProfileIcon from '../../assets/icons/ProfileIcon.svg';
import ActiveCalendarIcon from '../../assets/icons/ActiveCalendarIcon.svg';

// Компонент задачи для списка под календарем
const TaskItem = ({ task, onToggle }) => (
  <div className="task-card single-task">
    <label className="custom-checkbox">
      <input 
        type="checkbox" 
        checked={task.isCompleted} 
        onChange={() => onToggle(task.id, task.isCompleted)} 
      />
      <span className="checkmark"></span>
    </label>
    <span className="task-title">{task.text}</span>
    <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
  </div>
);

const HomePage = () => {
  const { tasks, toggleTask, loading } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [currentYear, currentMonth]);

  // ДЛЯ КАЛЕНДАРЯ: Группируем ВСЕ задачи (выполненные точки не исчезнут)
  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach(task => {
      if (task.dueDate) {
        if (!map.has(task.dueDate)) map.set(task.dueDate, []);
        map.get(task.dueDate).push(task);
      }
    });
    return map;
  }, [tasks]);

  // ДЛЯ СПИСКА ПОД КАЛЕНДАРЕМ: Только невыполненные задачи
  const activeTasksList = useMemo(() => {
    return tasks.filter(t => !t.isCompleted);
  }, [tasks]);

  if (loading) return <div className="home-page-container">Загрузка...</div>;

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  return (
    <div className="home-page-container">
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="nav-arrow" onClick={prevMonth}>◀</button>
          <h2>{['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'][currentMonth]} {currentYear}</h2>
          <button className="nav-arrow" onClick={nextMonth}>▶</button>
        </div>
        
        <div className="week-days">
          {['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'].map(day => <div key={day} className="day-name">{day}</div>)}
        </div>

        <div className="calendar-grid">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} className="date-cell hidden"></div>;

            const cellDate = new Date(currentYear, currentMonth, day);
            cellDate.setHours(0, 0, 0, 0);

            const isToday = cellDate.getTime() === todayDate.getTime();
            const isPast = cellDate.getTime() < todayDate.getTime();

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate.get(dateStr) || [];

            return (
              <div 
                key={day} 
                className={`date-cell ${isToday ? 'active' : ''} ${isPast ? 'past' : ''}`}
              >
                <div className="date-cell-dots">
                  {dayTasks.slice(0, 4).map(t => (
                    <div key={t.id} className="calendar-task-dot" style={{ backgroundColor: t.color }}></div>
                  ))}
                </div>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tasks-section">
        {activeTasksList.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#808080', marginTop: '20px' }}>Нет активных задач</div>
        ) : (
          activeTasksList.map(task => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}
      </div>

      <button className="fab-button" onClick={() => setIsCreateOpen(true)}>+</button>
      <CreateTaskOverlay isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/tasks')}><img src={TasksIcon} alt="Tasks" /></button>
        <button className="nav-item" onClick={() => {}}><img src={NetworkIcon} alt="Network" /></button>
        <button className="nav-item active" onClick={() => navigate('/')}><img src={ActiveCalendarIcon} alt="Calendar" /></button>
        <button className="nav-item" onClick={() => navigate('/profile')}><img src={ProfileIcon} alt="Profile" /></button>
      </div>
    </div>
  );
};

export default HomePage;
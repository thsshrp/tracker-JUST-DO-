import React, { useState, useMemo } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import CreateTaskOverlay from '../../components/CreateTaskOverlay/CreateTaskOverlay';
import { useTasks } from '../../context/TaskContext';

import TasksIcon from '../../assets/icons/TasksIcon.svg';
import CalendarIcon from '../../assets/icons/CalendarIcon.svg';
import NetworkIcon from '../../assets/icons/NetworkIcon.svg';
import ProfileIcon from '../../assets/icons/ProfileIcon.svg';
import ActiveTasksIcon from '../../assets/icons/ActiveTasksIcon.svg';
import ActiveNetworkIcon from '../../assets/icons/NetworkIcon.svg';
import ActiveCalendarIcon from '../../assets/icons/ActiveCalendarIcon.svg';
import ActiveProfileIcon from '../../assets/icons/ActiveProfileIcon.svg';

const Chevron = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}>
    <path d="M9 18L15 12L9 6" stroke="#808080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Компонент задачи с поддержкой toggle
const TaskItem = ({ task, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  if (!hasSubtasks) {
    return (
      <div className="task-card single-task">
        <label className="custom-checkbox">
          <input type="checkbox" checked={task.isCompleted} onChange={() => onToggle(task.id, task.isCompleted)} />
          <span className="checkmark"></span>
        </label>
        <span className="task-title" style={{ textDecoration: task.isCompleted ? 'line-through' : 'none' }}>{task.text}</span>
        <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
      </div>
    );
  }

  return (
    <div className="task-card task-group">
      <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" checked={task.isCompleted} onChange={() => onToggle(task.id, task.isCompleted)} />
            <span className="checkmark"></span>
          </label>
          <span className="group-title" style={{ textTransform: 'none', textDecoration: task.isCompleted ? 'line-through' : 'none' }}>{task.text}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
          <Chevron isOpen={isOpen} />
        </div>
      </div>
      {isOpen && (
        <div className="subtasks-list">
          {task.subtasks.map((sub, index) => (
            <div key={index} className="subtask-row">
              <label className="custom-checkbox">
                <input type="checkbox" />
                <span className="checkmark"></span>
              </label>
              <span className="task-title">{sub.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = () => {
  const { tasks, toggleTask, loading } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');

  // Состояние для отображаемого месяца
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

  // Генерация массива дней с пустыми ячейками
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    let startWeekday = firstDayOfMonth.getDay(); // 0 - воскресенье
    // Делаем понедельник первым днём
    let startOffset = startWeekday === 0 ? 6 : startWeekday - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysArray = [];
    for (let i = 0; i < startOffset; i++) daysArray.push(null);
    for (let d = 1; d <= daysInMonth; d++) daysArray.push(d);
    return daysArray;
  }, [currentYear, currentMonth]);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isPastDay = (year, month, day) => {
    const cellDate = new Date(year, month, day);
    cellDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    return cellDate < todayDate;
  };

  const isToday = (year, month, day) => {
    return year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
  };

  // Группировка задач по dueDate
  const tasksByDate = useMemo(() => {
    const map = new Map();
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate;
        if (!map.has(dateKey)) map.set(dateKey, []);
        map.get(dateKey).push(task);
      }
    });
    return map;
  }, [tasks]);

  const monthNames = ['ЯНВАРЬ', 'ФЕВРАЛЬ', 'МАРТ', 'АПРЕЛЬ', 'МАЙ', 'ИЮНЬ', 'ИЮЛЬ', 'АВГУСТ', 'СЕНТЯБРЬ', 'ОКТЯБРЬ', 'НОЯБРЬ', 'ДЕКАБРЬ'];
  const weekDays = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

  if (loading) return <div className="home-page-container">Загрузка задач...</div>;

  return (
    <div className="home-page-container">
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="nav-arrow" onClick={prevMonth}>◀</button>
          <h2>{monthNames[currentMonth]} {currentYear}</h2>
          <button className="nav-arrow" onClick={nextMonth}>▶</button>
        </div>
        <div className="week-days">
          {weekDays.map(day => <div key={day} className="day-name">{day}</div>)}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="date-cell hidden"></div>;
            }
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate.get(dateStr) || [];
            const past = isPastDay(currentYear, currentMonth, day);
            const active = isToday(currentYear, currentMonth, day);

            return (
              <div key={day} className={`date-cell ${past ? 'past' : ''} ${active ? 'active' : ''}`}>
                <div className="date-cell-dots">
                  {dayTasks.slice(0, 4).map(task => (
                    <div key={task.id} className="calendar-task-dot" style={{ backgroundColor: task.color }}></div>
                  ))}
                </div>
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tasks-section">
        {tasks.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#808080', marginTop: '20px' }}>
            Нет задач. Нажми +, чтобы создать первую!
          </div>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}
      </div>

      <button className="fab-button" onClick={() => setIsCreateOpen(true)}>+</button>
      <CreateTaskOverlay isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <div className="bottom-nav">
        <button className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => navigate('/tasks')}>
          <img src={activeTab === 'tasks' ? ActiveTasksIcon : TasksIcon} alt="Tasks" className="nav-icon tasks-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>
          <img src={activeTab === 'network' ? ActiveNetworkIcon : NetworkIcon} alt="Network" className="nav-icon network-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <img src={activeTab === 'calendar' ? ActiveCalendarIcon : CalendarIcon} alt="Calendar" className="nav-icon calendar-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigate('/profile')}>
          <img src={activeTab === 'profile' ? ActiveProfileIcon : ProfileIcon} alt="Profile" className="nav-icon profile-icon" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
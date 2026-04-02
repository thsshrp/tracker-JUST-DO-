import React, { useState } from 'react';
import './HomePage.css';
import { useNavigate } from 'react-router-dom';
import CreateTaskOverlay from './CreateTaskOverlay';
import { useTasks } from './TaskContext'; 

import TasksIcon from './Icon/TasksIcon.svg';
import CalendarIcon from './Icon/CalendarIcon.svg';
import NetworkIcon from './Icon/NetworkIcon.svg';
import ProfileIcon from './Icon/ProfileIcon.svg';
import ActiveTasksIcon from './Icon/ActiveTasksIcon.svg'; 
import ActiveNetworkIcon from './Icon/NetworkIcon.svg';
import ActiveCalendarIcon from './Icon/ActiveCalendarIcon.svg';
import ActiveProfileIcon from './Icon/ActiveProfileIcon.svg';

const Chevron = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}>
    <path d="M9 18L15 12L9 6" stroke="#808080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ТОТ ЖЕ УМНЫЙ КОМПОНЕНТ ДЛЯ ОТРИСОВКИ ЗАДАЧИ
const TaskItem = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  if (!hasSubtasks) {
    return (
      <div className="task-card single-task">
        <label className="custom-checkbox"><input type="checkbox" /><span className="checkmark"></span></label>
        <span className="task-title">{task.text}</span>
        <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
      </div>
    );
  }

  return (
    <div className="task-card task-group">
      <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}><input type="checkbox" /><span className="checkmark"></span></label>
          <span className="group-title" style={{ textTransform: 'none' }}>{task.text}</span>
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
              <label className="custom-checkbox"><input type="checkbox" /><span className="checkmark"></span></label>
              <span className="task-title">{sub.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const HomePage = () => {
  const { tasks } = useTasks(); 
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar'); 

  const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  const emptyCells = Array(6).fill(null);
  const dates = Array.from({ length: 30 }, (_, i) => i + 1);
  const currentDay = 1; 

  const displayTasks = tasks;

  return (
    <div className="home-page-container">
      
      <div className="calendar-section">
        <div className="calendar-header">
          <button className="nav-arrow">◀</button>
          <h2>МАРТ 2026</h2>
          <button className="nav-arrow">▶</button>
        </div>
        <div className="week-days">
          {days.map(day => <div key={day} className="day-name">{day}</div>)}
        </div>
        
        <div className="calendar-grid">
          {emptyCells.map((_, index) => <div key={`empty-${index}`} className="date-cell hidden"></div>)}
          {dates.map((date) => {
            const isPast = date < currentDay;
            const isActive = date === currentDay;
            const dayTasks = tasks.filter(t => t.date === date || (t.date === 'Сегодня' && date === currentDay) || (t.date === 'Завтра' && date === currentDay + 1));

            return (
              <div key={date} className={`date-cell ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}`}>
                <div className="date-cell-dots">
                  {dayTasks.map(task => (
                     <div key={task.id} className="calendar-task-dot" style={{ backgroundColor: task.color }}></div>
                  ))}
                </div>
                {date}
              </div>
            );
          })}
        </div>
      </div>

      <div className="tasks-section">
        {displayTasks.length === 0 ? (
           <div style={{ textAlign: 'center', color: '#808080', marginTop: '20px' }}>
             Нет задач. Нажми +, чтобы создать первую!
           </div>
        ) : (
          displayTasks.map(task => (
            <TaskItem key={task.id} task={task} />
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
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => setActiveTab('calendar')}>
          <img src={activeTab === 'calendar' ? ActiveCalendarIcon : CalendarIcon} alt="Calendar" className="nav-icon calendar-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <img src={activeTab === 'profile' ? ActiveProfileIcon : ProfileIcon} alt="Profile" className="nav-icon profile-icon" />
        </button>
      </div>
    </div>
  );
};

export default HomePage;
import React, { useState } from 'react';
import './TasksPage.css';
import { useNavigate } from 'react-router-dom';

// ИМПОРТИРУЕМ КОНТЕКСТ И ОКНО СОЗДАНИЯ (пути ведут в папку HomePage)
import { useTasks } from '../HomePage/TaskContext';
import CreateTaskOverlay from '../HomePage/CreateTaskOverlay';

import TasksIcon from '../HomePage/Icon/TasksIcon.svg'; 
import NetworkIcon from '../HomePage/Icon/NetworkIcon.svg';
import CalendarIcon from '../HomePage/Icon/CalendarIcon.svg'; 
import ProfileIcon from '../HomePage/Icon/ProfileIcon.svg';

import ActiveTasksIcon from '../HomePage/Icon/ActiveTasksIcon.svg'; 
import ActiveNetworkIcon from '../HomePage/Icon/NetworkIcon.svg'; 
import ActiveCalendarIcon from '../HomePage/Icon/ActiveCalendarIcon.svg';
import ActiveProfileIcon from '../HomePage/Icon/ActiveProfileIcon.svg';

// Компонент-стрелочка
const Chevron = ({ isOpen }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}
  >
    <path d="M9 18L15 12L9 6" stroke="#808080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// НОВЫЙ УМНЫЙ КОМПОНЕНТ ДЛЯ ОТРИСОВКИ ОДНОЙ ЗАДАЧИ
const TaskItem = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  // Если подзадач нет — рисуем как обычную одиночную задачу
  if (!hasSubtasks) {
    return (
      <div className="task-card single-task">
        <label className="custom-checkbox">
          <input type="checkbox" />
          <span className="checkmark"></span>
        </label>
        <span className="task-title">{task.text}</span>
        <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
      </div>
    );
  }

  // Если подзадачи есть — рисуем как группу со стрелочкой
  return (
    <div className="task-card task-group">
      <div className="group-header" onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <label className="custom-checkbox" onClick={(e) => e.stopPropagation()}>
            <input type="checkbox" />
            <span className="checkmark"></span>
          </label>
          <span className="group-title" style={{ textTransform: 'none' }}>{task.text}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="task-color-dot" style={{ backgroundColor: task.color }}></div>
          <Chevron isOpen={isOpen} />
        </div>
      </div>
      
      {/* Выпадающий список подзадач */}
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


const TasksPage = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks(); // БЕРЕМ ЗАДАЧИ ИЗ БАЗЫ
  const [isCreateOpen, setIsCreateOpen] = useState(false); // СОСТОЯНИЕ ДЛЯ ОКНА СОЗДАНИЯ
  const [activeTab, setActiveTab] = useState('tasks'); 

  return (
    <div className="tasks-page-container">
      <h1 className="page-main-title">Все задачи</h1>

      <div className="tasks-section">
        {tasks.length === 0 ? (
           <div style={{ textAlign: 'center', color: '#808080', marginTop: '20px' }}>
             Нет задач. Нажми +, чтобы создать первую!
           </div>
        ) : (
          tasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>

      {/* ПЛАВАЮЩАЯ КНОПКА СОЗДАНИЯ */}
      <button className="fab-button" onClick={() => setIsCreateOpen(true)}>+</button>
      
      {/* ОКНО СОЗДАНИЯ */}
      <CreateTaskOverlay isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      <div className="bottom-nav">
        <button className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <img src={activeTab === 'tasks' ? ActiveTasksIcon : TasksIcon} alt="Tasks" className="nav-icon tasks-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'network' ? 'active' : ''}`} onClick={() => setActiveTab('network')}>
          <img src={activeTab === 'network' ? ActiveNetworkIcon : NetworkIcon} alt="Network" className="nav-icon network-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => navigate('/')}>
          <img src={activeTab === 'calendar' ? ActiveCalendarIcon : CalendarIcon} alt="Calendar" className="nav-icon calendar-icon" />
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <img src={activeTab === 'profile' ? ActiveProfileIcon : ProfileIcon} alt="Profile" className="nav-icon profile-icon" />
        </button>
      </div>
      
    </div>
  );
};

export default TasksPage;
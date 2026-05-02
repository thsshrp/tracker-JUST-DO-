import React, { useState } from 'react';
import './TasksPage.css';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../../context/TaskContext';
import CreateTaskOverlay from '../../components/CreateTaskOverlay/CreateTaskOverlay';

import TasksIcon from '../../assets/icons/TasksIcon.svg';
import NetworkIcon from '../../assets/icons/NetworkIcon.svg';
import CalendarIcon from '../../assets/icons/CalendarIcon.svg';
import ProfileIcon from '../../assets/icons/ProfileIcon.svg';
import ActiveTasksIcon from '../../assets/icons/ActiveTasksIcon.svg';
import ActiveCalendarIcon from '../../assets/icons/ActiveCalendarIcon.svg';
import ActiveProfileIcon from '../../assets/icons/ActiveProfileIcon.svg';

const Chevron = ({ isOpen }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }}>
    <path d="M9 18L15 12L9 6" stroke="#808080" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TaskItem = ({ task, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  // Стили для выполненной задачи
  const taskStyle = {
    textDecoration: task.isCompleted ? 'line-through' : 'none',
    opacity: task.isCompleted ? 0.5 : 1,
    transition: 'all 0.3s ease'
  };

  if (!hasSubtasks) {
    return (
      <div className="task-card single-task">
        <label className="custom-checkbox">
          <input type="checkbox" checked={task.isCompleted} onChange={() => onToggle(task.id, task.isCompleted)} />
          <span className="checkmark"></span>
        </label>
        <span className="task-title" style={taskStyle}>{task.text}</span>
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
          <span className="group-title" style={taskStyle}>{task.text}</span>
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
                <input type="checkbox" checked={sub.isCompleted} readOnly />
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
  const { tasks, toggleTask, loading } = useTasks();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab] = useState('tasks');

  if (loading) return <div className="tasks-page-container">Загрузка задач...</div>;

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
            <TaskItem key={task.id} task={task} onToggle={toggleTask} />
          ))
        )}
      </div>
      <button className="fab-button" onClick={() => setIsCreateOpen(true)}>+</button>
      <CreateTaskOverlay isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <div className="bottom-nav">
        <button className="nav-item active" onClick={() => navigate('/tasks')}>
          <img src={ActiveTasksIcon} alt="Tasks" className="nav-icon tasks-icon" />
        </button>
        <button className="nav-item" onClick={() => navigate('/network')}>
          <img src={NetworkIcon} alt="Network" className="nav-icon network-icon" />
        </button>
        <button className="nav-item" onClick={() => navigate('/')}>
          <img src={CalendarIcon} alt="Calendar" className="nav-icon calendar-icon" />
        </button>
        <button className="nav-item" onClick={() => navigate('/profile')}>
          <img src={ProfileIcon} alt="Profile" className="nav-icon profile-icon" />
        </button>
      </div>
    </div>
  );
};

export default TasksPage;
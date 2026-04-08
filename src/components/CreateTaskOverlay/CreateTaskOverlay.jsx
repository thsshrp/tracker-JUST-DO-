import React, { useState, useEffect, useRef } from 'react';
import './CreateTaskOverlay.css';
import { useTasks } from '../../context/TaskContext';

import CalendarIcon from '../../assets/icons/CalendarIcon.svg';
import AddTaskIcon from '../../assets/icons/AddTask.svg';
import TagIcon from '../../assets/icons/Tag.svg';
import RepeatIcon from '../../assets/icons/Repeat.svg';
import CloseIcon from '../../assets/icons/Close.svg';

const CreateTaskOverlay = ({ isOpen, onClose }) => {
  const { addTask } = useTasks();

  const [taskText, setTaskText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [repeatSetting, setRepeatSetting] = useState('нет');
  const [selectedColor, setSelectedColor] = useState('#FFD700');
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const colors = ['#FFD700', '#489A78', '#D33833', '#2D73D6', '#B620E0', '#808080'];
  const inputRef = useRef(null);

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDueDate(today);
      setTaskText('');
      setSubtasks([]);
      setRepeatSetting('нет');
      setSelectedColor('#FFD700');
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && !isColorPickerOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isColorPickerOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => setSubtasks([...subtasks, { id: Date.now(), text: '', isCompleted: false }]);
  const handleRemoveSubtask = (id) => setSubtasks(subtasks.filter(st => st.id !== id));
  const handleSubtaskChange = (id, text) => setSubtasks(subtasks.map(st => st.id === id ? { ...st, text } : st));

  const handleSubmit = () => {
    if (!taskText.trim()) return;
    addTask({
      text: taskText,
      subtasks,
      dueDate: dueDate || null,
      color: selectedColor,
      repeatSetting,
      isCompleted: false,
    });
    onClose();
  };

  // Вспомогательные функции для даты
  const setToday = () => setDueDate(new Date().toISOString().split('T')[0]);
  const setTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
  };
  const clearDate = () => setDueDate('');

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className={`task-input-sheet ${subtasks.length > 0 ? 'expanded' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="main-task-input"
          placeholder="Введите задачу"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
        />

        {subtasks.map((subtask) => (
          <div key={subtask.id} className="subtask-input-row">
            <div className="subtask-checkbox" />
            <input
              type="text"
              className="subtask-input"
              placeholder="Введите подзадачу"
              value={subtask.text}
              onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)}
              autoFocus
            />
            <button className="remove-subtask-btn" onClick={() => handleRemoveSubtask(subtask.id)}>
              <img src={CloseIcon} alt="x" />
            </button>
          </div>
        ))}

        <div className="input-toolbar">
          <div className="toolbar-icons">
            {/* Кнопка выбора даты через нативный input */}
            <label style={{ cursor: 'pointer' }}>
              <img src={CalendarIcon} alt="Calendar" />
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{ display: 'none' }}
              />
            </label>

            {/* Палитра цветов */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>
                <img src={TagIcon} alt="Tag" />
              </button>
              {isColorPickerOpen && (
                <div className="color-palette">
                  {colors.map(c => (
                    <div
                      key={c}
                      className="color-swatch"
                      style={{ backgroundColor: c, border: selectedColor === c ? '2px solid white' : 'none' }}
                      onClick={() => { setSelectedColor(c); setIsColorPickerOpen(false); }}
                    />
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleAddSubtask}><img src={AddTaskIcon} alt="Add Subtask" /></button>
          </div>
          <button className="submit-task-btn" onClick={handleSubmit}>+</button>
        </div>

        {/* Быстрые кнопки даты */}
        <div className="quick-date-buttons" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button onClick={setToday} className="quick-date-btn">Сегодня</button>
          <button onClick={setTomorrow} className="quick-date-btn">Завтра</button>
          <button onClick={clearDate} className="quick-date-btn">Без даты</button>
        </div>
      </div>
    </>
  );
};

export default CreateTaskOverlay;
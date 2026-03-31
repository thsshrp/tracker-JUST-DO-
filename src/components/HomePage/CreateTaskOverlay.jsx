import React, { useState, useEffect, useRef } from 'react';
import './CreateTaskOverlay.css';
import { useTasks } from './TaskContext'; // ИМПОРТИРУЕМ НАШ ХУК

import CalendarIcon from './Icon/CalendarIcon.svg';
import AddTaskIcon from './Icon/AddTask.svg';
import TagIcon from './Icon/Tag.svg';
import RepeatIcon from './Icon/Repeat.svg';
import BellIcon from './Icon/Bell.svg';
import CloseIcon from './Icon/Close.svg';

const CreateTaskOverlay = ({ isOpen, onClose }) => {
  const { addTask } = useTasks(); // ДОСТАЕМ ФУНКЦИЮ ИЗ КОНТЕКСТА

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isRepeatOpen, setIsRepeatOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false); // Для палитры
  
  const [taskText, setTaskText] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState('Сегодня'); // По умолчанию сегодня
  const [repeatSetting, setRepeatSetting] = useState('нет');
  const [selectedColor, setSelectedColor] = useState('#FFD700'); // Желтый по умолчанию

  // Массив цветов для палитры
  const colors = ['#FFD700', '#489A78', '#D33833', '#2D73D6', '#B620E0', '#808080'];
  
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isCalendarOpen && !isRepeatOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isCalendarOpen, isRepeatOpen]);

  if (!isOpen) return null;

  const handleAddSubtask = () => setSubtasks([...subtasks, { id: Date.now(), text: '', isCompleted: false }]);
  const handleRemoveSubtask = (id) => setSubtasks(subtasks.filter(st => st.id !== id));
  const handleSubtaskChange = (id, text) => setSubtasks(subtasks.map(st => st.id === id ? { ...st, text } : st));

  // ОТПРАВКА ЗАДАЧИ
  const handleSubmit = () => {
    if (!taskText.trim()) return; // Не создаем пустую

    addTask({
      text: taskText,
      subtasks,
      date: selectedDate, // 'Без даты', 'Сегодня', 'Завтра' или число (например, 27)
      color: selectedColor,
      repeat: repeatSetting
    });

    onClose();
    // Сброс
    setTaskText(''); setSubtasks([]); setSelectedDate('Сегодня'); setRepeatSetting('нет'); setIsColorPickerOpen(false);
  };

  const renderMiniCalendar = () => {
    const days = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
    const dates = Array.from({ length: 30 }, (_, i) => i + 1);
    const emptyCells = Array(5).fill(null);

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-header">
          <button>◀</button>
          <span>НОЯБРЬ 2026</span>
          <button>▶</button>
        </div>
        <div className="mini-week-days">
          {days.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="mini-calendar-grid">
          {emptyCells.map((_, i) => <div key={`e-${i}`} />)}
          {dates.map(date => (
            <div 
              key={date} 
              className={`mini-date-cell ${selectedDate === date ? 'selected' : ''}`}
              onClick={() => setSelectedDate(date)} /* ВЫБОР ДАТЫ */
            >
              {date}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
              type="text" className="subtask-input" placeholder="Введите подзадачу"
              value={subtask.text} onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)} autoFocus
            />
            <button className="remove-subtask-btn" onClick={() => handleRemoveSubtask(subtask.id)}>
              <img src={CloseIcon} alt="x" />
            </button>
          </div>
        ))}

        <div className="input-toolbar">
          <div className="toolbar-icons">
            <button onClick={() => setIsCalendarOpen(true)}><img src={CalendarIcon} alt="Calendar" /></button>
            
            {/* КНОПКА ТЕГА ДЛЯ ОТКРЫТИЯ ПАЛИТРЫ */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}>
                <img src={TagIcon} alt="Tag" />
              </button>
              {isColorPickerOpen && (
                <div className="color-palette">
                  {colors.map(c => (
                    <div 
                      key={c} className="color-swatch" style={{ backgroundColor: c, border: selectedColor === c ? '2px solid white' : 'none' }}
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
      </div>

      {/* Модалки Календаря и Повторов остались теми же, только с рабочими кнопками дат */}
      {isCalendarOpen && (
        <div className="modal-overlay">
          <div className="calendar-modal-content">
            {renderMiniCalendar()}
            <div className="quick-dates-row">
              <button className={`quick-date-btn ${selectedDate === 'Без даты' ? 'active' : ''}`} onClick={() => setSelectedDate('Без даты')}>Без даты</button>
              <button className={`quick-date-btn ${selectedDate === 'Сегодня' ? 'active' : ''}`} onClick={() => setSelectedDate('Сегодня')}>Сегодня</button>
              <button className={`quick-date-btn ${selectedDate === 'Завтра' ? 'active' : ''}`} onClick={() => setSelectedDate('Завтра')}>Завтра</button>
            </div>
            <div className="settings-list">
              <button className="setting-row-btn" onClick={() => setIsRepeatOpen(true)}>
                <div className="setting-left">
                  <img src={RepeatIcon} alt="Repeat" className="setting-icon" /><span>Повторять</span>
                </div>
                <span className="setting-value">{repeatSetting}</span>
              </button>
              <button className="setting-row-btn">
                <div className="setting-left"><img src={BellIcon} alt="Bell" className="setting-icon" /><span>Напоминать</span></div>
                <span className="setting-value">нет</span>
              </button>
            </div>
            <div className="modal-footer">
              <button className="footer-btn-cancel" onClick={() => setIsCalendarOpen(false)}>ОТМЕНА</button>
              <button className="footer-btn-done" onClick={() => setIsCalendarOpen(false)}>ГОТОВО</button>
            </div>
          </div>
        </div>
      )}

      {isRepeatOpen && (
        <div className="modal-overlay nested-overlay">
          <div className="repeat-modal-content">
            <div className="repeat-header">
              <span>Установить как повторяющуюся задачу</span>
              <div className="toggle-switch active"><div className="toggle-knob"/></div>
            </div>
            <div className="repeat-options">
              <button className="quick-date-btn" onClick={() => { setRepeatSetting('Ежедневно'); setIsRepeatOpen(false); }}>Ежедневно</button>
              <button className="quick-date-btn" onClick={() => { setRepeatSetting('Еженедельно'); setIsRepeatOpen(false); }}>Еженедельно</button>
              <button className="quick-date-btn" onClick={() => { setRepeatSetting('Ежемесячно'); setIsRepeatOpen(false); }}>Ежемесячно</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateTaskOverlay;
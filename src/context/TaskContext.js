import React, { createContext, useState, useContext, useEffect } from 'react';

const TaskContext = createContext();
const API_URL = 'http://localhost:8000/api/tasks';

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Загрузка задач с сервера
  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Ошибка загрузки задач:', err);
        setLoading(false);
      });
  }, []);

  // Добавление задачи
  const addTask = async (newTask) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });
      const savedTask = await response.json();
      setTasks(prev => [savedTask, ...prev]);
    } catch (error) {
      console.error('Ошибка добавления задачи:', error);
    }
  };

  // Переключение выполнения задачи
  const toggleTask = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`${API_URL}/${taskId}/toggle`, {
        method: 'PUT',
      });
      const updated = await response.json();
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, isCompleted: updated.isCompleted } : task
        )
      );
    } catch (error) {
      console.error('Ошибка переключения задачи:', error);
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, loading, addTask, toggleTask }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
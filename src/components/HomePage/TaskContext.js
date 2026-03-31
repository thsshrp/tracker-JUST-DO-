import React, { createContext, useState, useContext } from 'react';

// Создаем контекст
const TaskContext = createContext();

// Провайдер, который оборачивает приложение
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Функция добавления новой задачи
  const addTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, { ...newTask, id: Date.now() }]);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask }}>
      {children}
    </TaskContext.Provider>
  );
};

// Хук для быстрого доступа к задачам
export const useTasks = () => useContext(TaskContext);
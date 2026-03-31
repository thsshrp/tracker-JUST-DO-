import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './components/HomePage/TaskContext';
import HomePage from './components/HomePage/HomePage';
import TasksPage from './components/TasksPage/TasksPage';

function App() {
  return (
    // ОБОРАЧИВАЕМ ВСЁ ПРИЛОЖЕНИЕ, чтобы задачи были доступны везде!
    <TaskProvider>
      <Router>
        <div className="container">
          <Routes>
            {/* Главная страница (Календарь) */}
            <Route path="/" element={<HomePage />} />
            
            {/* Страница только с задачами */}
            <Route path="/tasks" element={<TasksPage />} />
          </Routes>
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App;
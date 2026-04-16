import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import HomePage from './pages/HomePage/HomePage';
import TasksPage from './pages/TasksPage/TasksPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';

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
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </TaskProvider>
  );
}

export default App;
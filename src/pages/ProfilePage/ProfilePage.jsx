// ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import './ProfilePage.css';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import TasksIcon from '../../assets/icons/TasksIcon.svg';
import CalendarIcon from '../../assets/icons/CalendarIcon.svg';
import NetworkIcon from '../../assets/icons/NetworkIcon.svg';
import ActiveProfileIcon from '../../assets/icons/ActiveProfileIcon.svg';
import AvaSvg from '../../assets/icons/Ava.svg';
import RedactAvaSvg from '../../assets/icons/RedactAva.svg';

const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/profile')
      .then((response) => response.json())
      .then((data) => {
        if (!data.avatar) {
          data.avatar = AvaSvg;
        }
        setUserData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Ошибка при получении данных:', error);
        setIsLoading(false);
      });
  }, []);

  const handleEditAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка типа файла (опционально)
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверка размера (например, до 5 МБ)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер изображения не должен превышать 5 МБ');
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    setAvatarUploading(true);

    try {
      const response = await fetch('http://localhost:8000/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Ошибка загрузки аватара');
      }

      const result = await response.json();
      // Предполагается, что сервер возвращает новый URL аватара в поле `avatar`
      const newAvatarUrl = result.avatar || URL.createObjectURL(file);
      
      setUserData(prev => ({
        ...prev,
        avatar: newAvatarUrl
      }));
      
      alert('Аватар успешно обновлён');
    } catch (error) {
      console.error('Ошибка при загрузке аватара:', error);
      alert('Не удалось обновить аватар. Попробуйте позже.');
    } finally {
      setAvatarUploading(false);
      // Сброс значения input, чтобы можно было загрузить тот же файл повторно
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <div className="profile-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#489A78' }}>Загрузка профиля...</h2>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 style={{ color: '#D33833' }}>Ошибка подключения к серверу</h2>
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      {/* ХЕДЕР */}
      <div className="profile-header">
        <div className="avatar-container">
          <img src={userData.avatar} alt="Аватар" className="profile-avatar" />
          <button 
            className="edit-avatar-btn" 
            onClick={handleEditAvatarClick}
            disabled={avatarUploading}
            style={{ opacity: avatarUploading ? 0.6 : 1 }}
          >
            <img src={RedactAvaSvg} alt="Редактировать" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        <h1 className="profile-name">{userData.name}</h1>
      </div>

      {/* … остальная часть компонента без изменений … */}
      {/* РЯД СТАТИСТИКИ 1 */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">Всего задач<br/>выполнено</span>
          <span className="stat-value">{userData.stats.totalCompleted}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Просрочено задач</span>
          <span className="stat-value">{userData.stats.totalOverdue}</span>
        </div>
      </div>

      {/* ГРАФИК НЕДЕЛИ */}
      <div className="chart-section">
        <h2 className="section-title">Статистика недели</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userData.weekChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#5C5B66" tick={{fill: '#FFFFFF', fontSize: 10}} axisLine={{stroke: '#5C5B66'}} tickLine={false} />
              <YAxis stroke="#5C5B66" tick={{fill: '#FFFFFF', fontSize: 10}} axisLine={{stroke: '#5C5B66'}} tickLine={false} />
              <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
              <Line type="monotone" dataKey="tasks" stroke="#489A78" strokeWidth={2} dot={false} className="neon-line-green" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* РЯД СТАТИСТИКИ 2 */}
      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-label">В среднем задач в<br/>день</span>
          <span className="stat-value">{userData.stats.avgPerDay}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">В среднем задач в<br/>неделю</span>
          <span className="stat-value">{userData.stats.avgPerWeek}</span>
        </div>
      </div>

      {/* ГРАФИК МЕСЯЦА */}
      <div className="chart-section last-chart-section">
        <h2 className="section-title">Статистика месяца</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={userData.monthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#5C5B66" tick={{fill: '#FFFFFF', fontSize: 10}} axisLine={{stroke: '#5C5B66'}} tickLine={false} />
              <YAxis stroke="#5C5B66" tick={{fill: '#FFFFFF', fontSize: 10}} axisLine={{stroke: '#5C5B66'}} tickLine={false} />
              <Tooltip cursor={false} contentStyle={{ display: 'none' }} />
              <Line type="monotone" dataKey="tasks" stroke="#FF4B2B" strokeWidth={2} dot={false} className="neon-line-orange" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* НИЖНЯЯ НАВИГАЦИЯ */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={() => navigate('/tasks')}>
          <img src={TasksIcon} alt="Tasks" className="nav-icon tasks-icon" />
        </button>
        <button className="nav-item" onClick={() => navigate('/network')}>
          <img src={NetworkIcon} alt="Network" className="nav-icon network-icon" />
        </button>
        <button className="nav-item" onClick={() => navigate('/')}>
          <img src={CalendarIcon} alt="Calendar" className="nav-icon calendar-icon" />
        </button>
        <button className="nav-item active" onClick={() => navigate('/profile')}>
          <img src={ActiveProfileIcon} alt="Profile" className="nav-icon profile-icon" />
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
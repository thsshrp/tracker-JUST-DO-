import sys
import os
import sqlite3
import pytest
from datetime import date, timedelta
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../just-backend')))
import main

client = TestClient(main.app)

# Подменяем БД на тестовую в памяти
@pytest.fixture(autouse=True)
def setup_test_db():
    test_conn = sqlite3.connect(":memory:", check_same_thread=False)
    test_conn.row_factory = sqlite3.Row
    test_cursor = test_conn.cursor()

    # Инициализация таблиц
    test_cursor.execute('''
        CREATE TABLE tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            color TEXT,
            repeat_setting TEXT,
            due_date TEXT,  
            subtasks TEXT,  
            is_completed BOOLEAN DEFAULT 0
        )
    ''')
    test_cursor.execute('''
        CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            avatar TEXT
        )
    ''')
    test_cursor.execute("INSERT INTO users (name, avatar) VALUES (?, ?)", ("Тестовый Лид", ""))
    test_conn.commit()

    # Подмена
    old_conn, old_cursor = main.conn, main.cursor
    main.conn, main.cursor = test_conn, test_cursor

    yield test_cursor

    # Возврат к боевой БД после теста
    main.conn, main.cursor = old_conn, old_cursor
    test_conn.close()


def test_week_chart_generation():
    """Проверка: Алгоритм генерации графика всегда возвращает 7 дней"""
    response = client.get("/api/profile")
    week_chart = response.json()["weekChartData"]
    
    assert len(week_chart) == 7, "График должен состоять из 7 точек"
    for day in week_chart:
        assert "name" in day
        assert "tasks" in day
        assert isinstance(day["tasks"], int)

def test_overdue_tasks_sql(setup_test_db):
    """Проверка: SQL-запрос верно считает только просроченные задачи"""
    cursor = setup_test_db
    
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Имитируем разные состояния задач
    # 1. Просрочена (вчера, не выполнена) -> +1
    cursor.execute("INSERT INTO tasks (text, due_date, is_completed) VALUES ('T1', ?, 0)", (yesterday,))
    # 2. Выполнена вчера (не просрочена) -> 0
    cursor.execute("INSERT INTO tasks (text, due_date, is_completed) VALUES ('T2', ?, 1)", (yesterday,))
    # 3. На сегодня (еще не просрочена) -> 0
    cursor.execute("INSERT INTO tasks (text, due_date, is_completed) VALUES ('T3', ?, 0)", (today,))
    main.conn.commit()

    profile = client.get("/api/profile").json()
    
    # Ожидаем ровно 1 просроченную задачу
    assert profile["stats"]["totalOverdue"] == 1
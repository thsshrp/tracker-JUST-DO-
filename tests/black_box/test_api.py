import sys
import os
import pytest
from fastapi.testclient import TestClient


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../just-backend')))
import main

client = TestClient(main.app)

def test_create_and_get_task():
    """Проверка: Создание задачи и появление ее в общем списке"""
    
    
    payload = {
        "text": "Интеграционный тест",
        "color": "#489A78",
        "repeatSetting": "нет",
        "dueDate": "2026-05-20"
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 200, "Ошибка при создании задачи"
    
   
    response_get = client.get("/api/tasks")
    assert response_get.status_code == 200
    tasks = response_get.json()
    
    
    task_exists = any(t["text"] == "Интеграционный тест" for t in tasks)
    assert task_exists, "Созданная задача не найдена в GET /api/tasks"

def test_profile_stats_update():
    """Проверка: Смена статуса задачи влияет на статистику профиля"""
    
    
    initial_profile = client.get("/api/profile").json()
    initial_completed = initial_profile["stats"]["totalCompleted"]

   
    create_res = client.post("/api/tasks", json={"text": "Тест статистики", "color": "#000", "repeatSetting": "нет"})
    task_id = create_res.json()["id"]

    
    client.put(f"/api/tasks/{task_id}/toggle")

    # Проверяем, что счетчик увеличился ровно на 1
    updated_profile = client.get("/api/profile").json()
    assert updated_profile["stats"]["totalCompleted"] == initial_completed + 1
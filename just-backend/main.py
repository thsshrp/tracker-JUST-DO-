from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from datetime import date, datetime, timedelta

app = FastAPI()

# CORS для React (порт 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- База данных ---
conn = sqlite3.connect("tasks.db", check_same_thread=False)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

# Таблица задач
cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        color TEXT,
        repeat_setting TEXT,
        due_date TEXT,  
        subtasks TEXT,  
        is_completed BOOLEAN DEFAULT 0
    )
''')

# Таблица пользователя
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        avatar TEXT
    )
''')

# Если пользователей нет, создаем базового
cursor.execute("SELECT COUNT(*) FROM users")
if cursor.fetchone()[0] == 0:
    cursor.execute("INSERT INTO users (name, avatar) VALUES (?, ?)", ("Анонимный Лид", ""))

conn.commit()

# --- Pydantic модели ---
class Subtask(BaseModel):
    id: int
    text: str
    isCompleted: bool = False

class TaskCreate(BaseModel):
    text: str
    color: str
    repeatSetting: str
    dueDate: Optional[str] = None   # ISO date
    subtasks: List[Subtask] = []
    isCompleted: bool = False

class TaskUpdate(BaseModel):
    isCompleted: bool

class TaskResponse(BaseModel):
    id: int
    text: str
    color: str
    repeatSetting: str
    dueDate: Optional[str]
    subtasks: List[dict]
    isCompleted: bool

class UserUpdate(BaseModel):
    name: str

# --- Эндпоинты для задач ---
@app.get("/api/tasks", response_model=List[TaskResponse])
async def get_tasks():
    cursor.execute("SELECT * FROM tasks ORDER BY id DESC")
    rows = cursor.fetchall()
    tasks = []
    for row in rows:
        tasks.append({
            "id": row["id"],
            "text": row["text"],
            "color": row["color"],
            "repeatSetting": row["repeat_setting"],
            "dueDate": row["due_date"],
            "subtasks": json.loads(row["subtasks"]) if row["subtasks"] else [],
            "isCompleted": bool(row["is_completed"])
        })
    return tasks

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate):
    due_date = task.dueDate if task.dueDate else None
    subtasks_json = json.dumps([t.dict() for t in task.subtasks])
    cursor.execute(
        "INSERT INTO tasks (text, color, repeat_setting, due_date, subtasks, is_completed) VALUES (?, ?, ?, ?, ?, ?)",
        (task.text, task.color, task.repeatSetting, due_date, subtasks_json, task.isCompleted)
    )
    conn.commit()
    new_id = cursor.lastrowid
    return {
        "id": new_id,
        "text": task.text,
        "color": task.color,
        "repeatSetting": task.repeatSetting,
        "dueDate": task.dueDate,
        "subtasks": task.subtasks,
        "isCompleted": task.isCompleted
    }

@app.put("/api/tasks/{task_id}/toggle")
async def toggle_task(task_id: int):
    cursor.execute("SELECT is_completed FROM tasks WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
    new_status = not row["is_completed"]
    cursor.execute("UPDATE tasks SET is_completed = ? WHERE id = ?", (new_status, task_id))
    conn.commit()
    return {"id": task_id, "isCompleted": new_status}

@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: int):
    cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    conn.commit()
    return {"ok": True}

# --- Профиль (Динамический расчет статистики) ---
@app.get("/api/profile")
async def get_profile():
    # 1. Берем данные пользователя (ID 1)
    cursor.execute("SELECT name, avatar FROM users WHERE id = 1")
    user_row = cursor.fetchone()
    
    # 2. Считаем общую статистику из таблицы tasks
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE is_completed = 1")
    total_completed = cursor.fetchone()[0]
    
    today_str = date.today().isoformat()
    # Просроченные: не выполнены и дата меньше сегодняшней
    cursor.execute("SELECT COUNT(*) FROM tasks WHERE is_completed = 0 AND due_date < ?", (today_str,))
    total_overdue = cursor.fetchone()[0]
    
    # 3. Формируем график за последние 7 дней
    week_chart_data = []
    days_map = {0: 'пн', 1: 'вт', 2: 'ср', 3: 'чт', 4: 'пт', 5: 'сб', 6: 'вс'}
    
    for i in range(6, -1, -1):
        day_date = datetime.now() - timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        day_name = days_map[day_date.weekday()]
        
        # Считаем выполненные задачи за конкретный день
        cursor.execute("SELECT COUNT(*) FROM tasks WHERE is_completed = 1 AND due_date = ?", (day_str,))
        count = cursor.fetchone()[0]
        week_chart_data.append({"name": day_name, "tasks": count})

    # 4. Средние показатели (упрощенный расчет)
    avg_per_day = round(total_completed / 7, 1) if total_completed > 0 else 0
    avg_per_week = total_completed

    return {
        "name": user_row["name"],
        "avatar": user_row["avatar"] if user_row["avatar"] else "",
        "stats": {
            "totalCompleted": total_completed,
            "totalOverdue": total_overdue,
            "avgPerDay": avg_per_day,
            "avgPerWeek": avg_per_week,
        },
        "weekChartData": week_chart_data,
        "monthChartData": [
            {"name": "1", "tasks": 0}, {"name": "5", "tasks": 4},
            {"name": "10", "tasks": 5.5}, {"name": "15", "tasks": 6},
            {"name": "20", "tasks": 6.2}, {"name": "25", "tasks": 6.5},
            {"name": "30", "tasks": 8}
        ]
    }

@app.put("/api/profile/name")
async def update_user_name(user_data: UserUpdate):
    cursor.execute("UPDATE users SET name = ? WHERE id = 1", (user_data.name,))
    conn.commit()
    return {"ok": True, "newName": user_data.name}
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import json
from datetime import date

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

cursor.execute('''
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text TEXT NOT NULL,
        color TEXT,
        repeat_setting TEXT,
        due_date TEXT,  -- YYYY-MM-DD
        subtasks TEXT,  -- JSON
        is_completed BOOLEAN DEFAULT 0
    )
''')
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

# --- Профиль (оставляем как есть) ---
@app.get("/api/profile")
async def get_profile():
    return {
        "name": "Имя пользователя",
        "avatar": "",
        "stats": {
            "totalCompleted": 20,
            "totalOverdue": 23,
            "avgPerDay": 3,
            "avgPerWeek": 22,
        },
        "weekChartData": [
            {"name": "пн", "tasks": 0}, {"name": "вт", "tasks": 4},
            {"name": "ср", "tasks": 0}, {"name": "чт", "tasks": 6},
            {"name": "пт", "tasks": 5}, {"name": "сб", "tasks": 7},
            {"name": "вс", "tasks": 9}
        ],
        "monthChartData": [
            {"name": "1", "tasks": 0}, {"name": "5", "tasks": 4},
            {"name": "10", "tasks": 5.5}, {"name": "15", "tasks": 6},
            {"name": "20", "tasks": 6.2}, {"name": "25", "tasks": 6.5},
            {"name": "30", "tasks": 8}
        ]
    }
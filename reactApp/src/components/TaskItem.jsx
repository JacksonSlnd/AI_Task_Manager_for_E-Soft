import React from 'react';

export default function TaskItem({ task, onStatusChange, onEdit, onDelete, onDragStart }) {
  
    const todayStr = new Date().toISOString().split('T')[0];

    const isOverdue = task.date < todayStr && (task.status === 'new' || task.status === 'in_progress');

    return (
        <div
            className={`task-item status-${task.status}`}
            style={{ borderLeft: `5px solid ${task.color || '#4a90e2'}` }}
            draggable
            onDragStart={(e) => onDragStart(e, task.id)}
        >
            <div className="task-info">
                <h4>{task.title}</h4>
                {task.comment && <p>{task.comment}</p>}
                <span className="task-created-at">⏰ Создано в {task.createdAt || '--:--'}</span>
                
                {isOverdue && <p style={{ color: '#ff4d4d', fontWeight: 'bold', margin: '5px 0 0 0' }}>Просрочено</p>}
            </div>

            <div className="task-actions">
                <select
                    className="status-select"
                    value={task.status}
                    onChange={(e) => onStatusChange(task.id, { status: e.target.value })}
                >
                    <option value="new">Новая</option>
                    <option value="in_progress">В процессе</option>
                    <option value="done">Выполнено</option>
                </select>

                <button className="btn btn-secondary" onClick={() => onEdit(task)}>
                    Редактировать
                </button>
                <button className="btn btn-danger" onClick={() => onDelete(task.id)}>
                    Удалить
                </button>
            </div>
        </div>
    );
}
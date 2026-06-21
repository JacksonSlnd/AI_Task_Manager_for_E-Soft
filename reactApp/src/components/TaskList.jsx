import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({ selectedDateStr, tasks, todayStr, onStatusChange, onEdit, onDelete, onDragStart }) {
    if (!selectedDateStr) return null;

    const [year, month, day] = selectedDateStr.split('-');
    const dayTasks = tasks.filter((t) => t.date === selectedDateStr);

    return (
        <div id="tasks-section" className="tasks-section">
            <h3 id="tasks-date-title">Задачи на {`${day}.${month}.${year}`}</h3>
            <div id="tasks-list">
                {dayTasks.length === 0 ? (
                    <p style={{ color: '#6e7681', fontStyle: 'italic' }}>Задач на этот день нет.</p>
                    ) : (
                    dayTasks.map((task) => (
                        <TaskItem
                            key={task.id}
                            task={task}
                            todayStr={todayStr}
                            onStatusChange={onStatusChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onDragStart={onDragStart}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
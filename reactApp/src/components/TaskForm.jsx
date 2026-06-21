import React, { useState, useEffect } from 'react';

export default function TaskForm({ activeTask, selectedDateStr, todayStr, onSave, onCancel }) {
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [date, setDate] = useState('');
    const [color, setColor] = useState('#4a90e2');

    // Синхронизируем состояние формы при открытии на создание или редактирование
    useEffect(() => {
        if (activeTask) {
            setTitle(activeTask.title || '');
            setComment(activeTask.comment || '');
            setDate(activeTask.date || '');
            setColor(activeTask.color || '#4a90e2');
        } else {
            setTitle('');
            setComment('');
            setDate(selectedDateStr || todayStr);
            setColor('#4a90e2');
        }
    }, [activeTask, selectedDateStr, todayStr]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !date) return;
        onSave({
            id: activeTask?.id || null,
            title: title.trim(),
            comment: comment.trim(),
            date,
            color,
        });
    };

    const isCompleted = activeTask?.status === 'completed';

    return (
        <div id="form-section" className="form-section">
            <h3 id="form-title">{activeTask?.id ? 'Редактирование задачи' : 'Создание задачи'}</h3>
            <form id="task-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="field-title">Название задачи</label>
                    <input
                        type="text"
                        id="field-title"
                        className="form-control"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isCompleted}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="field-comment">Комментарий</label>
                    <textarea
                        id="field-comment"
                        className="form-control"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isCompleted}
                    />
                </div>

                <div className="inline-group form-group">
                    <div>
                        <label htmlFor="field-date">Дата</label>
                        <input
                            type="date"
                            id="field-date"
                            className="form-control"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isCompleted}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="field-color">Цвет маркера</label>
                        <input
                            type="color"
                            id="field-color"
                            className="form-control color-picker"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            disabled={isCompleted}
                        />
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="submit" id="btn-save" className="btn btn-success" disabled={isCompleted}>
                        Сохранить
                    </button>
                    <button type="button" id="btn-cancel" className="btn btn-secondary" onClick={onCancel}>
                        Отмена
                    </button>
                </div>
            </form>
        </div>
    );
}
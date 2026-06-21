import React, { useState } from 'react';

export default function CalendarGrid({ currentYear, currentMonth, selectedDateStr, tasks, todayStr, onDayClick, onTaskDrop }) {
    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];
    const dayHeaders = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    const [dragOverDate, setDragOverDate] = useState(null);

    const formatDateString = (year, month, day) => {
        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        return `${year}-${mm}-${dd}`;
    };

    // Расчет параметров сетки
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const emptyCells = Array.from({ length: startOffset });

    // Генерация дней месяца
    const daysCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Drag-and-drop обработчики ячеек
    const handleDragOver = (e) => e.preventDefault();

    const handleDragEnter = (dateStr) => {
        setDragOverDate(dateStr);
    };

    const handleDragLeave = () => {
        setDragOverDate(null);
    };

    const handleDrop = (e, dateStr) => {
            e.preventDefault();
            setDragOverDate(null);
            const taskId = e.dataTransfer.getData('text/plain');
        if (taskId) {
            onTaskDrop(taskId, dateStr);
        }
    };

    return (
        <div className="calendar-grid">
            {dayHeaders.map((day) => (
                <div key={day} className="calendar-day-header">{day}</div>
            ))}

            {emptyCells.map((_, idx) => (
                <div key={`empty-${idx}`} className="calendar-cell empty" />
            ))}

            {daysCells.map((day) => {
                const dateStr = formatDateString(currentYear, currentMonth, day);
                const dayTasks = tasks.filter((t) => t.date === dateStr);
                
                let cellClass = 'calendar-cell';
                if (dateStr === todayStr) cellClass += ' today';
                if (dateStr === selectedDateStr) cellClass += ' selected';
                if (dragOverDate === dateStr) cellClass += ' drag-over'; 

                const parts = dateStr.split('-');
                const titleTooltip = dayTasks.length > 0 ? `Задач на ${parts[2]}.${parts[1]}.${parts[0]}: ${dayTasks.length}` : '';

                return (
                    <div
                        key={dateStr}
                        className={cellClass}
                        style={{ backgroundColor: dragOverDate === dateStr ? '#e6f4ea' : '' }}
                        title={titleTooltip}
                        onClick={() => onDayClick(dateStr)}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter(dateStr)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, dateStr)}
                    >
                        <span className="cell-number">{day}</span>
                        <div className="task-dots-container">
                            {dayTasks.map((task) => (
                                <span
                                    key={task.id}
                                    className="task-dot"
                                    style={{ backgroundColor: task.color || '#4a90e2' }}
                                />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
import React, { useState, useEffect } from 'react';
import CalendarGrid from './CalendarGrid';
import TaskList from './TaskList';
import TaskForm from './TaskForm';


export default function CalendarApp() {
    const monthNames = [
        "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
        "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
    ];

    const [tasks, setTasks] = useState([]);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [selectedDateStr, setSelectedDateStr] = useState(null);



    const [isFormOpen, setIsFormOpen] = useState(false);
    const [activeTask, setActiveTask] = useState(null); 

    const getTodayDateString = () => {
        const today = new Date();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${today.getFullYear()}-${mm}-${dd}`;
    };

    const todayStr = getTodayDateString();

    // Загрузка данных при инициализации
    useEffect(() => {
        loadTasksFromDB();
    }, []);

    /* БЛОК СВЯЗИ С БАЗОЙ ДАННЫХ*/
    const API_URL = 'http://127.0.0.1:3542/api/tasks';

    const loadTasksFromDB = async () => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Ошибка сети при получении задач');
            
            const data = await response.json();
            
            // Маппим данные из БД под названия полей в React
            const formattedTasks = data.map(task => ({
                id: task.id.toString(),
                title: task.title,
                comment: task.description || '',
                status: task.status,
                date: task.task_date,
                color: task.color || '#4a90e2', 
                createdAt: task.created_at ? task.created_at.split(' ')[1].substring(0, 5) : '--:--'
            }));

            setTasks(formattedTasks);
        } catch (error) {
            console.error("Ошибка при загрузке задач из БД:", error);
        }
    };

    const apiCreateTask = async (newTaskData) => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newTaskData.title,
                    description: newTaskData.comment,
                    task_date: newTaskData.date,
                    color: newTaskData.color 
                })
            });

            if (!response.ok) throw new Error('Ошибка при создании задачи');
            const savedTask = await response.json();

            setTasks((prev) => [...prev, {
                id: savedTask.id.toString(),
                title: savedTask.title,
                comment: savedTask.description || '',
                status: savedTask.status,
                date: savedTask.task_date, 
                createdAt: savedTask.created_at ? savedTask.created_at.split(' ')[1].substring(0, 5) : '--:--',
                color: savedTask.color
            }]);
        } catch (error) {
            console.error("Ошибка при сохранении задачи в БД:", error);
        }
    };

    const apiUpdateTask = async (id, updatedFields) => {
        try {
            const bodyData = {};
            if (updatedFields.title !== undefined) bodyData.title = updatedFields.title;
            if (updatedFields.comment !== undefined) bodyData.description = updatedFields.comment;
            if (updatedFields.status !== undefined) bodyData.status = updatedFields.status;
            if (updatedFields.date !== undefined) bodyData.task_date = updatedFields.date;
            if (updatedFields.color !== undefined) bodyData.color = updatedFields.color;

            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData)
            });

            if (!response.ok) throw new Error('Ошибка при обновлении задачи');
            const updatedTask = await response.json();

            setTasks((prev) =>
                prev.map((t) => (t.id == id ? { 
                    ...t, 
                    title: updatedTask.title,
                    comment: updatedTask.description || '',
                    status: updatedTask.status,
                    date: updatedTask.task_date,
                    color: updatedTask.color || t.color
                } : t))
            );
        } catch (error) {
            console.error("Ошибка при обновлении задачи в БД:", error);
        }
    };

    const apiDeleteTask = async (id) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Ошибка при удалении задачи');

            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (error) {
            console.error("Ошибка при удалении задачи из БД:", error);
        }
    };

    /* обработчики интерфейса */
    const changeMonth = (direction) => {
        setCurrentMonth((prevMonth) => {
            let nextMonth = prevMonth + direction;
            if (nextMonth < 0) {
                setCurrentYear((y) => y - 1);
                return 11;
            } else if (nextMonth > 11) {
                setCurrentYear((y) => y + 1);
                return 0;
            }
            return nextMonth;
        });
    };

    const handleTodayClick = () => {
        const today = new Date();
        setCurrentYear(today.getFullYear());
        setCurrentMonth(today.getMonth());
        setSelectedDateStr(todayStr);
    };

    const handleSaveTask = async (formData) => {
        if (formData.id) {
            await apiUpdateTask(formData.id, {
                title: formData.title,
                comment: formData.comment,
                date: formData.date,
                color: formData.color,
            });
        } else {
            const newTaskData = {
                title: formData.title,
                comment: formData.comment,
                date: formData.date,
                color: formData.color,
            };
            await apiCreateTask(newTaskData);
        }
        setIsFormOpen(false);
        setActiveTask(null);
    };

    const handleDragStart = (e, taskId) => {
        e.dataTransfer.setData('text/plain', taskId);
    };

    //обновление данных при Drag-and-drop
    const handleTaskDrop = async (taskId, newDate) => {
        const task = tasks.find((t) => t.id == taskId);
        if (task && task.date !== newDate) {
            //Сначала обновляем в базе данных и в стейте
            await apiUpdateTask(taskId, { date: newDate });
            
            //Меняем выбранную дату на новую, чтобы карточка появилась в текущем просматриваемом дне
            setSelectedDateStr(newDate);
            
            //Открываем форму для редактирования перенесенной задачи с актуальными данными
            setActiveTask({ ...task, date: newDate });
            setIsFormOpen(true);
        }
    };

    return (
        <div className="container">
            <h1>Календарь задач</h1>

            <div className="actions-bar">
                <button
                    className="btn btn-primary"
                    onClick={() => {
                    setActiveTask(null);
                    setIsFormOpen(true);
                    }}
                >
                    Создать задачу
                </button>
                <button className="btn btn-secondary" onClick={handleTodayClick}>
                    Сегодня
                </button>
            </div>

            <div className="calendar-container">
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)}>&lt;</button>
                    <h2>{`${monthNames[currentMonth]} ${currentYear}`}</h2>
                    <button onClick={() => changeMonth(1)}>&gt;</button>
                </div>

                <CalendarGrid
                    currentYear={currentYear}
                    currentMonth={currentMonth}
                    selectedDateStr={selectedDateStr}
                    tasks={tasks}
                    todayStr={todayStr}
                    onDayClick={setSelectedDateStr}
                    onTaskDrop={handleTaskDrop}
                />
            </div>

            <TaskList
                selectedDateStr={selectedDateStr}
                tasks={tasks}
                todayStr={todayStr}
                onStatusChange={apiUpdateTask}
                onEdit={(task) => {
                    setActiveTask(task);
                    setIsFormOpen(true);
                }}
                onDelete={(id) => {
                    apiDeleteTask(id);
                    if (activeTask?.id === id) {
                    setIsFormOpen(false);
                    setActiveTask(null);
                    }
                }}
                onDragStart={handleDragStart}
            />

            {isFormOpen && (
                <TaskForm
                    activeTask={activeTask}
                    selectedDateStr={selectedDateStr}
                    todayStr={todayStr}
                    onSave={handleSaveTask}
                    onCancel={() => {
                    setIsFormOpen(false);
                    setActiveTask(null);
                    }}
                />
            )}
        </div>
    );
}
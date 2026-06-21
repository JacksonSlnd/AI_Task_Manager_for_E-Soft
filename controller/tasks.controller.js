const db=require('../db')

// Функция для форматирования даты 
function formatLocalDate(date) {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


// Функция для форматирования даты и времени в локальном формате
function formatLocalDateTime(date) {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

class TaskController{


    async creatTask(req,res){
        try{
            const {title, description,task_date,color }=req.body;

  
            if (!title || title.trim() === '') {
                return res.status(400).json({ 
                    error: 'Заголовок задачи не может быть пустым' 
                });
            }

            if (!task_date) {
                return res.status(400).json({ 
                    error: 'Дата выполнения задачи обязательна' 
                });
            }

            const newTask=await db.query('INSERT INTO tasks (title, description,task_date,color) VALUES ($1,$2,$3,$4) RETURNING *',[title,description,task_date,color || '#4a90e2']);

            //Изменил с res.status(201).json(newTask.rows[0]); на это,т.к при созадании задачи она перепрыгивала на день назад
            const savedTask = newTask.rows[0];
            res.status(201).json({
                id: savedTask.id,
                title: savedTask.title,
                description: savedTask.description,
                status: savedTask.status,
                color: savedTask.color,
                task_date: savedTask.task_date ? formatLocalDate(savedTask.task_date) : null,
                created_at: savedTask.created_at ? formatLocalDateTime(savedTask.created_at) : null
            });
            
        }

        catch (err){
            //Реализован вывод ошибки в консоль таким способ, т.к через console.error(err.message) вывод ломался из-за кодировки Windows
            console.error(err.stack); 
            res.status(500).json({ error: 'Ошибка сервера при получении задач' });
        }
    }

    async getTasks(req,res){
        try{
            const allTasks=await db.query('SELECT * FROM tasks ORDER BY created_at DESC');

            const formattedTasks = allTasks.rows.map(task => ({
                ...task,
                // Форматируем task_date в локальной дате
                task_date: task.task_date ? formatLocalDate(task.task_date) : null,
                // Форматируем created_at в локальном времени
                created_at: task.created_at ? formatLocalDateTime(task.created_at) : null
            }));
            
            res.json(formattedTasks);

        }
        catch(err){
            console.error(err.stack); 
            res.status(500).json({ error: 'Ошибка сервера при получении задач' });
        }

        
    }

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, description, status,task_date,color } = req.body;

            if (status) {
                const allowedStatuses = ['new', 'in_progress', 'done'];
                if (!allowedStatuses.includes(status)) {
                    return res.status(400).json({ error: 'Недопустимый статус задачи' });
                }
            }


            if (title !== undefined && title.trim() === '') {
                return res.status(400).json({ 
                    error: 'Заголовок задачи не может быть пустым' 
                });
            }


            if (task_date !== undefined && !task_date) {
                return res.status(400).json({ 
                    error: 'Дата выполнения задачи не может быть пустой' 
                });
            }



            const queryText = `
                UPDATE tasks 
                SET 
                    title = COALESCE($1, title), 
                    description = COALESCE($2, description), 
                    status = COALESCE($3, status),
                    task_date=COALESCE($4, task_date), 
                    color=COALESCE($5,color)
                WHERE id = $6 
                RETURNING *
            `;

            const values = [
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                status !== undefined ? status : null,
                task_date !== undefined ? task_date : null,
                color !== undefined ? color : null,
                id
            ];

            const updatedTask = await db.query(queryText, values);
            
            if (updatedTask.rows.length === 0) {
                return res.status(404).json({ error: 'Задача с таким id не найдена' });
            }

            //изменил сres.status(201).json(newTask.rows[0]); на это,т.к задача также при любом изменении перепрыгивала на день назад
            const resultTask = updatedTask.rows[0];
            res.json({
                id: resultTask.id,
                title: resultTask.title,
                description: resultTask.description,
                status: resultTask.status,
                color: resultTask.color,
                task_date: resultTask.task_date ? formatLocalDate(resultTask.task_date) : null,
                created_at: resultTask.created_at ? formatLocalDateTime(resultTask.created_at) : null
            });


        }
        catch (err) {
            console.error(err.stack); 
            res.status(500).json({ error: 'Ошибка сервера при получении задач' });
        }
    }
    
    async deleteTask(req,res){
        try{
            const{id}=req.params;

            const deletedTask= await db.query('DELETE FROM tasks WHERE id=$1 RETURNING*',[id]);

            if(deletedTask.rows.length===0){
                return res.status(404).json({error:'Задача с таким id не найдена'})
            }

            res.json({message:'Задача успешно удалена', task:deletedTask.rows[0]});
        }
        catch(err){
            console.error(err.stack); 
            res.status(500).json({ error: 'Ошибка сервера при получении задач' });
        }
    }
}

module.exports=new TaskController()
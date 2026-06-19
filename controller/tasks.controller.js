const db=require('../db')

class TaskController{
    async creatTask(req,res){
        try{
            const {title, description}=req.body;

  
            if (!title || title.trim() === '') {
                return res.status(400).json({ 
                    error: 'Заголовок задачи не может быть пустым' 
                });
            }



            const newTask=await db.query('INSERT INTO tasks (title, description) VALUES ($1,$2) RETURNING *',[title,description]);

            res.status(201).json(newTask.rows[0]);
            
        }

        catch (err){
            console.error(err.message);
            res.status(500).json({error:'Ошибка сервера при создании задачи'})
        }
    }

    async getTasks(req,res){
        try{
            const allTasks=await db.query('SELECT * FROM tasks ORDER BY created_at DESC');
            res.json(allTasks.rows);

        }
        catch(err){
            console.error(err.message);
            res.status(500).json({error:'Ошибка сервера при получении задач'})
        }
    }

    async updateTask(req, res) {
        try {
            const { id } = req.params;
            const { title, description, status } = req.body;

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


            const queryText = `
                UPDATE tasks 
                SET 
                    title = COALESCE($1, title), 
                    description = COALESCE($2, description), 
                    status = COALESCE($3, status) 
                WHERE id = $4 
                RETURNING *
            `;

            const values = [
                title !== undefined ? title : null,
                description !== undefined ? description : null,
                status !== undefined ? status : null,
                id
            ];

            const updatedTask = await db.query(queryText, values);
            
            if (updatedTask.rows.length === 0) {
                return res.status(404).json({ error: 'Задача с таким id не найдена' });
            }

            res.json(updatedTask.rows[0]);
        }
        catch (err) {
            console.error(err.message);
            res.status(500).json({ error: 'Ошибка сервера при обновлении задачи' });
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
            console.error(err.message);
            res.status(500).json({error:'Ошибка сервера при удалении задачи'});
        }
    }
}

module.exports=new TaskController()
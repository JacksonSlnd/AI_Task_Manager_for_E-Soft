const Router=require('express')
const router=new Router()
const taskController=require('../controller/tasks.controller')

router.post('/tasks', taskController.creatTask)
router.get('/tasks', taskController.getTasks)
router.put('/tasks/:id', taskController.updateTask)
router.delete('/tasks/:id',taskController.deleteTask)

module.exports=router
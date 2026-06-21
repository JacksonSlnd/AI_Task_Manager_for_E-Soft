require('dotenv').config()
const express=require('express')
const cors = require('cors');
const taskRouter=require('./routers/tasks.routers')
const app=express()

app.use(cors());
app.use(express.json());

app.set('port', process.env.PORT || 3452)

app.use('/api',taskRouter)

app.listen(app.get('port'), ()=>{
    console.log(`Web app available at http://127.0.0.1:${app.get('port')}`)
})
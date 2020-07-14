'use strict'

require('dotenv').config();
const express=require('express');
const pg=require('pg');
const methodOverride=require('method-override');
//___________________________
const PORT=process.env.PORT||3000;
const app=express();
const client= new pg.Client(process.env.DATABASE_URL)

//___________________________

app.use(express.static('./public'))
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
//___________________________

app.set('view engin','ejs')
//___________________________
app.get('/',getAll)
app.get('/tasks/:task_id',getone)
app.get('/add',renderform)
app.post('/add',addNewtask)
app.put('/update/:task_id',updateTask)
app.delete('/delete/:task_id',deleteTask)

//___________________________



function getAll(req,res){
    const SQL = 'SELECT * FROM yarb;';
    client
      .query(SQL)
      .then((results) => {
        res.render('index.ejs', { tasks: results.rows });
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
}


function getone(req,res){
  const SQL='SELECT * FROM yarb WHERE id=$1'
  const VALUES=[req.params.task_id]
  client.query(SQL,VALUES).then((results)=>{
res.render('pages/detali-view.ejs',{task:results.rows[0]})
  })
  .catch((err) => {
    errorHandler(err, req, res);
  });
}
function renderform(req,res){
  res.render('pages/add-view.ejs')
}
function addNewtask(req,res){
const {title,description,contact,status,category}=req.body
const SQL='INSERT INTO yarb(title,description,contact,status,category)VALUES($1,$2,$3,$4,$5);'
const VALUES=[title,description,contact,status,category]
client.query(SQL,VALUES).then((results)=>{
  res.redirect('/')
    })
    .catch((err) => {
      errorHandler(err, req, res);
    });
}

function updateTask(req,res){
  const {title,description,contact,status,category}=req.body
  const SQL ='UPDATE yarb SET title=$1,description=$2,contact=$3,status=$4,category=$5 WHERE id=$6;'
  const VALUES=[title,description,contact,status,category,req.params.task_id]
  client.query(SQL,VALUES).then((results)=>{
    res.redirect(`/tasks/${req.params.task_id}`)
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
}

function deleteTask(req,res){
  const SQL='DELETE FROM yarb WHERE id=$1;'
  const VALUES=[req.params.task_id]
  client.query(SQL,VALUES).then((results)=>{
    res.redirect('/')
      })
      .catch((err) => {
        errorHandler(err, req, res);
      });
}



//___________________________
function errorHandler(err,req,res){
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
}
function notFound(req,res){
    res.status(404).send('page not found')
}
//___________________________
client.connect().then(()=>{
    app.listen(PORT,()=>console.log('upppppp on ',PORT))
})
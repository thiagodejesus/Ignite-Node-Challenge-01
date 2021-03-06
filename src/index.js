const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers

  const user = users.find((user) => user.username === username)

  if(!user) {
    return response.status(404).json({error: 'Mensagem de erro'})
  }

  request.body.user = user
  return next()
}

app.post('/users', (request, response) => {
  const {name, username} = request.body

  const user = users.find((user) => user.username === username)
  if(user) {
    return response.status(400).json({error: 'Mensagem de erro'})
  }

  const newUser = {id: uuidv4(), name, username, todos: []}
  users.push(newUser)

  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request.body

  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline, user} = request.body

  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos.push(todo)
  
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {title, deadline, user} = request.body

  const todo = user.todos.find((todo) => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Error message'})
  }
  
  todo.title = title
  todo.deadline = deadline
  
  return response.json(todo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request.body

  const todo = user.todos.find((todo) => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Error message'})
  }
  
  todo.done = true
  
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {id} = request.params
  const {user} = request.body

  const todo = user.todos.find((todo) => todo.id === id)
  if(!todo) {
    return response.status(404).json({error: 'Error message'})
  }
  
  user.todos = user.todos.filter((todo) => todo.id !== id)
  
  return response.status(204).send()
});

module.exports = app;
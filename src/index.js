const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const findUserByUsername = users.find(user => user.username === username);

  if (!findUserByUsername) {
    return response.status(404).json({ error: 'User does not exist!' });
  }

  request.user = findUserByUsername;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const findUserByUsername = users.some(user => user.username === username);

  if (findUserByUsername) {
    return response.status(400).json({ error: 'User already exist!' });
  }

  const user = { 
    id: uuidv4(),
    name, 
    username, 
    todos: [],
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  user.todos.push(todo);

  users.splice(users.findIndex(
    findIndexUser => findIndexUser.id === user.id), 
    1, 
    user
  );

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;
  const { title, deadline } = request.body;

  const findTodoById = user.todos.find(todo => todo.id === id);

  if (!findTodoById) {
    return response.status(404).json({ error: `User does not todo for the User: ${user.name}!` });
  }

  findTodoById.title = title;
  findTodoById.deadline = deadline;

  user.todos.splice(user.todos.findIndex(
    todo => todo.id === id), 
    1, 
    findTodoById
  );

  users.splice(users.findIndex(
    findIndexUser => findIndexUser.id === user.id), 
    1, 
    user
  );

  return response.status(200).json(findTodoById);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTodoById = user.todos.find(todo => todo.id === id);

  if (!findTodoById) {
    return response.status(404).json({ error: `User does not todo for the User: ${user.name}!` });
  }

  findTodoById.done = true;

  user.todos.splice(user.todos.findIndex(todo => todo.id === id), 1, findTodoById);

  users.splice(users.findIndex(
    findIndexUser => findIndexUser.id === user.id), 
    1, 
    user
  );

  return response.status(201).json(findTodoById);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const findTodoById = user.todos.find(todo => todo.id === id);

  if (!findTodoById) {
    return response.status(404).json({ error: `User does not todo for the User: ${user.name}!` });
  }

  user.todos.splice(findTodoById);

  return response.status(204).send();
});

module.exports = app;
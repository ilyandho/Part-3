/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable func-names */
/* eslint-disable comma-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const cors = require('cors');
// importScripts;

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

// eslint-disable-next-line prefer-arrow-callback
morgan.token('body', function (req, res, param) {
  console.log(req.body);
  return JSON.stringify(req.body);
});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => console.log('Connected to the database'))
  .catch((err) =>
    console.log('An error occured while connecting to the database')
  );

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 3,
    unique: true,
    uniqueCaseInsensitive: true,
  },
  number: {
    type: String,
    minlength: 8,
  },
});
personSchema.plugin(uniqueValidator, {
  message: "Error, expected '{PATH}' to be unique.",
});

// Remove the _V field and _id
// Change the _id which is an object to id
personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model('Person', personSchema);

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

app.get('/info', (req, res, next) => {
  Person.find()
    .then((response) => {
      const date = new Date();
      const info = `<h4>Phone book has ${response.length} people</h4> <h4>${date}</h4>`;
      res.status(200).send(info);
    })
    .catch((err) => next(err));
});

app.get('/api/persons', (req, res, next) => {
  Person.find()
    .then((response) =>
      res.status(200).json(response.map((person) => person.toJSON()))
    )
    .catch((err) => next(err));
});

// eslint-disable-next-line consistent-return
app.post('/api/persons/', (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: 'name and number must be provided',
    });
  }

  const person = new Person({
    name,
    number,
  });

  person
    .save()
    .then((response) => res.status(201).json(response))
    .catch((err) => next(err));
});

app.get('/api/persons/:id', (req, res, next) => {
  Person.findById({ _id: req.params.id })
    .then((response) => res.status(200).json(response))
    .catch((err) => next(err));
});

app.put('/api/persons/:id', (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: 'content missing',
    });
  }

  const { name, number } = req.body;

  const person = {
    name,
    number,
  };

  Person.findOneAndUpdate({ _id: req.params.id }, person, {
    runValidators: true,
    context: 'query',
    new: true,
  })
    .then((updated) => {
      console.log('response', updated);
      res.json(updated);
    })
    .catch((err) => next(err));
});
app.delete('/api/persons/:id', (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((response) => res.status(204).end())
    .catch((err) => next(err));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: error.message });
  }

  next();
};

app.use(errorHandler);

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

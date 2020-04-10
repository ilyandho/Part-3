const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

app.use(cors());

const app = express();

app.use(express.json());
morgan.token("body", function (req, res, param) {
  console.log(req.body);
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendick",
    number: "39-23-6423122",
    id: 4,
  },
];

app.get("/info", (req, res) => {
  const date = new Date();
  const info = `<h4>Phone book has ${persons.length} people</h4> <h4>${date}</h4>`;
  res.status(200).send(info);
});

app.get("/api/persons", (req, res) => {
  res.status(200).json(persons);
});

app.post("/api/persons/", (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      error: "content missing",
    });
  }

  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "name and number must be provided",
    });
  }

  const exists = persons.find(
    (person) => person.name.toLowerCase() === name.trim().toLowerCase()
  );

  if (exists) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const person = {
    name,
    number,
    id: Math.floor(Math.random() * 10e10),
  };

  persons = persons.concat(person);

  res.status(201).json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const found = persons.find((person) => person.id === id);
  if (found) {
    res.status(200).json(found);
  } else {
    res.status(404).send("<p>person not found</p>");
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);

  persons = persons.filter((person) => person.id !== id);

  res.status(204).end({});
});

const PORT = process.env.PORT || 1000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

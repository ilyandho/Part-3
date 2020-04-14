const express = require("express");
const mongoose = require("mongoose");

const app = express();
const password = process.argv[2];

const MONGODB_URI = `mongodb+srv://fullstackopen:${password}@cluster0-byxk1.mongodb.net/fullstackopen?retryWrites=true&w=majority`;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((response) => console.log(`Connected to the database`))
  .catch((err) =>
    console.log(`An error occured while connecting to the database`)
  );

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

// Remove the _V field and _id
// Change the _id which is an object to id
personSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Person = mongoose.model("Person", personSchema);

if (process.argv[3] && process.argv[4]) {
  const name = process.argv[3];
  const number = process.argv[4];
  console.log(name, number);

  const person = new Person({
    name,
    number,
  });

  person.save().then((response) => {
    console.log(
      `added ${response.name} number ${response.number} to phonebook`
    );
    mongoose.connection.close();
  });
} else {
  console.log("phonebook:");
  Person.find().then((response) => {
    console.log(response.map((person) => person.toJSON()));
    mongoose.connection.close();
  });
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => console.log("App listening on port 3000!"));

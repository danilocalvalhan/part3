require("dotenv").config()
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person"); 
const app = express();

morgan.token("post_data", (request, response) => {
	const bodyString = JSON.stringify(request.body);
	return bodyString.length > 2 ? bodyString : "";
});
app.use(cors());
app.use(express.json());
app.use(express.static("build"));
app.use(
	morgan(function (tokens, req, res) {
		return [
			tokens.method(req, res),
			tokens.url(req, res),
			tokens.status(req, res),
			tokens.res(req, res, "content-length"),
			"-",
			tokens["response-time"](req, res),
			"ms",
			tokens.post_data(req, res),
		].join(" ");
	})
);

app.get("/info", (request, response) => {
	const currentDate = new Date();
	Person.estimatedDocumentCount({}).then(count => {
		response.send(`
			<p>Phonebook has info for ${count} people</p>
			<p>${currentDate}</p>
			`);
	});
});

app.get("/api/persons", (request, response) => {
	Person.find({}).then(people => {
		response.json(people);
	})
});

app.get("/api/persons/:id", (request, response) => {
	const id = request.params.id;
	Person.findById(id).then(person => {
		response.json(person)
	})
	.catch(err => response.status(404).end())
});

app.delete("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter((person) => person.id !== id);

	response.status(204).end();
});

app.post("/api/persons", (request, response) => {
	const newPerson = new Person({
		name: request.body.name,
		number: request.body.number,
	})
	if (newPerson.name == false || newPerson.number == false) {
		return response.status(400).json({
			error: "name or number is missing",
		});
	} else {
		newPerson.save().then(result => {
			return response.status(201).json(newPerson);
		})
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on PORT ${PORT}`);

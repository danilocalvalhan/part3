const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

let persons = [
	{
		id: 1,
		name: "Arto Hellas",
		number: "040-123456",
	},
	{
		id: 2,
		name: "Ada Lovelace",
		number: "39-44-5323523",
	},
	{
		id: 3,
		name: "Dan Abramov",
		number: "12-43-234345",
	},
	{
		id: 4,
		name: "Mary Poppendieck",
		number: "39-23-6423122",
	},
];

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
	response.send(`
		<p>Phonebook has info for ${persons.length} people</p>
		<p>${currentDate}</p>
		`);
});

app.get("/api/persons", (request, response) => {
	response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	const person = persons.find((person) => person.id === id);
	person ? response.json(person) : response.status(404).end();
});

app.delete("/api/persons/:id", (request, response) => {
	const id = Number(request.params.id);
	persons = persons.filter((person) => person.id !== id);

	response.status(204).end();
});

app.post("/api/persons", (request, response) => {
	const newPerson = request.body;
	if (newPerson.name == false || newPerson.number == false) {
		return response.status(400).json({
			error: "name or number is missing",
		});
	} else if (
		persons.find(
			(person) =>
				person.name.toLowerCase().trim() ===
				newPerson.name.toLowerCase().trim()
		)
	) {
		return response.status(409).json({
			error: "name must be unique",
		});
	} else {
		const randomId = Math.floor(Math.random() * 10 ** 9);
		persons = persons.concat({ ...newPerson, id: randomId });

		return response.status(201).json({ ...newPerson, id: randomId });
	}
});

const PORT = process.env.PORT || 3001;
app.listen(PORT);
console.log(`Server running on PORT ${PORT}`);

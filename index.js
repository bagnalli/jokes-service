const express = require("express");
const app = express();
const { Joke } = require("./db");
const { Op } = require("sequelize");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/jokes", async (req, res, next) => {
  try {
    const { tags, content } = req.query;
    const where = {};

    if (tags) where.tags = { [Op.substring]: tags };
    if (content) where.joke = { [Op.substring]: content };

    const jokes = await Joke.findAll({ where });

    res.send(jokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// GOAL: As a continuation of the jokes-service project, implement one or all of the following routes

// POST /jokes: Adds a joke to the database. Should accept both columns in the req.body

app.post("/jokes", async (req, res, next) => {
  try {
    const { joke, tags } = req.body;
    const newJoke = await Joke.create({ joke, tags });
    res.status(201).json(newJoke);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// For the DELETE and PUT routes, be sure to send back an error (by calling next) if no joke exists that matches the ID (i.e. if it was previously deleted, or if it was never added.
// DELETE /jokes/:id: Removes a joke from the database, by ID.

app.delete("/jokes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const bye = await Joke.findByPk(id);

    if (!bye) {
      return res.status(404).json({ message: "Joke not found" });
    }

    await bye.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /jokes/:id: Edits a joke by ID.  Should accept both/either columns in the req.body

app.put("/jokes/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { joke, tags } = req.body;

    const updatedJoke = await Joke.update(
      { joke, tags },
      {
        where: {
          id,
        },
      }
    );

    if (updatedJoke[0] === 0) {
      return res.status(404).json({ message: "Joke not found" });
    }

    const jokeObj = await Joke.findByPk(id);
    res.status(200).json(jokeObj);
  } catch (error) {
    next(error);
  }
});

// As an added challenge, try your hand at writing tests for the above routes! Use the preexisting tests as a guide.

// we export the app, not listening in here, so that we can run tests
module.exports = app;

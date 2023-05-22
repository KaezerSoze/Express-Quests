require("dotenv").config();
const express = require("express");
const port = process.env.APP_PORT ?? 5504;

const app = express();

app.use(express.json())


const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

const usersHandlers = require("./usersHandlers");

app.get("/api/users", usersHandlers.getUsers);
app.get("/api/users/:id", usersHandlers.getUserById);
app.post("/api/users", usersHandlers.postUser);

const moviesHandlers = require("./moviesHandlers");

app.get("/api/movies", moviesHandlers.getMovies);
app.get("/api/movies/:id", moviesHandlers.getMovieById);
app.post("/api/movies", moviesHandlers.postMovie);

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});



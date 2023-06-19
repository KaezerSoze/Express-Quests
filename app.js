require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const port = process.env.APP_PORT || 5504;

const app = express();

app.use(express.json());

const welcome = (req, res) => {
  res.send("Welcome to my favourite movie list");
};

app.get("/", welcome);

const usersHandlers = require("./usersHandlers");
const moviesHandlers = require("./moviesHandlers");
const { hashPassword, verifyToken, verifyPassword } = require("./auth");

// Routes publiques
app.post("/api/login", usersHandlers.getUserByEmailWithPasswordAndPassToNext,verifyPassword, generateToken);
app.get("/api/users", usersHandlers.getUsers);
app.post("/api/users", hashPassword, usersHandlers.postUser);

// Middleware de vérification du token
app.use((req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.sendStatus(403);
    }

    req.payload = decoded;
    next();
  });
});



// Routes protégées pour les utilisateurs
app.get("/api/users/:id", usersHandlers.getUserById);
app.put("/api/users/:id", verifyUserId, usersHandlers.updateUser);
app.delete("/api/users/:id", verifyUserId, usersHandlers.deleteUser);

// Routes protégées pour les films
app.get("/api/movies", moviesHandlers.getMovies);
app.get("/api/movies/:id", moviesHandlers.getMovieById);
app.post("/api/movies", verifyToken, moviesHandlers.postMovie);
app.put("/api/movies/:id", verifyToken, moviesHandlers.updateMovie);
app.delete("/api/movies/:id", verifyToken, moviesHandlers.deleteMovie);

function generateToken(req, res) {
  const payload = { sub: req.user.id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  delete req.user.hashedPassword;
  res.send({ token, user: req.user });
}

function verifyUserId(req, res, next) {
  const userId = req.params.id;

  if (userId !== req.payload.sub) {
    return res.sendStatus(403);
  }

  next();
}

app.listen(port, (err) => {
  if (err) {
    console.error("Something bad happened");
  } else {
    console.log(`Server is listening on ${port}`);
  }
});

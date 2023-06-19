// in usersHandlers.js

const database = require("./database");
const argon2 = require("argon2");

const postUser = async (req, res) => {
  try {
    const { firstname, lastname, email, city, language, password } = req.body;
    console.log(password);
    const hashedPassword = await argon2.hash(password);

    await database.query(
      "INSERT INTO users(firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving the user");
  }
};

const getUsers = async (req, res) => {
  try {
    const [users] = await database.query("SELECT id, firstname, lastname, email, city, language FROM users");

    const sanitizedUsers = users.map((user) => {
      const { hashedPassword, ...sanitizedUser } = user;
      return sanitizedUser;
    });

    res.json(sanitizedUsers);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data from database");
  }
};

const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [users] = await database.query(
      "SELECT id, firstname, lastname, email, city, language FROM users WHERE id = ?",
      [id]
    );

    if (users[0] != null) {
      const { hashedPassword, ...sanitizedUser } = users[0];
      res.json(sanitizedUser);
    } else {
      res.status(404).send("Not Found");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error retrieving data from database");
  }
};

const updateUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { firstname, lastname, email, city, language } = req.body;

    await database.query(
      "UPDATE users SET firstname = ?, lastname = ?, email = ?, city = ?, language = ? WHERE id = ?",
      [firstname, lastname, email, city, language, id]
    );

    const updatedRows = database.affectedRows;

    if (updatedRows === 0) {
      res.status(404).send("Not Found");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error editing the user");
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await database.query("DELETE FROM users WHERE id = ?", [id]);

    const deletedRows = database.affectedRows;

    if (deletedRows === 0) {
      res.status(404).send("Not Found");
    } else {
      res.sendStatus(204);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting the user");
  }
};

const getUserByEmailWithPasswordAndPassToNext = (req, res, next) => {
  const { email } = req.body;

  database
    .query("select * from users where email = ?", [email])
    .then(([users]) => {
      users[0] != null
        ? (req.user = users[0], next())
        : res.sendStatus(401);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error retrieving data from database");
    });
};


module.exports = {
  postUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserByEmailWithPasswordAndPassToNext,
};



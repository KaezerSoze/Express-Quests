const getUsers = (req, res) => {
  res.json(users);
  database
      .query("select * from users")
       .then(([users]) => {res.json(users);    })   
      .catch((err) => {      
        console.error(err);
     res.status(500).send("Error retrieving data from database");
   });
};

const getUsersById = (req, res) => {
  

  const id = parseInt(req.params.id);
  const getUsersById = (req, res) => {
    const id = parseInt(req.params.id);
  
    database
      .query("select * from users where id = ?", [id])
      .then(([users]) => {
        if (users[0] != null) {
          res.json(users[0]);
        } else {
          res.status(404).send("Not Found");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error retrieving data from database");
      });
  };

  const users = users.find((users) => users.id === id);

  if (users != null) {
    res.json(users);
  } else {
    res.status(404).send("Not Found");
  }
};

module.exports = {
  getUsers,
  getUsersById,
};

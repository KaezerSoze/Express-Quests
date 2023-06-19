const argon2 = require("argon2");

const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (req, res, next) => {
  console.log("coucou");
  argon2
    .hash(req.body.password, hashingOptions) // Hashage du mot de passe
    .then((hashedPassword) => {
      console.log(hashedPassword); // Affiche le mot de passe haché dans la console (à des fins de débogage)

      req.body.hashedPassword = hashedPassword; // Stocke le mot de passe haché dans la requête
      delete req.body.password; // Supprime le mot de passe en clair de la requête (pour des raisons de sécurité)

      next(); // Passe au middleware suivant
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); // En cas d'erreur, renvoie un statut 500 (Internal Server Error)
    });
};

const jwt = require("jsonwebtoken");

const verifyPassword = (req, res) => {
  argon2
    .verify(req.user.hashedPassword, req.body.password) // Vérifie si le mot de passe correspond au mot de passe haché stocké dans la base de données
    .then((isVerified) => {
      isVerified
        ? (function () {
            const payload = { sub: req.user.id };

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
              expiresIn: "1h",
            });

            delete req.user.hashedPassword; // Supprime le mot de passe haché de la réponse (pour des raisons de sécurité)
            res.send({ token, user: req.user }); // Envoie le token JWT et les informations de l'utilisateur dans la réponse
          })()
        : res.sendStatus(401); // En cas de mot de passe incorrect, renvoie un statut 401 (Unauthorized)
    })
    .catch((err) => {
      console.error(err);
      res.sendStatus(500); // En cas d'erreur, renvoie un statut 500 (Internal Server Error)
    });
};

// ...

const verifyToken = (req, res, next) => {
  try {
    const authorizationHeader = req.get("Authorization");

    if (authorizationHeader == null) {
      throw new Error("Authorization header is missing");
    }

    const [type, token] = authorizationHeader.split(" ");

    if (type !== "Bearer") {
      throw new Error("Authorization header has not the 'Bearer' type");
    }

    req.payload = jwt.verify(token, process.env.JWT_SECRET); // Vérifie et décode le token JWT

    next(); // Passe au middleware suivant
  } catch (err) {
    console.error(err);
    res.sendStatus(401); // En cas de token invalide, renvoie un statut 401 (Unauthorized)
  }
};

module.exports = {
  hashPassword,
  verifyPassword,
  verifyToken, 
};

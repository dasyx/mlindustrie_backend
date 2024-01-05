// Utilisation de l'algorithme bcrypt pour hasher le mot de passe des utilisateurs
const bcrypt = require("bcrypt");
let User = require("./model");
let mailer = require("../config/mailer");

// Middleware qui gère l'enregistrement d'un nouvel utilisateur dans la base de données
// Et lui envoie un mail de bienvenue

//  USER SIGNUP  //

exports.registerNewUser = (req, res, next) => {
  // On appelle la méthode hash de bcrypt qui sera la fonction de cryptage de mot de passe
  // On va lui passer le mdp du corps de la requête passé par le frontend
  // le "salt" correspond de fois on execute l'algorythme de hashage, soit 10 fois ici
  try {
    let addedUser;
    bcrypt.hash(req.body.password, 10).then((hash) => {
      const user = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        password: hash,
      });
      addedUser = user.save();
      if (addedUser) {
        mailer.welcomeMail(req.body.email, req.body.name);
      }
      res.status(201).json({
        msg: "Bienvenue chez Mlindustrie !",
        data: addedUser,
      });
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
};

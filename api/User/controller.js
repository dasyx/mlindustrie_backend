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

// USER LOGIN //
exports.loginUser = async (req, res) => {
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // Comparer les mots de passe
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            msg: "Authentification échouée",
          });
        }
        if (result) {
          return res.status(200).json({
            msg: "Authentification réussie",
            user: {
              email: user.email,
              // Vous pouvez ajouter plus de champs ici selon vos besoins
            },
          });
        }
        res.status(401).json({
          msg: "Authentification échouée",
        });
      });
    } else {
      res.status(404).json({ msg: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USER DISPLAY  //
exports.getOneUser = async (req, res) => {
  try {
    const userId = req.params.id; // L'ID de l'utilisateur est généralement passé dans l'URL
    const user = await User.findById(userId).select("-password"); // Exclure le mot de passe des données retournées
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USERS DISPLAY  //
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      data: users,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USER UPDATE  //
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let updatedUserData = req.body;

    // Si un nouveau mot de passe est fourni, le hasher avant de le sauvegarder
    if (updatedUserData.password) {
      updatedUserData.password = await bcrypt.hash(
        updatedUserData.password,
        10
      );
    }

    // Assurez-vous de valider et nettoyer les autres entrées ici

    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });

    res.status(200).json({
      msg: "Mise à jour réussie",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

// USER DELETE  //
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (deletedUser) {
      res.status(200).json({
        msg: "Utilisateur supprimé",
      });
    } else {
      res.status(404).json({ message: "Utilisateur non trouvé" });
    }
  } catch (err) {
    res.status(500).json({
      error: err,
    });
  }
};

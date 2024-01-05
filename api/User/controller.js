const bcrypt = require("bcrypt");
let User = require("./model");
let mailer = require("../config/mailer");
const jwt = require("jsonwebtoken");

exports.registerNewUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const confirmationToken = jwt.sign(
      { email: req.body.email },
      process.env.CONFIRM_TOKEN,
      { expiresIn: "1d" }
    );

    const user = new User({
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
      confirmationToken: confirmationToken,
      isConfirmed: false,
    });

    const addedUser = await user.save();
    if (addedUser) {
      const confirmationUrl = `http://localhost:3000/confirm/${confirmationToken}`;
      mailer.welcomeMail(user.email, user.name, confirmationUrl);
      res.status(201).json({
        message: "Please check your email to confirm your registration.",
        data: addedUser,
      });
    } else {
      res.status(400).json({ message: "Error adding user" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// USER CONFIRMATION

exports.confirmUser = async (req, res) => {
  try {
    // Retrieve token from URL parameters
    const token = req.params.token;

    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.CONFIRM_TOKEN);

    // Find the user with the decoded email and token
    const user = await User.findOne({
      email: decoded.email,
      confirmationToken: token,
    });

    if (user) {
      // Check if user is already confirmed
      if (user.isConfirmed) {
        return res.status(400).send("User already confirmed.");
      }

      // Update user's confirmation status
      user.isConfirmed = true;
      user.confirmationToken = ""; // Clear the confirmation token

      // Save the updated user
      await user.save();

      // Respond with a success message
      return res.status(200).send("User successfully confirmed.");
    } else {
      // Respond with a user not found error
      return res.status(404).send("User not found or token is invalid.");
    }
  } catch (error) {
    // Log the error and respond with 500 Internal Server Error
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// USER LOGIN //
exports.loginUser = async (req, res) => {
  try {
    // Trouver l'utilisateur par email
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      // Vérifier si l'utilisateur a confirmé son email
      if (!user.isConfirmed) {
        return res.status(401).json({
          msg: "Veuillez confirmer votre email avant de vous connecter.",
        });
      }

      // Comparer les mots de passe
      bcrypt.compare(req.body.password, user.password, async (err, result) => {
        if (err) {
          return res.status(401).json({
            msg: "Authentification échouée",
          });
        }
        if (result) {
          // L'utilisateur est authentifié, créer un token de session
          const token = jwt.sign(
            {
              email: user.email,
              userId: user._id,
            },
            process.env.SESSION_SECRET, // Clé secrète pour le token de session
            {
              expiresIn: "1h", // Expirer dans 1 heure par exemple
            }
          );

          return res.status(200).json({
            msg: "Authentification réussie",
            token: token, // Renvoyer le token au client
            user: {
              email: user.email,
              // Vous pouvez ajouter plus de champs ici selon vos besoins
            },
          });
        } else {
          res.status(401).json({
            msg: "Mot de passe incorrect",
          });
        }
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

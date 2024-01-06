const bcrypt = require("bcrypt");
let User = require("./model");
let mailer = require("../config/mailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// USER REGISTRATION

exports.registerNewUser = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
    });

    const addedUser = user.save();
    if (addedUser) {
      const verificationToken = user.generateVerificationToken();
      const confirmationUrl = `http://localhost:3000/confirm/${verificationToken}`;
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

// USER LOGIN
exports.loginUser = async (req, res) => {
  const { email, password } = req.body; // Ajouter password dans la destructuration
  // Vérifier que l'email et le mot de passe sont fournis
  if (!email || !password) {
    return res.status(422).send({
      message: "Missing email or password.",
    });
  }

  try {
    // Étape 1 - Vérifier qu'un utilisateur avec cet email existe
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not exist",
      });
    }

    // Étape 2 - Vérifier que le compte a été vérifié
    if (!user.verified) {
      return res.status(403).send({
        message: "Please verify your account.",
      });
    }

    // Étape 3 - Comparer le mot de passe fourni avec le mot de passe haché
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).send({
        message: "Password is incorrect", // ou utilisez un message plus général pour éviter de donner trop d'informations
      });
    }

    // Étape 4 - Si tout est bon, envoyer une réponse de succès
    return res.status(200).send({
      message: "User logged in successfully",
      // Vous pouvez également générer et envoyer un jeton de session ici si vous utilisez l'authentification basée sur les jetons
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send(err);
  }
};

// USER CONFIRMATION

exports.confirmUser = async (req, res) => {
  const { token } = req.params;
  // Check we have an id
  if (!token) {
    return res.status(422).send({
      message: "Missing Token",
    });
  }
  // Step 1 -  Verify the token from the URL
  let payload = null;
  try {
    payload = jwt.verify(token, process.env.SESSION_SECRET);
  } catch (err) {
    return res.status(500).send(err);
  }
  try {
    // Step 2 - Find user with matching ID
    const user = await User.findOne({ _id: payload.ID }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not  exists",
      });
    }
    // Step 3 - Update user verification status to true
    user.verified = true;
    await user.save();
    return res.status(200).send({
      message: "Account Verified",
    });
  } catch (err) {
    return res.status(500).send(err);
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

const bcrypt = require("bcrypt");
let User = require("./model");
let mailer = require("../config/mailer");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// USER REGISTRATION

// User registration
exports.signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await new User({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      //phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
    });

    const addedUser = user.save();
    const verificationToken = user.generateVerificationToken();
    const confirmationUrl = `http://localhost:8080/confirm/${verificationToken}`;
    console.log(`Generated confirmation URL: ${confirmationUrl}`); // Logging the URL

    if (addedUser) {
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

// User login
exports.login = async (req, res) => {
  const { email } = req.body;
  // Check we have an email
  if (!email) {
    return res.status(422).send({
      message: "Missing email.",
    });
  }
  try {
    // Verify a user with the email exists
    const user = await User.findOne({ email }).exec();
    if (!user) {
      return res.status(404).send({
        message: "User does not exist",
      });
    }
    // Ensure the account has been verified
    if (!user.verified) {
      return res.status(403).send({
        message: "Verify your Account.",
      });
    }
    // Create token
    const token = jwt.sign(
      { userId: user._id },
      process.env.SESSION_TOKEN, // Ensure you have a JWT_SECRET in your environment variables
      { expiresIn: "24h" } // Token expires in 24 hours
    );
    // Display token in the console
    console.log(token);
    // Send back token
    return res.status(200).send({
      message: "Utilisateur connecté",
      token,
      id: user._id,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};

// User confirmation
exports.confirm = async (req, res) => {
  // Log the parameters received to debug
  console.log("Received params:", req.params);
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
    payload = jwt.verify(token, process.env.CONFIRM_TOKEN);
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
      message: "Compte vérifié, vous pouvez maintenant vous connecter.",
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

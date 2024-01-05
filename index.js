const express = require("express");
// Importation du package morgan qui permettra l'utilisation de JS back/front
const morgan = require("morgan");
// Importation du package helmet pour sécuriser la requête http
const helmet = require("helmet");
const cors = require("cors");
const bodyParser = require("body-parser");
// Importation du package qui protège contre les injections SQL
const mongoSanitize = require("express-mongo-sanitize");
// Importation du package gérant la connexion par cookie
const cookieSession = require("cookie-session");
// Importation qui donne accès au système de fichiers
const path = require("path");

const app = express();

// Utilisation de variable d'environnement pour dissimuler les infos de connexion
require("dotenv").config();

app.use(morgan("dev"));
app.use(cors());
app.use(bodyParser.json());

// Sécurisation de la session et paramètrage du cookie de la session
app.use(
  cookieSession({
    name: "session",
    secret: process.env.COOKIE_SESS,
    cookie: {
      secure: true,
      httpOnly: true,
      domain: "http://localhost:3000/",
      maxAge: 60 * 60 * 1000, // 1 heure de validité
    },
  })
);

app.set("view engine", "handlebars");

// Afin de prévenir les attaques DDOS,
// On limitera le payload qu'un utilisateur pourra soumettre à l'API
app.use(express.json({ limit: "5kb" }));

app.use(helmet());

// Sanitization des données contre les attaques injections SQL
app.use(mongoSanitize());

// Ce middleware répondra aux requêtes envoyées à /images
app.use("/images", express.static(path.join(__dirname, "images")));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

// Récupération des informations de connexion à la db mongoose
require("./api/config/db")(app);

// Récupération des informations relatives aux routes du crud
require("../backend/api/routeHandler")(app);

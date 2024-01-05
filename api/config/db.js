const mongoose = require("mongoose");

function connectDatabase(app) {
  const dbConnectionUrl = process.env.DB_CONNECT;

  mongoose
    .connect(dbConnectionUrl)
    .then(() => {
      console.log("Base de données connectée !");
    })
    .catch((err) =>
      console.error("Erreur de connexion à la base de données", err)
    );

  mongoose.Promise = global.Promise;

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);

  if (app) {
    app.set("mongoose", mongoose);
  }
}

function cleanup() {
  mongoose.connection.close(() => {
    console.log(
      "Fermeture de la connexion à la base de données due à la terminaison de l'application"
    );
    process.exit(0);
  });
}

module.exports = connectDatabase;

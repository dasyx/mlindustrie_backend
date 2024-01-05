const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

let transporter = nodemailer.createTransport({
  service: "hotmail",
  //host: 'smtp-mail.outlook.com',
  //port: 587,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  }
});
const handlebarOptions = {
  viewEngine: {
    extName: ".handlebars",
    partialsDir: "./views/partials",
    layoutsDir: "./views/layouts",
    defaultLayout: "",
  },
  viewPath: "./views/templates",
  extName: ".handlebars",
};

exports.welcomeMail = (email, name) =>
  transporter.sendMail({
    from: "dasyx66@hotmail.fr",
    to: email,
    subject: "Création de compte MLindustrie",
    template: "bienvenue",
    context: {
      user: name,
    },
  });

transporter.use("compile", hbs(handlebarOptions));

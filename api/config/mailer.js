const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

// Configuring nodemailer transporter
let transporter = nodemailer.createTransport({
  service: "hotmail",
  host: "smtp-mail.outlook.com",
  port: 587,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true, // Change to true in production for better security
  },
});

// Configuring Handlebars options
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

// Applying Handlebars options to transporter
transporter.use("compile", hbs(handlebarOptions));

// Function to send welcome email
exports.welcomeMail = (email, name, confirmationUrl) => {
  console.log(`Sending confirmation URL: ${confirmationUrl}`); // Logging the URL
  // Sending email using nodemailer
  return transporter.sendMail({
    from: process.env.OUTLOOK_EMAIL, // Using environment variable for sender email
    to: email, // User's email
    subject: "Création de compte MLindustrie", // Email subject
    template: "bienvenue", // Handlebars template name
    context: {
      user: name, // Passing user name to the template
      confirmationUrl: confirmationUrl, // Passing confirmation URL to the template
    },
  });
};

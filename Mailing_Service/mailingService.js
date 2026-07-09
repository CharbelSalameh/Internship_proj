const XLSX = require('xlsx');
const contactsheet = XLSX.readFile('contactInfo.xlsx');
const sheetName = contactsheet.SheetNames[0];
const sheet = contactsheet.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

const nodemailer = require("nodemailer");
const senderMail="csalameh131@gmail.com";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: senderMail,
        pass: "ugmvfqxqpydqxlgv"
    }
});

data.forEach(function(row) {
  sendmail(row.Email,row.Name)});

function sendmail(receivermail,name){
const mailOptions = {
  from: senderMail,
  to: receivermail,
  subject: "Welcome to my App",
  text: `Hello ${name}, this email was sent to welcome you.`
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log("Email sent: " + info.response);
  }
});
}

const nodemailer = require("nodemailer");

async function main() {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "n23dccn043@student.ptithcm.edu.vn",
      pass: "2585840Nn",
    },
  });

  try {
    let info = await transporter.verify();
    console.log("Success");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();

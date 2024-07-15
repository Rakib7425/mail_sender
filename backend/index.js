const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/send-emails", upload.single("file"), async (req, res) => {
  const {
    emails: emailsStr,
    senderEmail,
    subject,
    password,
    content,
  } = req.body;
  let emails = JSON.parse(emailsStr);

  if (req.file) {
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    emails = emails.concat(sheet.map((row) => row.email));
    // Delete the uploaded file to clean up
    fs.unlinkSync(req.file.path);
  }

  if (emails.length === 0) {
    return res.status(400).send("No emails provided");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: senderEmail,
        pass: password,
      },
    });

    const mailOptions = {
      from: senderEmail,
      to: emails[0], // First email in the "To" field
      bcc: emails.slice(1), // All other emails in the "BCC" field
      subject: subject,
      text: content.replace(/<[^>]+>/g, ""), // Remove HTML tags for plain text version
      html: content, // HTML content
      headers: {
        "X-Entity-Ref-ID": "1234",
        "X-Priority": "3",
        "X-MSMail-Priority": "Normal",
        "X-Mailer": "NodeMailer",
        "Reply-To": senderEmail,
        "List-Unsubscribe": "<https://www.facebook.com/unsubscribe",
      },
    };

    await transporter.sendMail(mailOptions);

    res.status(200).send("Emails sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

// const express = require("express");
// const multer = require("multer");
// const XLSX = require("xlsx");
// const nodemailer = require("nodemailer");
// const cors = require("cors");
// const path = require("path");
// const app = express();

// app.use(cors());
// app.use(express.json());

// const upload = multer({ dest: "uploads/" });

// app.post("/send-emails", upload.single("file"), async (req, res) => {
//   const {
//     emails: emailsStr,
//     senderEmail,
//     subject,
//     password,
//     content,
//   } = req.body;
//   let emails = JSON.parse(emailsStr);

//   if (req.file) {
//     const workbook = XLSX.readFile(req.file.path);
//     const sheetName = workbook.SheetNames[0];
//     const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     emails = emails.concat(sheet.map((row) => row.email));
//   }

//   if (emails.length === 0) {
//     return res.status(400).send("No emails provided");
//   }

//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: senderEmail,
//         pass: password,
//       },
//     });

//     const mailOptions = {
//       from: senderEmail,
//       to: emails[0], // First email in the "To" field
//       bcc: emails.slice(1), // All other emails in the "BCC" field
//       subject: subject,
//       text: content,
//       html: `<p>${content}</p>
//              <p>If you no longer wish to receive these emails, please <a href="https://www.facebook.com/unsubscribe">unsubscribe here</a>.</p>`,
//       headers: {
//         "X-Entity-Ref-ID": "1234",
//         "X-Priority": "3",
//         "X-MSMail-Priority": "Normal",
//         "X-Mailer": "NodeMailer",
//         "Reply-To": senderEmail,
//         "List-Unsubscribe": "<https://www.facebook.com/unsubscribe>",
//       },
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).send("Emails sent successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("An error occurred");
//   }
// });

// app.listen(3001, () => {
//   console.log("Server is running on port 3001");
// });
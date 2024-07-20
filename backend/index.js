const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const nodemailer = require("nodemailer");
const { htmlToText } = require("html-to-text");
const cors = require("cors");
const fs = require("fs");
const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/send-emails", upload.single("file"), async (req, res) => {
  const {
    emails: emailsStr,
    senderEmail,
    senderName,
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
    fs.unlinkSync(req.file.path);
  }

  if (emails.length === 0) {
    return res.status(400).send("No emails provided");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      auth: {
        user: senderEmail,
        pass: password,
      },
    });

    const plainTextContent = htmlToText(content);

    // Split emails into batches
    const batchSize = 50; // Number of emails per batch, adjust as needed
    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);

      const mailOptions = {
        from: `"${senderName}" <${senderEmail}>`,
        to: senderEmail, // You can use your own email here or any default email
        bcc: batch,
        subject: subject,
        text: plainTextContent,
        html: content,
        headers: {
          "X-Entity-Ref-ID": "1234",
          "X-Priority": "3",
          "X-MSMail-Priority": "Normal",
          "X-Mailer": "NodeMailer",
          "Reply-To": senderEmail,
          "List-Unsubscribe": "<https://www.facebook.com/unsubscribe>",
        },
      };

      await transporter.sendMail(mailOptions);

      // Optional delay between batches to avoid spam filters
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay between batches
      }
    }

    res.status(200).send("Emails sent successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

app.listen(3001, () => {
  console.log("Server is running on port 3001");
});

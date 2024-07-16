import { useState } from "react";
import axios from "axios";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import "./assets/style.css";

function App() {
  const [emails, setEmails] = useState([]);
  const [file, setFile] = useState(null);
  const [senderEmail, setSenderEmail] = useState("abcd625432@gmail.com");
  const [subject, setSubject] = useState("Test Mail");
  const [password, setPassword] = useState("auwo rqbq aews wyaq");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("");
  const [isSendingMails, setIsSendingMails] = useState(true);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSendingMails(true);
    const formData = new FormData();
    formData.append("emails", JSON.stringify(emails));
    formData.append("senderEmail", senderEmail);
    formData.append("subject", subject);
    formData.append("password", password);
    formData.append("content", content);
    if (file) {
      formData.append("file", file);
    }

    try {
      if (emails.length < 1) {
        return setStatus("No email provided!");
      }

      setStatus("Sending emails...");
      const response = await axios.post(
        // "http://localhost:3001/send-emails",
        "https://mail-sender-7lhy.onrender.com/send-emails",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setStatus(response.data);
      setIsSendingMails(false);
    } catch (error) {
      console.error(error);
      setStatus("An error occurred check console for more info !!");
      setIsSendingMails(false);
    }
  };

  return (
    <div className="App">
      <h1>My Mailer</h1>
      <form onSubmit={handleSubmit} className="mailer-form">
        <div className="form-row">
          <label>
            Sender Email:
            <input
              type="email"
              placeholder="Sender Email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <label>
            Email Password:
            <input
              autoComplete="off"
              type="password"
              placeholder="Email Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Subject:
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Email Content:
          <textarea
            placeholder="Email Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </label>
        <div className="form-row">
          <label>
            Recipient Emails: To Email
            <ReactMultiEmail
              emails={emails}
              onChange={(_emails) => {
                setEmails(_emails);
              }}
              // placeholder="To Email"
              validateEmail={(email) => isEmail(email)}
              getLabel={(email, index, removeEmail) => {
                return (
                  <div data-tag key={index}>
                    {email}
                    <span
                      className="crossBtn"
                      data-tag-handle
                      onClick={() => removeEmail(index)}
                    >
                      X
                    </span>
                  </div>
                );
              }}
            />
          </label>
          <label>
            Attachment:
            <input
              type="file"
              onChange={handleFileChange}
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,text/comma-separated-values, text/csv, application/csv"
            />
          </label>
        </div>
        <div className="form-row">
          <button type="submit" className="send-button">
            {isSendingMails && <span className="loader"></span>} Send Emails
          </button>
        </div>
      </form>
      <p className="status-message">{status}</p>
      <a href="/sample_emails.xlsx" download className="download-link">
        Download Sample Excel File
      </a>
    </div>
  );
}

export default App;

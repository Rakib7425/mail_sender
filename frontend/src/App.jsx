import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import JoditEditor from "jodit-react";
import "./assets/style.css";

const initialMailValue = `
<table style="border-collapse:collapse;width: 100%;"><tbody>
<tr>
	<td style="width: 100%;">Hi,<br><br>I was going through your Website and personally, I see a lot of potential in your website and in your Business.<br> <br><br>With your permission, I would like to send you an audit report of your website with prices showing you a few things to greatly improve these search results for you.<br><br>These things are not difficult and my report will be very specific. It shows you exactly what needs to be done to move up the ranking dramatically. <br><br>We can rank your website on the 1st page of Google for your selected city or state.<br><br>May I send you a quote? If you are interested!<br><br>Thank you <br><br></td></tr></tbody></table>
`;

const App = () => {
  const [emails, setEmails] = useState([]);
  const [file, setFile] = useState(null);
  const [senderEmail, setSenderEmail] = useState("abcd625432@gmail.com");
  const [senderName, setSenderName] = useState("Your Name"); // Added senderName state
  const [subject, setSubject] = useState("Best SEO");
  const [password, setPassword] = useState("auwo rqbq aews wyaq");
  const [content, setContent] = useState(initialMailValue);

  const [status, setStatus] = useState("");
  const [isSendingMails, setIsSendingMails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const editor = useRef(null);

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem("mailerState"));
    if (savedState) {
      setEmails(savedState.emails || []);
      setSenderEmail(savedState.senderEmail || "abcd625432@gmail.com");
      setSenderName(savedState.senderName || "RsM"); // Added senderName state
      setSubject(savedState.subject || "Best SEO");
      setPassword(savedState.password || "auwo rqbq aews wyaq");
      setContent(savedState.content || initialMailValue);
      setFile(savedState.file || null);
    }
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSendingMails(true);
    const formData = new FormData();
    formData.append("emails", JSON.stringify(emails));
    formData.append("senderEmail", senderEmail);
    formData.append("senderName", senderName); // Added senderName to form data
    formData.append("subject", subject);
    formData.append("password", password);
    formData.append("content", content);

    if (file) {
      formData.append("file", file);
    }

    try {
      if (emails.length < 1) {
        setStatus("No email provided!");
        setIsSendingMails(false);
        return;
      }

      setStatus("Sending Emails...");
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

      // Save state to localStorage upon successful email sending
      const state = {
        emails,
        senderEmail,
        senderName, // Added senderName state
        subject,
        password,
        content,
        file,
      };
      localStorage.setItem("mailerState", JSON.stringify(state));

      setIsSendingMails(false);
    } catch (error) {
      console.error(error);
      setStatus("An error occurred, check console for more info!");
      setIsSendingMails(false);
    }
  };

  return (
    <div className="App">
      <h1>My Mailer</h1>
      <form onSubmit={handleSubmit} className="mailer-form">
        <div className="form-row">
          <label>
            Sender Name: *
            <input
              type="text"
              placeholder="Sender Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
          </label>
          <label>
            Sender Email: *
            <input
              type="email"
              placeholder="Sender Email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              required
              autoComplete="off"
            />
          </label>
          <label className="password-container">
            Email Password: *
            <input
              autoComplete="off"
              type={showPassword ? "text" : "password"}
              placeholder="Email Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="show-password-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </label>
          <label>
            Subject: *
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
          Email Content: *
          <JoditEditor
            ref={editor}
            value={content}
            config={{
              readonly: false,
              toolbarSticky: true,
              height: "350px",
              theme: "dark",
              editHTMLDocumentMode: true,
              defaultActionOnPaste: "insert_as_html",
            }}
            tabIndex={1}
            onBlur={(newContent) => setContent(newContent)}
          />
        </label>
        <div className="form-row">
          <label>
            Recipient Emails: *
            <ReactMultiEmail
              emails={emails}
              onChange={(_emails) => {
                setEmails(_emails);
              }}
              initialInputValue="leonesunny7425@gmail.com"
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
          <button
            type="submit"
            disabled={isSendingMails}
            className="send-button"
          >
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
};

export default App;

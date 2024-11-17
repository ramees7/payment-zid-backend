const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors"); // Import CORS
const nodemailer = require("nodemailer"); // Import Nodemailer

const app = express();
const port = 5000;

// Enable CORS for your frontend origin
app.use(
  cors({
    origin: "https://payment-zid.netlify.app", // Allow requests from your frontend (React app)
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);

// Middleware to parse JSON requests (for form data except file)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer setup to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // The folder where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({ storage: storage });

// POST route to handle the form submission
app.post("/send-receipt", upload.single("screenshot"), async (req, res) => {
  // Accessing form fields
  const { name, email, phone } = req.body;
  const screenshot = req.file; // The file is accessible via req.file

  // Check if screenshot was uploaded
  if (!req.file) {
    return res.json({
      success: false,
      message: "Please upload the payment screenshot.",
    });
  }

  // Set up Nodemailer transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "muhammedrameespkl@gmail.com", // Your email
      pass: "wqja nuah jzua sllb", // Use an app password for Gmail
    },
  });

  // Mail to owner (Receipt email)
  const mailToOwner = {
    from: email, // Customer's email
    to: "muhammedrameespkl@gmail.com", // Owner's email
    subject: "Payment Receipt with Screenshot",
    text: `Thank you ${name} for your payment. The receipt is as follows: \nAmount: ₹999`,
    html: `
      <h1>Payment Receipt</h1>
      <p>Thank you ${name} for purchasing. Your payment of ₹999 has been successfully received.</p>
      <p>Customer's Email: ${email}</p>
      <p>Phone Number: ${phone}</p>
      <p>Attached is the screenshot of the payment.</p>
    `,
    attachments: [
      {
        filename: req.file.originalname, // Filename for the uploaded screenshot
        path: path.join(__dirname, req.file.path), // Full path to the uploaded file
      },
    ],
  };

  try {
    // Send email to owner with the screenshot attached
    await transporter.sendMail(mailToOwner);

    // Handle successful file upload and email sending
    res.json({
      success: true,
      message: "Payment receipt sent to the owner, with screenshot attached.",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./db/db");
const appRoute = require("./routes/appRoute");

const app = express();
dotenv.config();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "https://bhilai-project-dddg.vercel.app",
  "https://bhilai-project.vercel.app",
  "http://localhost:7000", // for local dev
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));


// Middleware
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use("/api/v1", appRoute);
app.use(morgan("dev"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.get("/",(req,res)=>{
  res.send("hello");
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

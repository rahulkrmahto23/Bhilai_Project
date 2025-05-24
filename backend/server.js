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

const corsOptions = {
  origin: "https://bhilai-project-22yi-qcn0kkhbx-rahul-kumar-mahtos-projects.vercel.app",
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

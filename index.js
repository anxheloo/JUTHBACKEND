const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("db connected"))
  .catch((err) => console.log("not connected", err));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/api/", authRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => res.send("Juth App!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

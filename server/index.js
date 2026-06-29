import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js"
import questionroute from "./routes/question.js"
import answerroutes from "./routes/answer.js"
import postRoutes from "./routes/post.js";
const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      process.env.CLIENT_URL,
    ],
    credentials: true,
  })
);
app.get("/", (req, res) => {

  res.status(200).json({

    success: true,

    message:
      "YukithHub Backend is running successfully."

  });

});
app.use("/post", postRoutes);
app.use('/user', userroutes)
app.use('/question', questionroute)
app.use('/answer', answerroutes)
const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;
mongoose
  .connect(databaseurl)
  .then(() => {
    console.log(" Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
  });

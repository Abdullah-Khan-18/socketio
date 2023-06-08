const express = require("express");
const dotenv = require("dotenv");
const { chats } = require("./data/data");
const connectDB = require("./config/db");
const userRoutes = require("./router/userRoutes");
const chatRoutes = require("./router/chatRoutes");
const { notFound } = require("./middleware/errorMiddleware");
const { errorHandler } = require("./middleware/errorMiddleware");

const port = process.env.PORT || 5000;
dotenv.config();
connectDB();

const app = express();
app.use(express.json());

//! check server
app.get("/", (req, res) => {
  res.json("Server is running...");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);

//! Error Handling
app.use(notFound);
app.use(errorHandler);

//! allChatData
// app.get("/api/chat", (req, res) => {
//   res.send(chats);
// });

//! singleChatById
// app.get("/api/chat/:id", async (req, res) => {
//   try {
//     const singleChat = await chats.find((c) => c._id === req.params.id);
//     res.send(singleChat);
//     // console.log('singleData :>> ', singleChat)
//   } catch (error) {
//     console.log("singleChat error", error);
//   }
// });

app.listen(port, console.log(`server is running on ${port} PORT`.yellow.bold));

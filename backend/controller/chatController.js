const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//! ----------  accessChat   ----------- //
const accessChat = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      console.log("userId param not sent with request");
      res.sendStatus(400);
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      res.send(isChat);
    } else {
      var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
      };
    }

    try {
      const createChat = await Chat.create(chatData);
      const fullChat = await Chat.find({ _id: createChat._id }).populate(
        "users",
        "-password"
      );
      res.status(201).send(fullChat);
    } catch (error) {
      res.status(400);
      // throw new Error(error.message);
      console.log('error from createchat in chatController.js', error)
    }
  } catch (error) {
    console.log("error from accessChat in chatController.js", error);
  }
});

//! ----------  fetchChat   ----------- //
const fetchChat = asyncHandler(async (req, res) => {
  try {
    const fetchChatData = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const result = await User.populate(fetchChatData, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    res.status(201).send(result);
  } catch (error) {
    console.log("error from fetchChat in chatController.js", error);
  }
});

//! ----------  createGroupChat   ----------- //
const createGroupChat = asyncHandler(async (req, res) => {
  try {
    if (req.body.users || req.body.name) {
      return res.status(400).send("Please Fill all the fields");
    }

    var users = JSON.parse(req.body.users);

    if (users.lenght < 2) {
      return res
        .status(400)
        .send("More than 2 users required for a group chat");
    }

    users.push(req.user);

    try {
      const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
      });

      const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

      res.status(200).send(fullGroupChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  } catch (error) {
    console.log("error from createGroupChat in chatController.js", error);
  }
});

//! ----------  renameGroup   ----------- //
const renameGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, chatName } = req.body;
    const updateChatName = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updateChatName) {
      res.status(400);
      throw new Error("Chat Not Found");
    } else {
      res.status(201).json(updateChatName);
    }
  } catch (error) {
    console.log("error from renameGroup in chatController.js", error);
  }
});

//! ----------  removeFromGroup   ----------- //
const removeFromGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const remove = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!remove) {
      res.status(400);
      throw new Error("ChatId Not Found");
    } else {
      res.status(201).json(remove);
    }
  } catch (error) {
    console.log("error from removeFromGroup in chatController.js", error);
  }
});

//! ----------  addToGroup   ----------- //
const addToGroup = asyncHandler(async (req, res) => {
  try {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(400);
      throw new Error("ChatId Not Found");
    } else {
      res.status(201).json(added);
    }
  } catch (error) {
    console.log("error from addToGroup in chatController.js", error);
  }
});

module.exports = {
  accessChat,
  fetchChat,
  createGroupChat,
  renameGroup,
  removeFromGroup,
  addToGroup,
};

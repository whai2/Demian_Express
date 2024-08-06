import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

import { RagChat } from "../langchain/index.js";

import { getReceiverSocketId, io } from "../socket/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id; // 로그인 상태에서 존재함
    const { conversationId } = req.params; // params: "send/:id" routes에서
    const { message } = req.body;

    const conversation = await Conversation.findById(conversationId);

    const ragChat = new RagChat(conversation.fileUrl);

    const newMessage = new Message({
      senderId,
      message,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    const messageDto = {
      ...newMessage,
      fromMe: newMessage.senderId === senderId,
    };

    res.status(201).json(messageDto);

    const answer = await ragChat.ragAnswer(message);
    const socketId = getReceiverSocketId(senderId);

    if (socketId) {
      const ragMessage = new Message({
        senderId,
        message: answer.answer,
        chat: true,
      });

      if (ragMessage) {
        conversation.messages.push(ragMessage._id);
      }

      const messageDto = { ...ragMessage._doc, fromMe: false };

      await Promise.all([conversation.save(), ragMessage.save()]);
      console.log
      io.to(socketId).emit("newMessage", messageDto);
    }
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { conversationId } = req.params;
    const { page = 1 } = req.query;
    const pageSize = 15;

    const conversation = await Conversation.findById(conversationId).lean();
    // 메시지 배열을 최신 메시지부터
    const totalMessages = conversation.messages.length;
    const startIndex = Math.max(totalMessages - page * pageSize, 0);
    const endIndex = totalMessages - (page - 1) * pageSize;
    const messages = conversation.messages.slice(startIndex, endIndex);

    // const messageIds = conversation.messages; // messages 배열에서 Message _id 추출

    const messagesObject = await Message.aggregate([
      {
        $match: {
          _id: { $in: messages }, // messages 배열의 _id들과 매칭
        },
      },
      {
        $project: {
          // 필요한 필드를 포함하거나 제외할 수 있습니다. 예시:
          message: 1,
          sender: 1,
          createdAt: 1,
          fromMe: {
            $cond: {
              if: { $eq: ["$chat", true] },
              then: false,
              else: {
                $cond: {
                  if: { $eq: ["$senderId", senderId] },
                  then: true,
                  else: false,
                }
              }
            },
          },
        },
      },
    ]);

    const totalPages = Math.ceil(totalMessages / pageSize);
    res.status(200).json({ messages: messagesObject, totalPages, currentPage: Number(page) });
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

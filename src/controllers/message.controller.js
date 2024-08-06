import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

import { RagChat } from "../langchain/index.js";

export const sendMessage = async (req, res) => {
	try {
    const senderId = req.user._id; // 로그인 상태에서 존재함
    const { conversationId } = req.params; // params: "send/:id" routes에서
		const { message } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate("messages");

    const ragChat = new RagChat(conversation.fileUrl);

		const newMessage = new Message({
			senderId,
			message,
		});

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

		await Promise.all([conversation.save(), newMessage.save()]);

    const messageDto = {...newMessage, fromMe: newMessage.senderId === senderId}

		res.status(201).json(messageDto);

    ragChat.ragAnswer(message).then(answer => {
      console.log(answer);
      // 필요한 경우 응답을 저장하거나 추가적인 처리를 여기서 수행
    }).catch(error => {
      console.log("Error in ragChat response: ", error.message);
    });
    
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const senderId = req.user._id;
    const { conversationId } = req.params;

		const conversations = await Conversation.findOne({ _id: conversationId });

    const messageIds = conversations.messages; // messages 배열에서 Message _id 추출

    const messages = await Message.aggregate([
      {
        $match: {
          _id: { $in: messageIds } // messages 배열의 _id들과 매칭
        }
      },
      {
        $project: {
          // 필요한 필드를 포함하거나 제외할 수 있습니다. 예시:
          message: 1,
          sender: 1,
          createdAt: 1,
          fromMe: {
            $cond: { if: { $eq: ["$senderId", senderId] }, then: true, else: false }
          }
        }
      }
    ]);

		res.status(200).json({ messages : messages });
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

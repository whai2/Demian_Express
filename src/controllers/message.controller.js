import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

//storage
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3Client, aws_key } from "../storage/connectS3.js";

import { v4 as uuidv4 } from "uuid";

export const sendMessage = async (req, res) => {
	try {
    const senderId = req.user._id; // 로그인 상태에서 존재함
    const { conversationId } = req.params; // params: "send/:id" routes에서
		const { message } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
    }).populate("messages");

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

const getObjectUrl = (bucketName, region, objectKey) => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
};

export const sendFile = async (req, res) => {
	try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;

    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // 파일을 공개적으로 읽을 수 있도록 설정
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);

    const objectUrl = getObjectUrl(bucketName, aws_key.region, params.Key);

    res.json({ url: objectUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
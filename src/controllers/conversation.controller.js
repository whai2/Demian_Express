import Conversation from "../models/conversation.model.js";

//storage
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { bucketName, s3Client, aws_key } from "../storage/connectS3.js";

import { v4 as uuidv4 } from "uuid";
import path from "path";

export const getConversationList = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const conversation = await Conversation.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $lookup: {
          from: 'messages', 
          localField: 'messages', 
          foreignField: '_id', 
          as: 'messages'
        }
      }
    ]);

    console.log(conversation);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
  }
};

const getObjectUrl = (bucketName, region, objectKey) => {
  return `https://${bucketName}.s3.${region}.amazonaws.com/${objectKey}`;
};

export const makeNew = async (req, res) => {
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
    
    // const newConversation = new Conversation({
    //   userId: userId,
    //   fileUrl: objectUrl,
    //   title: fileName,
    // });

    // await newConversation.save();
    res.status(200).json({ url: objectUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
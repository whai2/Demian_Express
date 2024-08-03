import Message from "../models/message.model.js";

export const sendMessage = async (req, res) => {
	try {
		const { message } = req.body;
		const senderId = req.user._id; // 로그인 상태에서 존재함

		const newMessage = new Message({
			senderId,
			message,
		});

		if (newMessage) {
			conversation.messages.push(newMessage._id);
		}

		await newMessage.save();

		res.status(201).json(newMessage);
	} catch (error) {
		console.log("Error in sendMessage controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const senderId = req.user._id;

		const conversation = await Message.aggregate([
      {
        $match: {
          id: senderId
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

		res.status(200).json(conversation);
	} catch (error) {
		console.log("Error in getMessages controller: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};
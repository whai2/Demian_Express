import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
	{
		userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

		messages: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Message",
				default: [],
			},
		],

    title: {
      type: String,
    },

    fileUrl: {
      type: String,
      required: true
    }
	},
	{ timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
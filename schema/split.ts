import mongoose from "mongoose";

export const SplitSchema = {
	expense: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Expense",
		required: true,
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	pending: {
		type: Number,
		required: true,
	},
	completed: {
		type: Number,
		required: true,
	},
};

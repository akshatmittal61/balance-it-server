import mongoose from "mongoose";
import { EXPENSE_TYPE } from "../constants";

export const ExpenseSchema = {
	title: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	timestamp: {
		type: String,
		required: true,
	},
	group: {
		type: String,
		required: false,
	},
	tags: {
		type: [String],
		required: false,
		default: [],
	},
	type: {
		type: String,
		enum: Object.values(EXPENSE_TYPE),
		default: EXPENSE_TYPE.PAID,
	},
	method: {
		type: String,
		required: false,
	},
};

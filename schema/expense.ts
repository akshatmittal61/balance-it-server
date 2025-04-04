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
		type: Date,
	},
	description: {
		type: String,
	},
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Group",
		required: false,
	},
	tags: {
		type: [String],
		required: false,
		default: [],
	},
	icon: {
		type: String,
		required: false,
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

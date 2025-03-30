import mongoose from "mongoose";
import { fallbackAssets, USER_STATUS } from "../constants";

export const UserSchema = {
	name: {
		type: String,
	},
	email: {
		type: String,
		required: true,
		unique: true,
		index: {
			unique: true,
			sparse: true,
		},
	},
	phone: {
		type: String,
		index: {
			unique: true,
			sparse: true,
		},
	},
	avatar: {
		type: String,
		default: fallbackAssets.avatar,
	},
	status: {
		type: String,
		enum: Object.values(USER_STATUS),
		default: USER_STATUS.JOINED,
	},
	invitedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		sparse: true,
	},
};

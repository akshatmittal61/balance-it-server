import mongoose from "mongoose";
import { MEMBER_ROLE, MEMBER_STATUS } from "../constants";

export const MemberSchema = {
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	group: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Group",
		required: true,
	},
	role: {
		type: String,
		enum: Object.values(MEMBER_ROLE),
		default: MEMBER_ROLE.MEMBER,
	},
	status: {
		type: String,
		enum: Object.values(MEMBER_STATUS),
		default: MEMBER_STATUS.JOINED,
	},
};

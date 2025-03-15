import mongoose from "mongoose";

export const AuthMappingSchema = {
	identifier: {
		type: String,
		required: true,
	},
	providerName: {
		type: String,
		required: true,
	},
	providerId: {
		type: String,
		required: true,
	},
	misc: {
		type: String,
		default: "{}",
	},
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: false,
		default: null,
	},
};

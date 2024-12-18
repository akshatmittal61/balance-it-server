import mongoose from "mongoose";
import { fallbackAssets } from "../constants";

export const GroupSchema = {
	name: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		default: fallbackAssets.groupIcon,
	},
	banner: {
		type: String,
		default: fallbackAssets.banner,
	},
	type: {
		type: String,
		default: "Other",
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "User",
	},
};

import { HTTP } from "../constants";
import { ApiError } from "../errors";
import { UserService } from "../services";
import { ApiRequest, ApiResponse, UpdateUser } from "../types";
import {
	genericParse,
	getNonEmptyString,
	getString,
	safeParse,
} from "../utils";

export class UserController {
	public static async updateUserProfile(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const name = safeParse(getString, req.body.name);
		const avatar = safeParse(getString, req.body.avatar);
		const body: UpdateUser = {};
		if (name !== null) body["name"] = name;
		if (avatar !== null) body["avatar"] = avatar;
		if (Object.keys(body).length === 0) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Please provide at least one field to update"
			);
		}
		const user = await UserService.updateUserProfile(userId, body);
		res.status(HTTP.status.SUCCESS).json({
			message: HTTP.message.SUCCESS,
			data: user,
		});
	}
}

import { UserService } from "../services";
import { ApiRequest, ApiResponse, UpdateUser } from "../types";
import {
	ApiError,
	ApiSuccess,
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
			return ApiError(res).send(
				"Please provide at least one field to update"
			);
		}
		const user = await UserService.updateUserProfile(userId, body);
		return ApiSuccess(res).send(user);
	}
	public static async inviteUser(req: ApiRequest, res: ApiResponse) {
		const loggedInUserId = genericParse<string>(
			getNonEmptyString,
			req.user?.id
		);
		const invitee = genericParse<string>(getNonEmptyString, req.body.email);
		const invitedUser = await UserService.inviteUser(
			loggedInUserId,
			invitee
		);
		return ApiSuccess(res).send(invitedUser);
	}

	public static async searchForUsers(req: ApiRequest, res: ApiResponse) {
		const query = genericParse(getNonEmptyString, req.body.query);
		const users = await UserService.searchByEmail(query);
		return ApiSuccess(res).send(users);
	}
}

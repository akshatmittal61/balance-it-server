import { OAuthService } from "../services";
import { ApiRequest, ApiResponse } from "../types";
import {
	ApiError,
	ApiSuccess,
	genericParse,
	getNonEmptyString,
} from "../utils";

export class AuthController {
	public static async verifyOAuthSignIn(req: ApiRequest, res: ApiResponse) {
		const code = genericParse(getNonEmptyString, req.body.code);
		const oauthValidatorToken = await OAuthService.verifyOAuthSignIn(code);
		return ApiSuccess(res).send(oauthValidatorToken);
	}
	public static async continueOAuthWithGoogle(
		req: ApiRequest,
		res: ApiResponse
	) {
		const validatorToken = genericParse(getNonEmptyString, req.body.token);
		const { user, accessToken, refreshToken } =
			await OAuthService.continueOAuthWithGoogle(validatorToken);
		res.setHeader("x-auth-access-token", accessToken);
		res.setHeader("x-auth-refresh-token", refreshToken);
		return ApiSuccess(res).send(user);
	}
	public static async verifyLoggedInUser(req: ApiRequest, res: ApiResponse) {
		const user = req.user;
		if (!user) {
			return ApiError(res).send("Please login to continue");
		}
		return ApiSuccess(res).send(user);
	}
	public static async logout(_: ApiRequest, res: ApiResponse) {
		res.clearCookie("token");
		return ApiSuccess(res).send();
	}
}

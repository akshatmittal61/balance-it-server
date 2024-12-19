import { HTTP } from "../constants";
import { ApiError } from "../errors";
import { AuthService } from "../services";
import { ApiRequest, ApiResponse } from "../types";
import { genericParse, getNonEmptyString } from "../utils";

export class AuthController {
	public static async verifyOAuthSignIn(req: ApiRequest, res: ApiResponse) {
		const code = genericParse(getNonEmptyString, req.body.code);
		const oauthValidatorToken = await AuthService.verifyOAuthSignIn(code);
		res.status(HTTP.status.SUCCESS).json({
			message: HTTP.message.SUCCESS,
			data: oauthValidatorToken,
		});
	}
	public static async continueOAuthWithGoogle(
		req: ApiRequest,
		res: ApiResponse
	) {
		const validatorToken = genericParse(getNonEmptyString, req.body.token);
		const { user, accessToken, refreshToken } =
			await AuthService.continueOAuthWithGoogle(validatorToken);
		res.setHeader("x-auth-access-token", accessToken);
		res.setHeader("x-auth-refresh-token", refreshToken);
		res.status(HTTP.status.SUCCESS).json({
			message: HTTP.message.SUCCESS,
			data: user,
		});
	}
	public static async verifyLoggedInUser(req: ApiRequest, res: ApiResponse) {
		const user = req.user;
		if (!user) {
			throw new ApiError(
				HTTP.status.UNAUTHORIZED,
				"Please login to continue"
			);
		}
		res.status(HTTP.status.SUCCESS).json({
			message: HTTP.message.SUCCESS,
			data: user,
		});
	}
	public static async logout(_: ApiRequest, res: ApiResponse) {
		res.clearCookie("token");
		res.status(HTTP.status.SUCCESS).json({ message: HTTP.message.SUCCESS });
	}
}

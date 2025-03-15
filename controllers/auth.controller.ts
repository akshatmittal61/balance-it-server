import { HTTP } from "../constants";
import { Logger } from "../log";
import { OAuthService, OtpService } from "../services";
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
		const data = await OAuthService.verifyOAuthSignIn(code);
		return ApiSuccess(res).send(data);
	}
	public static async continueOAuthWithGoogle(
		req: ApiRequest,
		res: ApiResponse
	) {
		const validatorToken = genericParse(getNonEmptyString, req.body.token);
		const { user, accessToken, refreshToken } =
			await OAuthService.continueOAuthWithGoogle(validatorToken);
		Logger.debug(
			"User logged in with Google",
			user,
			accessToken,
			refreshToken
		);
		res.setHeader("x-auth-access-token", accessToken);
		res.setHeader("x-auth-refresh-token", refreshToken);
		return ApiSuccess(res).send(user);
	}
	public static async requestOtp(req: ApiRequest, res: ApiResponse) {
		const email = getNonEmptyString(req.body.email);
		await OtpService.requestOtpWithEmail(email);
		return ApiSuccess(res).send(null, "OTP sent successfully");
	}
	public static async verifyOtp(req: ApiRequest, res: ApiResponse) {
		const email = getNonEmptyString(req.body.email);
		const otp = genericParse(getNonEmptyString, req.body.otp);
		Logger.debug("Verifying OTP", { email, otp });
		const { accessToken, refreshToken, user, isNew } =
			await OtpService.verifyOtpWithEmail(email, otp);
		res.setHeader("x-auth-access-token", accessToken);
		res.setHeader("x-auth-refresh-token", refreshToken);
		const responseStatus = isNew
			? HTTP.status.CREATED
			: HTTP.status.SUCCESS;
		return ApiSuccess(res).send(user, HTTP.message.SUCCESS, responseStatus);
	}
	public static async verifyLoggedInUser(req: ApiRequest, res: ApiResponse) {
		const user = req.user;
		if (!user) {
			return ApiError(res).send("Please login to continue");
		}
		return ApiSuccess(res).send(user);
	}
	public static async logout(_: ApiRequest, res: ApiResponse) {
		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		return ApiSuccess(res).send();
	}
}

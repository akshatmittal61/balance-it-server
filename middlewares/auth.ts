import { NextFunction } from "express";
import { HTTP } from "../constants";
import { Logger } from "../log";
import { AuthService } from "../services";
import { ApiRequest, ApiResponse } from "../types";
import { ApiError, genericParse, getNonEmptyString } from "../utils";

export const authenticatedRoute = async (
	req: ApiRequest,
	res: ApiResponse,
	next: NextFunction
) => {
	try {
		const accessToken = genericParse(
			getNonEmptyString,
			req.cookies.accessToken
		);
		const refreshToken = genericParse(
			getNonEmptyString,
			req.cookies.refreshToken
		);
		const authReponse = await AuthService.getAuthenticatedUser({
			accessToken,
			refreshToken,
		});
		if (!authReponse) {
			return ApiError(res).send(
				"Please login to continue",
				HTTP.status.UNAUTHORIZED
			);
		}
		const {
			user,
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		} = authReponse;
		if (accessToken !== newAccessToken) {
			res.setHeader("x-auth-access-token", newAccessToken);
		}
		if (refreshToken !== newRefreshToken) {
			res.setHeader("x-auth-refresh-token", newRefreshToken);
		}
		req.user = user;
		return next();
	} catch (error: any) {
		Logger.error(error);
		return ApiError(res).send(
			"Please login to continue",
			HTTP.status.UNAUTHORIZED
		);
	}
};

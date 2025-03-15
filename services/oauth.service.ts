import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { jwtSecret, oauth_google } from "../config";
import { fallbackAssets, HTTP, USER_STATUS } from "../constants";
import { ApiError } from "../errors";
import { authRepo } from "../repo";
import { AuthResponse } from "../types";
import { genericParse, getNonEmptyString, safeParse } from "../utils";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";
import { Logger } from "../log";

const client = new OAuth2Client();

export class OAuthService {
	private static async verifyOAuthRequestByCode(auth_code: string) {
		const oauthRequest = {
			url: new URL("https://oauth2.googleapis.com/token"),
			params: {
				client_id: oauth_google.client_id,
				client_secret: oauth_google.client_secret,
				code: auth_code,
				grant_type: "authorization_code",
				redirect_uri: oauth_google.redirect_uri,
			},
		};
		const oauthResponse = await axios.post(
			oauthRequest.url.toString(),
			null,
			{ params: oauthRequest.params }
		);
		return oauthResponse.data;
	}
	private static async fetchUserFromIdToken(idToken: string) {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: oauth_google.client_id,
		});
		const payload = ticket.getPayload();
		return payload;
	}
	public static async verifyOAuthSignIn(code: string): Promise<string> {
		Logger.debug("Verifying OAuth sign in", code);
		const { id_token } = await OAuthService.verifyOAuthRequestByCode(code);
		Logger.debug("Verified OAuth id token", id_token);
		const userFromOAuth = await OAuthService.fetchUserFromIdToken(id_token);
		if (!userFromOAuth) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		Logger.debug("User from OAuth", userFromOAuth);
		const email = genericParse(getNonEmptyString, userFromOAuth.email);
		const name = safeParse(getNonEmptyString, userFromOAuth.name) || "";
		const picture = userFromOAuth.picture;
		const { user, isNew } = await UserService.findOrCreateUser({
			name,
			email,
			avatar: picture || fallbackAssets.avatar,
			status: USER_STATUS.JOINED,
		});
		Logger.debug("Found or created user", { user, isNew });
		const authMapping = await AuthService.findOrCreateAuthMapping(
			email,
			{ id: userFromOAuth.sub, name: "google" },
			user.id,
			{ name, avatar: picture }
		);
		Logger.debug("Found or created auth mapping", authMapping);
		if (isNew || !authMapping.user || authMapping.user.id !== user.id) {
			await authRepo.update({ id: authMapping.id }, { user: user.id });
		}
		const oauthValidatorToken = jwt.sign(
			{ id: authMapping.id },
			jwtSecret.oauthValidator,
			{ expiresIn: "1m" }
		);
		Logger.debug("Generated validator token", oauthValidatorToken);
		return oauthValidatorToken;
	}
	public static async continueOAuthWithGoogle(
		validatorToken: string
	): Promise<AuthResponse> {
		const decodedToken: any = jwt.verify(
			validatorToken,
			jwtSecret.oauthValidator
		);
		Logger.debug("Decoded validator token", decodedToken);
		const authMappingId = genericParse(getNonEmptyString, decodedToken.id);
		const foundAuthMapping = await authRepo.findById(authMappingId);
		Logger.debug("Found auth mapping", foundAuthMapping);
		if (!foundAuthMapping || !foundAuthMapping.user) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		const { accessToken, refreshToken } = AuthService.generateTokens(
			`${foundAuthMapping.id}`
		);
		Logger.debug("Generated tokens", { accessToken, refreshToken });
		return { accessToken, refreshToken, user: foundAuthMapping.user };
	}
}

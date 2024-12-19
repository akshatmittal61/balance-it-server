import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import { jwtSecret, oauth_google } from "../config";
import { fallbackAssets, HTTP, USER_STATUS } from "../constants";
import { ApiError } from "../errors";
import { authRepo } from "../repo";
import { IAuthMapping, IUser, User } from "../types";
import { genericParse, getNonEmptyString, safeParse } from "../utils";
import { UserService } from "./user.service";

const client = new OAuth2Client();

export class AuthService {
	public static async findOrCreateAuthMapping(
		email: string,
		provider: { id: string; name: string },
		misc?: any
	): Promise<IAuthMapping> {
		const foundAuthMapping = await authRepo.findOne({ identifier: email });
		if (foundAuthMapping) {
			return foundAuthMapping;
		}
		return await authRepo.create({
			identifier: email,
			providerName: provider.name,
			providerId: provider.id,
			misc: JSON.stringify(misc),
			user: null,
		});
	}
	public static async verifyOAuthRequestByCode(auth_code: string) {
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
	public static async fetchUserFromIdToken(idToken: string) {
		const ticket = await client.verifyIdToken({
			idToken,
			audience: oauth_google.client_id,
		});
		const payload = ticket.getPayload();
		return payload;
	}
	public static async verifyOAuthSignIn(code: string): Promise<string> {
		const { id_token } = await AuthService.verifyOAuthRequestByCode(code);
		const userFromOAuth = await AuthService.fetchUserFromIdToken(id_token);
		if (!userFromOAuth) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		const email = genericParse(getNonEmptyString, userFromOAuth.email);
		const name = safeParse(getNonEmptyString, userFromOAuth.name) || "";
		const picture = userFromOAuth.picture;
		const authMapping = await AuthService.findOrCreateAuthMapping(
			email,
			{ id: userFromOAuth.sub, name: "google" },
			{ name, avatar: picture }
		);
		const { user, isNew } = await UserService.findOrCreateUser({
			name,
			email,
			avatar: picture || fallbackAssets.avatar,
			status: USER_STATUS.JOINED,
		});
		if (isNew || !authMapping.user || authMapping.user.id !== user.id) {
			await authRepo.update({ id: authMapping.id }, { user: user.id });
		}
		const oauthValidatorToken = jwt.sign(
			{ id: authMapping.id },
			jwtSecret.oauthValidator,
			{ expiresIn: "1m" }
		);
		return oauthValidatorToken;
	}
	public static async continueOAuthWithGoogle(
		validatorToken: string
	): Promise<{
		accessToken: string;
		refreshToken: string;
		user: IUser;
	}> {
		const decodedToken: any = jwt.verify(
			validatorToken,
			jwtSecret.oauthValidator
		);
		const authMappingId = genericParse(getNonEmptyString, decodedToken.id);
		const foundAuthMapping = await authRepo.findById(authMappingId);
		if (!foundAuthMapping || !foundAuthMapping.user) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		const user = await UserService.getUserById(foundAuthMapping.user.id);
		if (!user) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		const { accessToken, refreshToken } = AuthService.generateTokens(
			`${foundAuthMapping.id}`
		);
		return { accessToken, refreshToken, user };
	}
	public static async getUserByAuthMappingId(
		authMappingId: string
	): Promise<User | null> {
		const foundAuthMapping = await authRepo.findById(authMappingId);
		if (!foundAuthMapping) return null;
		const userId = genericParse(getNonEmptyString, foundAuthMapping.user);
		return await UserService.getUserById(userId);
	}
	public static async getAuthenticatedUser({
		accessToken,
		refreshToken,
	}: {
		accessToken: string;
		refreshToken: string;
	}): Promise<{
		user: User;
		accessToken: string;
		refreshToken: string;
	} | null> {
		try {
			const decodedAccessToken: any = jwt.verify(
				accessToken,
				jwtSecret.authAccess
			);
			const authMappingId = genericParse(
				getNonEmptyString,
				decodedAccessToken.id
			);
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!user) return null;
			return {
				user,
				accessToken,
				refreshToken,
			};
		} catch (error) {
			if (!(error instanceof TokenExpiredError)) {
				return null;
			}
		}
		try {
			const decodedRefreshToken: any = jwt.verify(
				refreshToken,
				jwtSecret.authRefresh
			);
			const authMappingId = genericParse(
				getNonEmptyString,
				decodedRefreshToken.id
			);
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!user) return null;
			const newAccessToken =
				AuthService.generateAccessToken(authMappingId);
			return {
				user,
				accessToken: newAccessToken,
				refreshToken,
			};
		} catch {
			return null;
		}
	}
	public static generateRefreshToken(id: string) {
		return jwt.sign({ id }, jwtSecret.authRefresh, {
			expiresIn: "7d",
		});
	}
	public static generateAccessToken(id: string) {
		return jwt.sign({ id }, jwtSecret.authAccess, {
			expiresIn: "15m",
		});
	}
	public static generateTokens(id: string): {
		refreshToken: string;
		accessToken: string;
	} {
		return {
			refreshToken: AuthService.generateRefreshToken(id),
			accessToken: AuthService.generateAccessToken(id),
		};
	}
}

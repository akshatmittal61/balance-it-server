import jwt, { TokenExpiredError } from "jsonwebtoken";
import { jwtSecret } from "../config";
import { Logger } from "../log";
import { authRepo } from "../repo";
import { AuthResponse, IAuthMapping, User } from "../types";
import { genericParse, getNonEmptyString } from "../utils";

export class AuthService {
	public static async findOrCreateAuthMapping(
		email: string,
		provider: { id: string; name: string },
		userId: string | null,
		misc: any = {}
	): Promise<IAuthMapping> {
		Logger.debug("Finding or creating auth mapping", {
			email,
			provider,
			misc,
		});
		const foundAuthMapping = await authRepo.findOne({
			identifier: email,
			providerName: provider.name,
		});
		Logger.debug("Found auth mapping", foundAuthMapping);
		if (foundAuthMapping) {
			return foundAuthMapping;
		}
		const createdAuthMapping = await authRepo.create({
			identifier: email,
			providerName: provider.name,
			providerId: provider.id,
			misc: JSON.stringify(misc),
			user: userId,
		});
		Logger.debug("Created auth mapping", createdAuthMapping);
		return createdAuthMapping;
	}
	public static async getUserByAuthMappingId(
		authMappingId: string
	): Promise<User | null> {
		const foundAuthMapping = await authRepo.findById(authMappingId);
		Logger.debug(
			"Found auth mapping in getUserByAuthMappingId",
			foundAuthMapping
		);
		if (!foundAuthMapping) return null;
		return foundAuthMapping.user;
	}
	public static async getAuthenticatedUser({
		accessToken,
		refreshToken,
	}: Omit<AuthResponse, "user">): Promise<AuthResponse | null> {
		try {
			const decodedAccessToken: any = jwt.verify(
				accessToken,
				jwtSecret.authAccess
			);
			Logger.debug("Decoded access token", decodedAccessToken);
			const authMappingId = genericParse(
				getNonEmptyString,
				decodedAccessToken.id
			);
			Logger.debug("Auth mapping id", authMappingId);
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!user) return null;
			Logger.debug("Found user", user);
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
			Logger.debug("Decoded refresh token", decodedRefreshToken);
			const authMappingId = genericParse(
				getNonEmptyString,
				decodedRefreshToken.id
			);
			Logger.debug("Auth mapping id", authMappingId);
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!user) return null;
			Logger.debug("Found user", user);
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
			expiresIn: "1m",
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

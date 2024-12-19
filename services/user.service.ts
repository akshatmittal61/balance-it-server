import { cache, getCacheKey } from "../cache";
import { cacheParameter, HTTP } from "../constants";
import { ApiError } from "../errors";
import { userRepo } from "../repo";
import { CreateModel, IUser, UpdateUser, User } from "../types";
import { genericParse, getNonEmptyString } from "../utils";

export class UserService {
	public static async getUserById(id: string): Promise<IUser | null> {
		const cacheKey = getCacheKey(cacheParameter.USER, { id });
		return await cache.fetch(cacheKey, () => userRepo.findById(id));
	}
	public static async findOrCreateUser(
		body: CreateModel<User>
	): Promise<{ user: IUser; isNew: boolean }> {
		const email = genericParse(getNonEmptyString, body.email);
		const foundUser = await userRepo.findOne({ email });
		if (foundUser) {
			return { user: foundUser, isNew: false };
		}
		const createdUser = await userRepo.create(body);
		return { user: createdUser, isNew: true };
	}
	public static async updateUserProfile(
		id: string,
		body: UpdateUser
	): Promise<IUser> {
		const updatedUser = await userRepo.update({ id }, body);
		if (!updatedUser) {
			throw new ApiError(HTTP.status.NOT_FOUND, "User not found");
		}
		const cacheKey = getCacheKey(cacheParameter.USER, { id });
		cache.invalidate(cacheKey);
		return updatedUser;
	}
	public static async searchByEmail(
		emailQuery: string
	): Promise<Array<IUser>> {
		if (!emailQuery) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Email query is required"
			);
		}
		if (emailQuery.length < 3) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Email query too short"
			);
		}
		const query = emailQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const res = await userRepo.find({
			email: { $regex: query, $options: "i" },
		});
		if (!res) return [];
		return res;
	}
}

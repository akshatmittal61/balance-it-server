import { cache, getCacheKey } from "../cache";
import {
	cacheParameter,
	emailTemplates,
	HTTP,
	USER_STATUS,
} from "../constants";
import { ApiError } from "../errors";
import { userRepo } from "../repo";
import { CreateModel, IUser, UpdateUser, User } from "../types";
import { genericParse, getNonEmptyString } from "../utils";
import { sendEmailTemplate } from "./email";

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
	public static async invite(email: string, invitedByUser: IUser) {
		await sendEmailTemplate(
			email,
			"Invite to Settle It",
			emailTemplates.USER_INVITED,
			{
				invitedBy: {
					email: invitedByUser?.email,
					name: invitedByUser?.name,
				},
			}
		);
	}
	public static async inviteUser(
		invitedByUserId: string,
		invitee: string
	): Promise<IUser> {
		if (invitedByUserId === invitee) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"You cannot invite yourself"
			);
		}
		const userExists = await UserService.getUserById(invitee);
		if (userExists) {
			throw new ApiError(HTTP.status.CONFLICT, "User already exists");
		}
		const invitedByUser = await UserService.getUserById(invitedByUserId);
		if (!invitedByUser) {
			throw new ApiError(
				HTTP.status.NOT_FOUND,
				"Invited by user not found"
			);
		}
		await this.invite(invitee, invitedByUser);
		const createdUser = await userRepo.create({
			email: invitee,
			status: USER_STATUS.INVITED,
			invitedBy: invitedByUserId,
		});
		return createdUser;
	}
}

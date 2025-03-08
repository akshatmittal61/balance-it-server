import { getCacheKey } from "../cache";
import { cacheParameter } from "../constants";
import { groupRepo } from "../repo";
import { IGroup } from "../types";

export class GroupService {
	public static async getGroupById(id: string): Promise<IGroup | null> {
		const cacheKey = getCacheKey(cacheParameter.GROUP, { id });
		return await cache.fetch(cacheKey, () => groupRepo.findById(id));
	}
	public static async getAllGroupsForUser(
		userId: string
	): Promise<Array<IGroup>> {
		const groups = await cache.fetch(
			getCacheKey(cacheParameter.USER_GROUPS, { userId }),
			() => groupRepo.find({ members: { $in: [userId] } })
		);
		if (!groups) return [];
		return groups;
	}
}

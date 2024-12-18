import { MemberModel } from "../models";
import {
	CreateModel,
	FilterQuery,
	IMember,
	IUser,
	Member,
	UpdateQuery,
} from "../types";
import {
	getNonNullValue,
	getObjectFromMongoResponse,
	omitKeys,
} from "../utils";
import { BaseRepo } from "./base";

class MemberRepo extends BaseRepo<Member, IMember> {
	protected model = MemberModel;
	public parser(input: Member | null): IMember | null {
		const res = getObjectFromMongoResponse<Member>(input);
		if (!res) return null;
		const user = getObjectFromMongoResponse<IUser>(res.user);
		if (!user) return null;
		const parsed = omitKeys(res, ["user"]);
		return {
			...user,
			...parsed,
		};
	}
	public async findOne(query: FilterQuery<Member>): Promise<IMember | null> {
		const res = await this.model.findOne<Member>(query).populate("user");
		return this.parser(res);
	}
	public async findById(id: string): Promise<IMember | null> {
		try {
			const res = await this.model.findById<Member>(id).populate("user");
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}
	public async find(
		query: FilterQuery<Member>
	): Promise<Array<IMember> | null> {
		const res = await this.model.find<Member>(query).populate("user");
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}
	public async findAll(): Promise<Array<IMember>> {
		const res = await this.model
			.find<Member>()
			.populate("user")
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async create(body: CreateModel<Member>): Promise<IMember> {
		const res = await this.model.create<CreateModel<Member>>(body);
		return getNonNullValue(this.parser(await res.populate("user")));
	}
	public async update(
		query: FilterQuery<Member>,
		update: UpdateQuery<Member>
	): Promise<IMember | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Member>(filter, update, { new: true })
			.populate("user");
		return this.parser(res);
	}
	public async remove(query: FilterQuery<Member>): Promise<IMember | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Member>(filter)
			.populate("user");
		return this.parser(res);
	}
	public async bulkCreate(
		body: Array<CreateModel<Member>>
	): Promise<Array<IMember>> {
		const res = await this.model.insertMany<CreateModel<Member>>(body);
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
}

export const memberRepo = new MemberRepo();

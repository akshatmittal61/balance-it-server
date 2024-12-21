import { GroupModel } from "../models";
import {
	CreateModel,
	FilterQuery,
	Group,
	IGroup,
	IUser,
	UpdateQuery,
} from "../types";
import { getNonNullValue, getObjectFromMongoResponse } from "../utils";
import { BaseRepo } from "./base";

class GroupRepo extends BaseRepo<Group, IGroup> {
	protected model = GroupModel;
	public parser(input: Group | null): IGroup | null {
		const res = super.parser(input);
		if (!res) return null;
		const author = getObjectFromMongoResponse<IUser>(res.author);
		if (!author) return null;
		res.author = author;
		return res;
	}
	public async findOne(query: FilterQuery<Group>): Promise<IGroup | null> {
		const res = await this.model.findOne<Group>(query).populate("author");
		return this.parser(res);
	}
	public async findById(id: string): Promise<IGroup | null> {
		try {
			const res = await this.model.findById<Group>(id).populate("author");
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}
	public async find(
		query: FilterQuery<Group>
	): Promise<Array<IGroup> | null> {
		const res = await this.model
			.find<Group>(query)
			.populate("author")
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}
	public async findAll(): Promise<Array<IGroup>> {
		const res = await this.model
			.find<Group>()
			.populate("author")
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async create(body: CreateModel<Group>): Promise<IGroup> {
		const res = await this.model.create<CreateModel<Group>>(body);
		return getNonNullValue(this.parser(await res.populate("author")));
	}
	public async update(
		query: FilterQuery<Group>,
		update: UpdateQuery<Group>
	): Promise<IGroup | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Group>(filter, update, { new: true })
			.populate("author");
		return this.parser(res);
	}
	public async remove(query: FilterQuery<Group>): Promise<IGroup | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Group>(filter)
			.populate("author");
		return this.parser(res);
	}
}

export const groupRepo = new GroupRepo();

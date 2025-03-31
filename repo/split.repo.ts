import { SplitModel } from "../models";
import {
	CreateModel,
	FilterQuery,
	IExpense,
	ISplit,
	IUser,
	Split,
	UpdateQuery,
} from "../types";
import { getNonNullValue, getObjectFromMongoResponse } from "../utils";
import { BaseRepo } from "./base";

class SplitRepo extends BaseRepo<Split, ISplit> {
	protected model = SplitModel;
	public parser(input: Split | null): ISplit | null {
		const res = super.parser(input);
		if (!res) return null;
		const expense = getObjectFromMongoResponse<IExpense>(res.expense);
		if (!expense) return null;
		res.expense = expense;
		const user = getObjectFromMongoResponse<IUser>(res.user);
		if (!user) return null;
		res.user = user;
		return res;
	}
	public async findOne(query: FilterQuery<Split>): Promise<ISplit | null> {
		const res = await this.model
			.findOne<Split>(query)
			.populate("user")
			.populate({
				path: "expense",
				populate: {
					path: "group",
					populate: { path: "author" },
				},
			});
		return this.parser(res);
	}
	public async findById(id: string): Promise<ISplit | null> {
		try {
			const res = await this.model
				.findById<Split>(id)
				.populate("user")
				.populate({
					path: "expense",
					populate: {
						path: "group",
						populate: { path: "author" },
					},
				});
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}
	public async find(
		query: FilterQuery<Split>
	): Promise<Array<ISplit> | null> {
		const res = await this.model
			.find(query)
			.populate("user")
			.populate({
				path: "expense",
				populate: {
					path: "group",
					populate: { path: "author" },
				},
			});
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}
	public async findAll(): Promise<Array<ISplit>> {
		const res = await this.model
			.find<Split>()
			.populate("user")
			.populate({
				path: "expense",
				populate: {
					path: "group",
					populate: { path: "author" },
				},
			})
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async create(body: CreateModel<Split>): Promise<ISplit> {
		const res = await this.model.create<CreateModel<Split>>(body);
		const createdSplit = await this.findById(res.id);
		return getNonNullValue(createdSplit);
	}
	public async update(
		query: FilterQuery<Split>,
		update: UpdateQuery<Split>
	): Promise<ISplit | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Split>(filter, update, { new: true })
			.populate("user")
			.populate({
				path: "expense",
				populate: {
					path: "group",
					populate: { path: "author" },
				},
			});
		return this.parser(res);
	}
	public async remove(query: FilterQuery<Split>): Promise<ISplit | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Split>(filter)
			.populate("user")
			.populate({
				path: "expense",
				populate: {
					path: "group",
					populate: { path: "author" },
				},
			});
		return this.parser(res);
	}
	public async bulkCreate(
		body: Array<CreateModel<Split>>
	): Promise<Array<ISplit>> {
		const res = await this.model.insertMany<CreateModel<Split>>(body);
		const parsedRes: Array<ISplit> = [];
		for (const obj of res) {
			const createdSplit = await this.findById(obj.id);
			parsedRes.push(getNonNullValue(createdSplit));
		}
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async bulkUpdate(
		body: Array<FilterQuery<Split> & UpdateQuery<Split>>
	): Promise<any> {
		const res = await this.model.bulkWrite<Split>(
			body.map((obj) => ({
				updateOne: {
					filter: obj.filter,
					update: obj.update,
				},
			}))
		);
		return res;
	}
	public async bulkRemove(query: FilterQuery<Split>): Promise<number> {
		const res = await this.model.deleteMany(query);
		return res.deletedCount;
	}
}

export const splitRepo = new SplitRepo();

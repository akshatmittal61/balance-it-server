import { ExpenseModel } from "../models";
import {
	CreateModel,
	Expense,
	ExpenseSpread,
	FilterQuery,
	IExpense,
	IGroup,
	IUser,
	ObjectId,
	UpdateQuery,
} from "../types";
import { getNonNullValue, getObjectFromMongoResponse } from "../utils";
import { BaseRepo } from "./base";

class ExpenseRepo extends BaseRepo<Expense, IExpense> {
	protected model = ExpenseModel;
	public parser(input: Expense | null): IExpense | null {
		const res = super.parser(input);
		if (!res) return null;
		const author = getObjectFromMongoResponse<IUser>(res.author);
		if (!author) return null;
		res.author = author;
		const group = getObjectFromMongoResponse<IGroup>(res.group);
		if (group) res.group = group;
		return res;
	}
	public async findOne(
		query: FilterQuery<Expense>
	): Promise<IExpense | null> {
		const res = await this.model
			.findOne<Expense>(query)
			.populate("author")
			.populate({
				path: "group",
				populate: { path: "author" },
			});
		return this.parser(res);
	}
	public async findById(id: string): Promise<IExpense | null> {
		try {
			const res = await this.model
				.findById<Expense>(id)
				.populate("author")
				.populate({
					path: "group",
					populate: { path: "author" },
				});
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}
	public async find(
		query: FilterQuery<Expense>
	): Promise<Array<IExpense> | null> {
		const res = await this.model
			.find<Expense>(query)
			.populate("author")
			.populate({
				path: "group",
				populate: { path: "author" },
			})
			.sort({ timestamp: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}
	public async findAll(): Promise<Array<IExpense>> {
		const res = await this.model
			.find<Expense>()
			.populate("author")
			.populate({
				path: "group",
				populate: { path: "author" },
			})
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async create(body: CreateModel<Expense>): Promise<IExpense> {
		const res = await this.model.create<CreateModel<Expense>>(body);
		const createdExpense = await this.findById(res.id);
		return getNonNullValue(createdExpense);
	}
	public async update(
		query: FilterQuery<Expense>,
		update: UpdateQuery<Expense>
	): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Expense>(filter, update, { new: true })
			.populate("author")
			.populate({
				path: "group",
				populate: { path: "author" },
			});
		return this.parser(res);
	}
	public async remove(query: FilterQuery<Expense>): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Expense>(filter)
			.populate("author")
			.populate({
				path: "group",
				populate: { path: "author" },
			});
		return this.parser(res);
	}
	public async findByIdWithSplits(id: string): Promise<ExpenseSpread | null> {
		const res = await this.findWithSplits({ _id: new ObjectId(id) });
		if (res.length === 0) return null;
		return res[0];
	}
	public async findWithSplits(
		query: FilterQuery<Expense>
	): Promise<Array<ExpenseSpread>> {
		const expensesWithSplits = await this.model.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: "users",
					localField: "author",
					foreignField: "_id",
					as: "author",
				},
			},
			{
				$unwind: {
					path: "$author",
				},
			},
			{
				$project: {
					_id: 1,
					id: "$_id",
					title: 1,
					amount: 1,
					author: {
						id: "$author._id",
						name: 1,
						email: 1,
						phone: 1,
						avatar: 1,
						status: 1,
					},
					timestamp: 1,
					group: 1,
					tags: 1,
					icon: 1,
					type: 1,
					method: 1,
					createdAt: 1,
					updatedAt: 1,
				},
			},
			{
				$lookup: {
					from: "splits",
					localField: "_id",
					foreignField: "expense",
					as: "splits",
				},
			},
			{
				$unwind: {
					path: "$splits",
					preserveNullAndEmptyArrays: true, // Keeps expenses even if they have no splits
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "splits.user",
					foreignField: "_id",
					as: "splits.user",
				},
			},
			{
				$unwind: {
					path: "$splits.user",
					preserveNullAndEmptyArrays: true, // Ensures null user in case of missing reference
				},
			},
			{
				$lookup: {
					from: "groups",
					localField: "group",
					foreignField: "_id",
					as: "group",
				},
			},
			{
				$unwind: {
					path: "$group",
					preserveNullAndEmptyArrays: true, // Keeps expenses even if they have no group
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "group.author",
					foreignField: "_id",
					as: "group.author",
				},
			},
			{
				$unwind: {
					path: "$group.author",
					preserveNullAndEmptyArrays: true, // Ensures group author is null if missing
				},
			},
			{
				$group: {
					_id: "$_id",
					id: { $first: "$id" },
					title: { $first: "$title" },
					amount: { $first: "$amount" },
					author: { $first: "$author" },
					timestamp: { $first: "$timestamp" },
					tags: { $first: "$tags" },
					icon: { $first: "$icon" },
					type: { $first: "$type" },
					method: { $first: "$method" },
					createdAt: { $first: "$createdAt" },
					updatedAt: { $first: "$updatedAt" },
					splits: {
						$push: {
							$cond: {
								if: { $gt: ["$splits._id", null] },
								then: {
									id: "$splits._id",
									user: {
										id: "$splits.user._id",
										name: "$splits.user.name",
										email: "$splits.user.email",
										phone: "$splits.user.phone",
										avatar: "$splits.user.avatar",
										status: "$splits.user.status",
									},
									pending: "$splits.pending",
									completed: "$splits.completed",
								},
								else: "$$REMOVE", // Removes empty split entries
							},
						},
					},
					group: {
						$first: {
							$cond: {
								if: { $gt: ["$group._id", null] },
								then: {
									id: "$group._id",
									name: "$group.name",
									icon: "$group.icon",
									banner: "$group.banner",
									tags: "$group.tags",
									author: {
										id: "$group.author._id",
										name: "$group.author.name",
										email: "$group.author.email",
										phone: "$group.author.phone",
										avatar: "$group.user.avatar",
										status: "$group.user.status",
									},
								},
								else: null,
							},
						},
					},
				},
			},
			{ $sort: { timestamp: -1 } },
		]);
		return expensesWithSplits;
	}
}

export const expenseRepo = new ExpenseRepo();

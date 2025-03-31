import { ExpenseModel } from "../models";
import {
	CreateModel,
	Expense,
	FilterQuery,
	IExpense,
	IGroup,
	IUser,
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
			.sort({ createdAt: -1 });
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
}

export const expenseRepo = new ExpenseRepo();

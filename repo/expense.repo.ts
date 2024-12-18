import { ExpenseModel } from "../models";
import {
	CreateModel,
	Expense,
	FilterQuery,
	IExpense,
	UpdateQuery,
} from "../types";
import { getNonNullValue } from "../utils";
import { BaseRepo } from "./base";

class ExpenseRepo extends BaseRepo<Expense, IExpense> {
	protected model = ExpenseModel;
	public parser(input: Expense | null): IExpense | null {
		const res = super.parser(input);
		if (!res) return null;
		if (res.group) res.group = res?.group || null;
		return res;
	}
	public async findOne(
		query: FilterQuery<Expense>
	): Promise<IExpense | null> {
		const res = await this.model.findOne<Expense>(query).populate("author");
		return this.parser(res);
	}
	public async findById(id: string): Promise<IExpense | null> {
		try {
			const res = await this.model
				.findById<Expense>(id)
				.populate("author");
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}
	public async find(
		query: FilterQuery<Expense>
	): Promise<Array<IExpense> | null> {
		const res = await this.model.find<Expense>(query).populate("author");
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}
	public async findAll(): Promise<Array<IExpense>> {
		const res = await this.model
			.find<Expense>()
			.populate("author")
			.sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}
	public async create(body: CreateModel<Expense>): Promise<IExpense> {
		const res = await this.model.create<CreateModel<Expense>>(body);
		return getNonNullValue(this.parser(await res.populate("author")));
	}
	public async update(
		query: FilterQuery<Expense>,
		update: UpdateQuery<Expense>
	): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Expense>(filter, update, { new: true })
			.populate("author");
		return this.parser(res);
	}
	public async remove(query: FilterQuery<Expense>): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Expense>(filter)
			.populate("author");
		return this.parser(res);
	}
}

export const expenseRepo = new ExpenseRepo();

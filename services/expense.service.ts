import { cache, getCacheKey } from "../cache";
import { cacheParameter, HTTP } from "../constants";
import { ApiError } from "../errors";
import { expenseRepo, groupRepo, splitRepo } from "../repo";
import { CreateModel, Expense, Split } from "../types";

export class ExpenseService {
	public static async getUserExpenses(userId: string) {
		const expenses = await expenseRepo.find({ author: userId });
		return expenses || [];
	}
	public static async getGroupExpenses(groupId: string) {
		const expenses = await expenseRepo.find({ group: groupId });
		return expenses || [];
	}
	public static async getExpenseById(expenseId: string) {
		const cacheKey = getCacheKey(cacheParameter.EXPENSE, { id: expenseId });
		return await cache.fetch(cacheKey, () =>
			expenseRepo.findById(expenseId)
		);
	}
	public static async createExpense(
		body: CreateModel<Expense>,
		userId: string,
		splits?: Array<{ user: string; amount: number }>
	) {
		if (body.author && body.author !== userId) {
			throw new ApiError(HTTP.status.UNAUTHORIZED, "Unauthorized");
		}
		if (body.group) {
			const foundGroup = await groupRepo.findById(body.group);
			if (!foundGroup) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
		}
		const expense = await expenseRepo.create({ ...body, author: userId });
		if (splits) {
			const splitsToCreate: Array<CreateModel<Split>> = splits.map(
				(split) => ({
					expense: expense.id,
					user: split.user,
					pending:
						expense.author.id === split.user ? 0 : split.amount,
					completed:
						expense.author.id === split.user ? split.amount : 0,
				})
			);
			await splitRepo.bulkCreate(splitsToCreate);
		}
		return expense;
	}
}

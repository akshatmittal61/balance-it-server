import { cache, getCacheKey } from "../cache";
import { cacheParameter, HTTP } from "../constants";
import { ApiError } from "../errors";
import { expenseRepo, groupRepo, memberRepo, splitRepo } from "../repo";
import {
	CreateModel,
	Expense,
	IExpense,
	Split,
	T_EXPENSE_TYPE,
	UpdateQuery,
} from "../types";
import { UserService } from "./user.service";

export class ExpenseService {
	public static async getUserExpenses(
		userId: string
	): Promise<Array<IExpense>> {
		const expenses = await expenseRepo.find({ author: userId });
		return expenses || [];
	}
	public static async getGroupExpenses(
		groupId: string
	): Promise<Array<IExpense>> {
		const expenses = await expenseRepo.find({ group: groupId });
		return expenses || [];
	}
	public static async getExpenseById(
		expenseId: string
	): Promise<IExpense | null> {
		const cacheKey = getCacheKey(cacheParameter.EXPENSE, { id: expenseId });
		return await cache.fetch(cacheKey, () =>
			expenseRepo.findById(expenseId)
		);
	}
	public static async createExpense(
		body: CreateModel<Expense>,
		userId: string,
		splits?: Array<{ user: string; amount: number }>
	): Promise<IExpense> {
		// --- Validations ---
		const foundAuthor = await UserService.getUserById(body.author);
		if (!foundAuthor) {
			throw new ApiError(HTTP.status.NOT_FOUND, "User not found");
		}
		if (!body.group && !splits) {
			if (body.author !== userId) {
				// Only the current user can add a personal expense
				// check if the user is the one adding the expense
				throw new ApiError(HTTP.status.UNAUTHORIZED, "Unauthorized");
			}
		}
		// check if the amount is valid
		if (isNaN(body.amount) || body.amount <= 0) {
			throw new ApiError(HTTP.status.BAD_REQUEST, "Invalid amount");
		}
		if (body.group) {
			// check if the user is a member of the group
			const foundGroup = await groupRepo.findById(body.group);
			if (!foundGroup) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
			const members = await memberRepo.find({ group: foundGroup.id });
			if (!members) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
			if (!members.some((member) => member.user.id === userId)) {
				throw new ApiError(
					HTTP.status.UNAUTHORIZED,
					"You are not a member of this group"
				);
			}
			// check if splits are not provided
			if (!splits) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Splits are required for group expenses"
				);
			}
		}
		if (splits) {
			// check if the amount is distributed correctly
			const distributedAmounts = splits.reduce((acc, split) => {
				return acc + split.amount;
			}, 0);
			if (distributedAmounts !== body.amount) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Invalid split amounts"
				);
			}
			// check if the users exist
			const users = splits.map((split) => split.user);
			const foundMembers = await memberRepo.find({
				user: { $in: users },
			});
			if (!foundMembers) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Members not found");
			}
			// check if everyone in the splits has some amount
			if (splits.some((split) => split.amount <= 0)) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Invalid split amounts"
				);
			}
		}

		// --- Create expense ---
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
	public static async updateExpense({
		expenseId,
		loggedInUserId,
		title,
		amount,
		author,
		timestamp,
		group,
		tags,
		icon,
		type,
		method,
		splits,
	}: {
		expenseId: string;
		loggedInUserId: string;
		title?: string;
		amount?: number;
		author?: string;
		timestamp?: string;
		group?: string;
		tags?: string[];
		icon?: string;
		type?: T_EXPENSE_TYPE;
		method?: string;
		splits?: Array<{ user: string; amount: number }>;
	}): Promise<IExpense> {
		if (amount === null || amount === undefined || isNaN(amount)) {
			throw new ApiError(HTTP.status.BAD_REQUEST, "Invalid amount");
		}
		if (splits) {
			// check if the amount is distributed correctly
			const distributedAmounts = splits.reduce((acc, split) => {
				return acc + split.amount;
			}, 0);
			if (distributedAmounts !== amount) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Invalid split amounts"
				);
			}
			// check if the users exist
			const users = splits.map((split) => split.user);
			const foundMembers = await memberRepo.find({
				user: { $in: users },
			});
			if (!foundMembers) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Members not found");
			}
			// check if everyone in the splits has some amount
			if (splits.some((split) => split.amount <= 0)) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Invalid split amounts"
				);
			}
		}
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!foundExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		// the user can only edit expense if it is paid by the user or is a personal expense
		if (foundExpense.author.id !== loggedInUserId) {
			throw new ApiError(HTTP.status.UNAUTHORIZED, "Unauthorized");
		}
		if (splits) {
			const existingSplits =
				(await splitRepo.find({
					expense: expenseId,
				})) || [];
			const splitsToCreate: Array<CreateModel<Split>> = splits
				.filter((split) => {
					const existingSplit = existingSplits.find(
						(s) => s.user.id === split.user
					);
					return !existingSplit;
				})
				.map((split) => ({
					expense: expenseId,
					user: split.user,
					pending:
						foundExpense.author.id === split.user
							? 0
							: split.amount,
					completed:
						foundExpense.author.id === split.user
							? split.amount
							: 0,
				}));
			const splitsToUpdate: Array<UpdateQuery<Split>> = splits
				.filter((split) => {
					const existingSplit = existingSplits.find(
						(s) => s.user.id === split.user
					);
					return existingSplit;
				})
				.map((split) => ({
					filter: {
						_id: existingSplits.find(
							(s) => s.user.id === split.user
						)!.id,
					},
					update: {
						$set: {
							pending:
								foundExpense.author.id === split.user
									? 0
									: split.amount,
							completed:
								foundExpense.author.id === split.user
									? split.amount
									: 0,
						},
					},
				}));
			const splitsToDelete: Array<string> = existingSplits
				.filter((split) => {
					const existingSplit = splits.find(
						(s) => s.user === split.user.id
					);
					return existingSplit === undefined;
				})
				.map((split) => split.id);
			await splitRepo.bulkCreate(splitsToCreate);
			await splitRepo.bulkUpdate(splitsToUpdate);
			await splitRepo.bulkRemove({ _id: { $in: splitsToDelete } });
		}
		if (group) {
			// check if the group exists
			const foundGroup = await groupRepo.findOne({ id: group });
			if (!foundGroup) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
			// check if the user is a member of the group
			const members = await memberRepo.find({ group: foundGroup.id });
			if (!members) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
			if (!members.some((member) => member.user.id === loggedInUserId)) {
				throw new ApiError(
					HTTP.status.UNAUTHORIZED,
					"You are not a member of this group"
				);
			}
			// check if the person who paid for this expense is a member of the group
			if (members.some((member) => member.user.id === author)) {
				throw new ApiError(
					HTTP.status.UNAUTHORIZED,
					"You are not a member of this group"
				);
			}
		}
		const updateExpenseBody: UpdateQuery<IExpense> = {
			$set: {
				title,
				amount,
				author,
				timestamp,
				group,
				tags,
				icon,
				type,
				method,
			},
		};
		const updatedExpense = await expenseRepo.update(
			{ id: expenseId },
			updateExpenseBody
		);
		if (!updatedExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		return updatedExpense;
	}
	public static async deleteExpense({
		expenseId,
		loggedInUserId,
	}: {
		expenseId: string;
		loggedInUserId: string;
	}): Promise<void> {
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!foundExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		// the user can only delete expense if it is paid by the user or is a personal expense
		if (foundExpense.author.id !== loggedInUserId) {
			throw new ApiError(HTTP.status.UNAUTHORIZED, "Unauthorized");
		}
		// search for any splits for this expense
		const splits = await splitRepo.find({ expense: expenseId });
		if (splits) {
			await splitRepo.bulkRemove({ expense: expenseId });
		}
		await expenseRepo.remove({ id: expenseId });
	}
}

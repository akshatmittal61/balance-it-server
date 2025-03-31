import { HTTP } from "../constants";
import { Logger } from "../log";
import { ExpenseService } from "../services";
import { ApiRequest, ApiResponse } from "../types";
import {
	ApiSuccess,
	genericParse,
	getArray,
	getNonEmptyString,
	safeParse,
} from "../utils";

export class WalletController {
	public static async getExpensesForUser(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const expenses = await ExpenseService.getUserExpenses(userId);
		return ApiSuccess(res).send(expenses);
	}
	public static async getExpensesSummary(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const summary = await ExpenseService.getExpensesSummary(userId);
		return ApiSuccess(res).send(summary);
	}
	public static async createExpense(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const payload = req.body;
		Logger.debug("Creating expense", payload);
		const splits = safeParse(
			getArray<{ user: string; amount: number }>,
			payload.splits
		);
		const created = await ExpenseService.createExpense(
			payload,
			userId,
			splits || []
		);
		Logger.debug("Created expense", created);
		return ApiSuccess(res).send(
			created,
			HTTP.message.SUCCESS,
			HTTP.status.CREATED
		);
	}
	public static async temp(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		Logger.debug("User", req.user);
		const ans = await ExpenseService.temp(userId);
		return ApiSuccess(res).send(ans);
	}
}

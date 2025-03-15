import { ExpenseService } from "../services";
import { ApiRequest, ApiResponse } from "../types";
import { ApiSuccess, genericParse, getNonEmptyString } from "../utils";

export class WalletController {
	public static async getExpensesForUser(req: ApiRequest, res: ApiResponse) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const expenses = await ExpenseService.getUserExpenses(userId);
		return ApiSuccess(res).send(expenses);
	}
}

import { HTTP } from "../constants";
import { ApiResponse } from "../types";

export const ApiSuccess = (res: ApiResponse) => {
	return {
		send: (
			data?: any,
			message: string = HTTP.message.SUCCESS,
			status: number = HTTP.status.SUCCESS
		) => {
			res.status(status).json({ message, data }).end();
		},
	};
};

export const ApiError = (res: ApiResponse) => {
	return {
		send: (
			message: string = HTTP.message.ERROR,
			status: number = HTTP.status.INTERNAL_SERVER_ERROR
		) => {
			res.status(status).json({ message }).end();
		},
	};
};

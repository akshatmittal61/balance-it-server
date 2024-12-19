import { NextFunction } from "express";
import { HTTP } from "../constants";
import { ApiError, DbConnectionError, ParserSafetyError } from "../errors";
import { ApiRequest, ApiResponse } from "../types";

export const errorHandler = (
	error: any,
	_: ApiRequest,
	res: ApiResponse,
	next: NextFunction
) => {
	if (res.headersSent) {
		next(error);
		return;
	}
	if (error instanceof ApiError) {
		res.status(error.status).json({ message: error.message }).end();
	} else if (error instanceof DbConnectionError) {
		res.status(HTTP.status.SERVICE_UNAVAILABLE)
			.json({
				message: error.message || "Unable to connect to database",
			})
			.end();
	} else if (error instanceof ParserSafetyError) {
		res.status(HTTP.status.BAD_REQUEST)
			.json({
				message: HTTP.message.BAD_REQUEST,
			})
			.end();
	} else {
		res.status(HTTP.status.INTERNAL_SERVER_ERROR)
			.json({
				message: error.message || HTTP.message.INTERNAL_SERVER_ERROR,
			})
			.end();
	}
};

import { NextFunction } from "express";
import { HTTP } from "../constants";
import { ApiError, DbConnectionError, ParserSafetyError } from "../errors";
import { ApiRequest, ApiResponse } from "../types";
import { ApiError as ApiFailure } from "../utils";
import { Logger } from "../log";

export const errorHandler = (
	error: any,
	_: ApiRequest,
	res: ApiResponse,
	next: NextFunction
) => {
	Logger.error("Error", error);
	if (res.headersSent) {
		next(error);
		return;
	}
	if (error instanceof ApiError) {
		return ApiFailure(res).send(error.message, error.status);
	} else if (error instanceof DbConnectionError) {
		return ApiFailure(res).send(
			error.message || "Unable to connect to database",
			HTTP.status.SERVICE_UNAVAILABLE
		);
	} else if (error instanceof ParserSafetyError) {
		return ApiFailure(res).send(
			error.message || HTTP.message.BAD_REQUEST,
			HTTP.status.BAD_REQUEST
		);
	} else {
		return ApiFailure(res).send(
			error.message || HTTP.message.INTERNAL_SERVER_ERROR,
			HTTP.status.INTERNAL_SERVER_ERROR
		);
	}
};

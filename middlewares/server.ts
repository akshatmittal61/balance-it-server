import { default as corsMiddleware } from "cors";
import { NextFunction } from "express";
import { DatabaseManager } from "../connections";
import { HTTP } from "../constants";
import { Logger } from "../log";
import { ApiRequest, ApiResponse } from "../types";
import { ApiError } from "../utils";

export const parseCookies = (
	req: ApiRequest,
	_: ApiResponse,
	next: NextFunction
) => {
	const cookie: typeof req.cookies = {};
	const list = req.headers.cookie?.split(";") || [];
	for (const item of list) {
		const parts = item.split("=");
		const key = parts.shift()?.trim() || "";
		if (!key) continue;
		const value = decodeURIComponent(parts.join("="));
		cookie[key] = value;
	}
	req.cookies = cookie;
	return next();
};

export const cors = corsMiddleware({
	origin: "*",
});

export const useDb =
	(db: DatabaseManager) =>
	(_: ApiRequest, res: ApiResponse, next: NextFunction) => {
		if (db.isConnected() === false) {
			Logger.error("Unable to connect to database");
			return db.connect().then((isConnected) => {
				if (isConnected) {
					return next();
				} else {
					return ApiError(res).send(
						HTTP.message.DB_CONNECTION_ERROR,
						HTTP.status.SERVICE_UNAVAILABLE
					);
				}
			});
		}
		return next();
	};

export const tracer = (req: ApiRequest, _: ApiResponse, next: NextFunction) => {
	Logger.info(req.method, req.path, req.params, req.body, req.headers);
	return next();
};

export const profiler = (
	req: ApiRequest,
	res: ApiResponse,
	next: NextFunction
) => {
	const start = process.hrtime(); // Use high-resolution timer

	res.on("finish", () => {
		const end = process.hrtime(start);
		const elapsed = (end[0] * 1e9 + end[1]) / 1e6; // Convert to milliseconds
		Logger.info(
			`Request: ${req.method} ${req.originalUrl} ${res.statusCode} took ${elapsed}ms`
		);
	});

	return next();
};

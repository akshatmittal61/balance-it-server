import { DatabaseManager } from "../connections";
import { HTTP } from "../constants";
import { ApiRequest, ApiResponse } from "../types";
import { ApiError, ApiSuccess } from "../utils";

export class ServerController {
	public static health =
		(db: DatabaseManager) => (_: ApiRequest, res: ApiResponse) => {
			if (db.isConnected() === false) {
				return ApiError(res).send(
					HTTP.message.DB_CONNECTION_ERROR,
					HTTP.status.SERVICE_UNAVAILABLE
				);
			}
			const payload = {
				identity: process.pid,
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: db.isConnected(),
			};
			return ApiSuccess(res).send(payload, HTTP.message.HEALTHY_API);
		};
	public static heartbeat =
		(db: DatabaseManager) => (_: ApiRequest, res: ApiResponse) => {
			const payload = {
				identity: process.pid,
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: db.isConnected(),
			};
			return ApiSuccess(res).send(payload, HTTP.message.HEARTBEAT);
		};
}

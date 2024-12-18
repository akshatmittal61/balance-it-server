import express from "express";
import { Server as HttpServer } from "http";
import { createDbContainer } from "../db";
import { Logger } from "../log";

export class Server {
	private app = express();
	private instance: HttpServer;
	private port: number;
	private container;

	public constructor(port: number, dbUri: string) {
		this.container = createDbContainer(dbUri);
		this.port = port;
		this.instance = new HttpServer(this.app);
	}

	public bindMiddlewares() {
		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
	}

	public createRouter() {}

	public async connectDb() {
		const connectionStatus = await this.container.db.connect();
		if (connectionStatus) {
			Logger.info("MongoDB connected");
		} else {
			Logger.error("Database connection failed");
			Logger.info("Server is running without database");
		}
	}

	public async disconnectDb() {
		await this.container.db.disconnect();
		Logger.info("MongoDB disconnected");
	}

	public async start() {
		this.bindMiddlewares();
		this.createRouter();
		this.instance = this.app.listen(this.port, () => {
			Logger.info(`Server listening on port ${this.port}`);
			this.connectDb();
		});
	}

	public async stop() {
		await this.disconnectDb();
		await new Promise((resolve) => this.instance.close(resolve));
	}

	public getApp() {
		return this.app;
	}
}

import { PORT } from "./config";
import { Server } from "./connections";
import { dbUri } from "./constants";

const server = new Server(PORT, dbUri);
server.start();

import { Request, Response } from "express";
import { User } from "./models";

export type ApiRequest = Request & { user?: User };

export type ApiResponse = Response;

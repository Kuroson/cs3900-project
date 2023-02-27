import { Router } from "express";
import * as controllers from "./index.route";

export const indexRouter = Router();

indexRouter.get("/", controllers.indexController);

import { Router } from "express";
import { registerController } from "./auth/register.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";

export const indexRouter = Router();

indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);
indexRouter.all("/auth/register", registerController);

import { Router } from "express";
import { accessController } from "./access.route";
import { adminController } from "./admin.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";

export const indexRouter = Router();

indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);
indexRouter.get("/admin", adminController);
indexRouter.get("/access", accessController);

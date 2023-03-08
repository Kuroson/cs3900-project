import { Router } from "express";
import { accessController } from "./admin/access.route";
import { adminController } from "./admin/admin.route";
import { registerController } from "./auth/register.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";

export const indexRouter = Router();

indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);
indexRouter.get("/admin", adminController);
indexRouter.get("/admin/access", accessController);
indexRouter.all("/auth/register", registerController);

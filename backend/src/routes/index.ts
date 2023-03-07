import { Router } from "express";
import { registerController } from "./auth/register.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";
import { userDetailsController } from "./user/userDetails.route";

export const indexRouter = Router();

// Base routes
indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);

// Auth routes
indexRouter.all("/auth/register", registerController);

// User routes
indexRouter.all("/user/details", userDetailsController);

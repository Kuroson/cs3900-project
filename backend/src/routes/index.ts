import { Router } from "express";
import { createCourse, getCourse, updateCourse } from "./course/course.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";

export const indexRouter = Router();

indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);

indexRouter.post("/course", createCourse);
indexRouter.get("/course/:coursecode", getCourse);
indexRouter.put("/course/:coursecode", updateCourse);

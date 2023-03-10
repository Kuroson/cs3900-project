import { Router } from "express";
import { accessController } from "./admin/access.route";
import { adminController } from "./admin/admin.route";
import { registerController } from "./auth/register.route";
import { createCourseController } from "./course/createCourse.route";
import { getCourseController } from "./course/getCourse.route";
import { getCoursesController } from "./course/getCourses.route";
import { updateCourseController } from "./course/updateCourse.route";
import { exampleController } from "./example.route";
import { indexController } from "./index.route";
import { userDetailsController } from "./user/userDetails.route";

export const indexRouter = Router();

// Base routes
indexRouter.get("/", indexController);
indexRouter.all("/example", exampleController);

// Auth routes
indexRouter.get("/admin", adminController);
indexRouter.get("/admin/access", accessController);
indexRouter.all("/auth/register", registerController);

// User routes
indexRouter.all("/user/details", userDetailsController);

// Course routes
indexRouter.post("/course", createCourseController);
indexRouter.get("/course", getCoursesController);
indexRouter.get("/course/:courseCode", getCourseController);
indexRouter.put("/course/:courseCode", updateCourseController);

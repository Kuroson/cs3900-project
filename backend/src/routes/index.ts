import { firebaseUpload } from "@/utils/firebase";
import { Router } from "express";
import { accessController } from "./admin/access.route";
import { adminController } from "./admin/admin.route";
import { registerController } from "./auth/register.route";
import { addStudentsController } from "./course/addStudents.route";
import { createCourseController } from "./course/createCourse.route";
import { getAllCoursesController } from "./course/getAllCourses.route";
import { getCourseController } from "./course/getCourse.route";
import { getCoursesController } from "./course/getCourses.route";
import { getStudentsController } from "./course/getStudents.route";
import { removeStudentsController } from "./course/removeStudents.route";
import { updateCourseController } from "./course/updateCourse.route";
import { exampleController } from "./example.route";
import { downloadFileController } from "./file/downloadFile.route";
import { uploadFileController } from "./file/uploadFile.route";
import { indexController } from "./index.route";
import { addResourceController } from "./page/addResource.route";
import { addSectionController } from "./page/addSection.route";
import { createPageController } from "./page/createPage.route";
import { deletePageController } from "./page/deletePage.route";
import { deleteResourceController } from "./page/deleteResource.route";
import { deleteSectionController } from "./page/deleteSection.route";
import { getPageController } from "./page/getPage.route";
import { getPagesController } from "./page/getPages.route";
import { updatePageController } from "./page/updatePage.route";
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
indexRouter.get("/course/all", getAllCoursesController);
indexRouter.get("/course/:courseCode", getCourseController);
indexRouter.put("/course/:courseCode", updateCourseController);
indexRouter.put("/course/students/add", addStudentsController);
indexRouter.put("/course/students/remove", removeStudentsController);
indexRouter.get("/course/students/:courseId", getStudentsController);

// Page routes
indexRouter.post("/page/:courseId", createPageController);
indexRouter.get("/page/:courseId", getPagesController);
indexRouter.delete("/page/:courseId", deletePageController);
indexRouter.put("/page/:courseId/:pageId", updatePageController);
indexRouter.get("/page/:courseId/:pageId", getPageController);
indexRouter.post("/page/:courseId/:pageId/resource", addResourceController);
indexRouter.post("/page/:courseId/:pageId/section", addSectionController);
indexRouter.delete("/page/:courseId/:pageId/resource", deleteResourceController);
indexRouter.delete("/page/:courseId/:pageId/section", deleteSectionController);

// File routes
indexRouter.post("/file/upload", firebaseUpload.single("file"), uploadFileController);
indexRouter.get("/file/download", downloadFileController);

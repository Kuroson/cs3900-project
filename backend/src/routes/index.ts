import { firebaseUpload } from "@/utils/firebase";
import { adminRoute } from "@/utils/util";
import { Router } from "express";
import { accessController } from "./admin/access.route";
import { adminController } from "./admin/admin.route";
import { getGradesController } from "./analytics/getGrades.route";
import { getQuestionAnalyticsController } from "./analytics/getQuestionAnalytics.route";
import { getTagSummaryController } from "./analytics/getTagSummary.route";
import { createAssignmentController } from "./assignment/createAssignment.route";
import { deleteAssignmentController } from "./assignment/deleteAssignment.route";
import { getAssignmentController } from "./assignment/getAssignment.route";
import { getAssignmentSubmissionsController } from "./assignment/getAssignmentSubmissions.route";
import { getAssignmentsController } from "./assignment/getAssignments.route";
import { gradeAssignmentController } from "./assignment/gradeAssignment.route";
import { submitAssignmentController } from "./assignment/submitAssignment.route";
import { addStudentsController } from "./course/addStudents.route";
import { createCourseController } from "./course/createCourse.route";
import { getAllCoursesController } from "./course/getAllCourses.route";
import { getCourseController } from "./course/getCourse.route";
import { getCoursePageController } from "./course/getCoursePage.route";
import { getStudentsController } from "./course/getStudents.route";
import { removeStudentsController } from "./course/removeStudents.route";
import { updateCourseController } from "./course/updateCourse.route";
import { downloadFileController } from "./file/downloadFile.route";
import { uploadFileController } from "./file/uploadFile.route";
import { indexController } from "./index.route";
import { addResourceController } from "./page/addResource.route";
import { addSectionController } from "./page/addSection.route";
import { createPageController } from "./page/createPage.route";
import { deletePageController } from "./page/deletePage.route";
import { deleteResourceController } from "./page/deleteResource.route";
import { deleteSectionController } from "./page/deleteSection.route";
import { getPagesController } from "./page/getPages.route";
import { updatePageController } from "./page/updatePage.route";
import { createQuestionController } from "./quiz/createQuestion.route";
import { createQuizController } from "./quiz/createQuiz.route";
import { deleteQuestionController } from "./quiz/deleteQuestion.route";
import { finishQuizController } from "./quiz/finishQuiz.route";
import { getQuestionsController } from "./quiz/getQuestions.route";
import { getQuizController } from "./quiz/getQuiz.route";
import { getQuizzesController } from "./quiz/getQuizzes.route";
import { getSubmissionsController } from "./quiz/getSubmissions.route";
import { gradeQuestionController } from "./quiz/gradeQuestion.route";
import { startQuizController } from "./quiz/startQuiz.route";
import { updateQuizController } from "./quiz/updateQuiz.route";
import { registerController } from "./user/register.route";
import { userDetailsController } from "./user/userDetails.route";

export const indexRouter = Router();

// Base routes
indexRouter.get("/", indexController);

// Admin routes
indexRouter.get("/admin", adminController);
indexRouter.get("/admin/access", accessController);

// User routes
indexRouter.get("/user/details", userDetailsController);
indexRouter.post("/user/register", registerController);

// Course routes
indexRouter.get("/course", getCourseController);
indexRouter.post("/course/create", createCourseController);
indexRouter.get("/course/all", getAllCoursesController);
indexRouter.put("/course/update", updateCourseController);
indexRouter.get("/course/page", getCoursePageController);
indexRouter.get("/course/students", getStudentsController);
indexRouter.put("/course/students/add", addStudentsController);
indexRouter.put("/course/students/remove", removeStudentsController);

// Page routes
indexRouter.get("/page", getPagesController);
indexRouter.delete("/page", deletePageController);
indexRouter.put("/page/update", updatePageController);
indexRouter.post("/page/create", adminRoute(createPageController));
indexRouter.put("/page/add/resource", addResourceController); // This updates and create, should split up
indexRouter.put("/page/add/section", addSectionController);
indexRouter.delete("/page/remove/resource", deleteResourceController);
indexRouter.delete("/page/removes/section", deleteSectionController);

// File routes
indexRouter.post("/file/upload", firebaseUpload.single("file"), uploadFileController);
indexRouter.get("/file", downloadFileController);

// Quiz routes
indexRouter.get("/quiz/list", getQuizzesController);
indexRouter.get("/quiz", getQuizController);
indexRouter.get("/quiz/questions", getQuestionsController);
indexRouter.post("/quiz/create", createQuizController);
indexRouter.put("/quiz/update", updateQuizController);
indexRouter.post("/quiz/question/create", createQuestionController);
indexRouter.delete("/quiz/question/delete", deleteQuestionController);
indexRouter.get("/quiz/start", startQuizController);
indexRouter.post("/quiz/finish", finishQuizController);
indexRouter.get("/quiz/submissions", getSubmissionsController);
indexRouter.post("/quiz/question/grade", gradeQuestionController);

// Assignment routes
indexRouter.get("/assignment/list", getAssignmentsController);
indexRouter.get("/assignment", getAssignmentController);
indexRouter.post("/assignment/create", createAssignmentController);
indexRouter.delete("/assignment/delete", deleteAssignmentController);
indexRouter.post("/assignment/submit", firebaseUpload.single("file"), submitAssignmentController);
indexRouter.get("/assignment/submissions", getAssignmentSubmissionsController);
indexRouter.post("/assignment/grade", gradeAssignmentController);

// Analytics routes
indexRouter.get("/analytics/grades", getGradesController);
indexRouter.get("/analytics/tags/summary", getTagSummaryController);
indexRouter.get("/analytics/questions", getQuestionAnalyticsController);

import { firebaseUpload } from "@/utils/firebase";
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
import { updateAssignmentController } from "./assignment/updateAssignment.route";
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
import { createPostController } from "./forum/createPost.route";
import { createResponseController } from "./forum/createResponse.route";
import { getForumController } from "./forum/getForum.route";
import { markCorrectResponseController } from "./forum/markCorrectResponse.route";
import { indexController } from "./index.route";
import { createOnlineClassController } from "./onlineClasses/createOnlineClass.route";
import { disableChatOnlineClassController } from "./onlineClasses/disableChatOnlineClass.route";
import { enableChatOnlineClassController } from "./onlineClasses/enableChatOnlineClass.route";
import { endOnlineClassController } from "./onlineClasses/endOnlineClass.route";
import { getListOnlineClassController } from "./onlineClasses/getListOnlineClass.route";
import { getOnlineClassController } from "./onlineClasses/getOnlineClass.route";
import { sendChatMessageController } from "./onlineClasses/sendMessageOnlineClass.route";
import { startOnlineClassController } from "./onlineClasses/startOnlineClass.route";
import { updateOnlineClassController } from "./onlineClasses/updateOnlineClass.route";
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
import { completeTaskController } from "./workloadOverview/completeTask.route";
import { createTaskController } from "./workloadOverview/createTask.route";
import { createWeekController } from "./workloadOverview/createWeek.route";
import { deleteTaskController } from "./workloadOverview/deleteTask.route";
import { deleteWeekController } from "./workloadOverview/deleteWeek.route";
import { getWeekController } from "./workloadOverview/getWeek.route";
import { getWorkloadController } from "./workloadOverview/getWorkload.route";
import { updateTaskController } from "./workloadOverview/updateTask.route";
import { updateWeekController } from "./workloadOverview/updateWeek.route";

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
indexRouter.post("/page/create", createPageController);
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

//Workload Overview routes
indexRouter.post("/workload/week/create", createWeekController);
indexRouter.post("/workload/task/create", createTaskController);
indexRouter.get("/workload/week", getWeekController);
indexRouter.get("/workload", getWorkloadController);
indexRouter.put("/workload/task/update", updateTaskController);
indexRouter.put("/workload/week/update", updateWeekController);
indexRouter.delete("/workload/task/delete", deleteTaskController);
indexRouter.delete("/workload/week/delete", deleteWeekController);
indexRouter.post("/workload/task/complete", completeTaskController);

// Assignment routes
indexRouter.get("/assignment/list", getAssignmentsController);
indexRouter.get("/assignment", getAssignmentController);
indexRouter.post("/assignment/create", createAssignmentController);
indexRouter.delete("/assignment/delete", deleteAssignmentController);
indexRouter.put("/assignment/update", updateAssignmentController);
indexRouter.post("/assignment/submit", firebaseUpload.single("file"), submitAssignmentController);
indexRouter.get("/assignment/submissions", getAssignmentSubmissionsController);
indexRouter.post("/assignment/grade", gradeAssignmentController);

// Analytics routes
indexRouter.get("/analytics/grades", getGradesController);
indexRouter.get("/analytics/tags/summary", getTagSummaryController);
indexRouter.get("/analytics/questions", getQuestionAnalyticsController);

// Online Classes Routes
indexRouter.get("/class", getOnlineClassController);
indexRouter.get("/class/list", getListOnlineClassController);
indexRouter.post("/class/schedule", createOnlineClassController);
indexRouter.put("/class/update", updateOnlineClassController);
indexRouter.put("/class/start", startOnlineClassController);
indexRouter.put("/class/end", endOnlineClassController);
indexRouter.post("/class/chat/send", sendChatMessageController);
indexRouter.put("/class/chat/enable", enableChatOnlineClassController);
indexRouter.put("/class/chat/disable", disableChatOnlineClassController);

//Forum routes
indexRouter.get("/forum", getForumController);
indexRouter.post("/forum/post", createPostController);
indexRouter.post("/forum/respond", createResponseController);
indexRouter.post("/forum/post/correct", markCorrectResponseController);

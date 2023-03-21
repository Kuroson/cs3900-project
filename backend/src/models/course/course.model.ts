import { Document, Schema, Types, model } from "mongoose";
import { UserInterface } from "../user.model";
import { AssignmentInterface } from "./assignment/assignment.model";
import { EnrolmentInterface } from "./enrolment/enrolment.model";
import { ForumInterface } from "./forum/forum.model";
import { OnlineClassInterface } from "./onlineClass/onlineClass.model";
import { PageInterface } from "./page/page.model";
import { QuizInterface } from "./quiz/quiz.model";
import { WorkloadOverviewInterface } from "./workloadOverview/WorkloadOverview.model";

/**
 * Model to represent a course in the system
 * A course has some base information (title, code, description,
 * session it is running in, icon, and instructor who made it)
 *
 * A course is split up to have many pages that can have information added to them
 */
export interface CourseInterface extends Document {
    title: string;
    code: string;
    description?: string;
    session: string;
    icon?: string;
    creator: UserInterface["_id"];
    students: Types.DocumentArray<EnrolmentInterface["_id"]>;
    pages: Types.DocumentArray<PageInterface["_id"]>;
    onlineClasses: Types.DocumentArray<OnlineClassInterface["_id"]>;
    forum: ForumInterface["_id"];
    quizzes: Types.DocumentArray<QuizInterface["_id"]>;
    assignments: Types.DocumentArray<AssignmentInterface["_id"]>;
    workloadOverview: WorkloadOverviewInterface["_id"];
    tags: Types.Array<string>;
}

const courseSchema: Schema = new Schema<CourseInterface>({
    title: { type: String, required: true },
    code: { type: String, required: true },
    description: { type: String },
    session: { type: String, required: true },
    icon: { type: String },
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "Enrolment", required: true }],
    pages: [{ type: Schema.Types.ObjectId, ref: "Page", required: true }],
    onlineClasses: [{ type: Schema.Types.ObjectId, ref: "OnlineClass", required: true }],
    forum: { type: Schema.Types.ObjectId, ref: "Forum", required: true },
    quizzes: [{ type: Schema.Types.ObjectId, ref: "Page", required: true }],
    assignments: [{ type: Schema.Types.ObjectId, ref: "Page", required: true }],
    workloadOverview: { type: Schema.Types.ObjectId, ref: "Page", required: true },
    tags: [{ type: String, required: true }],
});

const Course = model<CourseInterface & Document>("Course", courseSchema);

export default Course;

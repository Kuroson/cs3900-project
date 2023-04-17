import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test create online class", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    beforeAll(async () => {
        await initialiseMongoose();

        await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
        courseId = await createCourse(
            {
                code: "TEST",
                title: "Test",
                session: "T1",
                description: "This is a test course",
                icon: "",
            },
            `acc${id}`,
        );

        expect(typeof courseId).toEqual("string");
    });

    it("Create online class with invalid courseId", async () => {
        expect(
            createOnlineClass(
                "invalidCourseId",
                onlineClassTitle,
                onlineClassDescription,
                onlineClassDate,
                onlineClassLink,
            ),
        ).rejects.toThrow(HttpException);
    });

    it("Create an online class and check it exists in course", async () => {
        onlineClassId = await createOnlineClass(
            courseId,
            onlineClassTitle,
            onlineClassDescription,
            onlineClassDate,
            onlineClassLink,
        );
        expect(typeof onlineClassId).toEqual("string");

        // Get course and check if id exists in courseDetails
        const courseDetails = await Course.findById(courseId).catch(() => null);
        expect(courseDetails).not.toBeNull();
        expect(courseDetails?.onlineClasses.includes(onlineClassId)).toEqual(true);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});

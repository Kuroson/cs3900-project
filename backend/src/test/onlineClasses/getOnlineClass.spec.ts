import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { getClassFromId } from "@/routes/onlineClasses/getOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test get online class", () => {
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
        onlineClassId = await createOnlineClass(
            courseId,
            onlineClassTitle,
            onlineClassDescription,
            onlineClassDate,
            onlineClassLink,
        );
    });

    it("Get online class with invalid courseId should throw HttpException", async () => {
        expect(getClassFromId("bad id")).rejects.toThrow(HttpException);
    });

    it("Get a valid online class", async () => {
        const data = await getClassFromId(onlineClassId);
        expect(data.title).toEqual(onlineClassTitle);
        expect(data.description).toEqual(onlineClassDescription);
        expect(data.linkToClass).toEqual(onlineClassLink);
        expect(data.startTime).toEqual(onlineClassDate);
        expect(data.running).toEqual(false);
        expect(data.chatMessages).toEqual([]);
        expect(data.chatEnabled).toEqual(true);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});

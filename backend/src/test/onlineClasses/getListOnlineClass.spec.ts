import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { getClassList } from "@/routes/onlineClasses/getListOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose from "../testUtil";

describe("Test get list of online classes", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;
    let onlineClassId2;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    const onlineClassTitle2 = "Test online class 2";
    const onlineClassDescription2 = "This is the description 2";
    const onlineClassLink2 = "https://www.youtube.com/watch?v=dQw4w9WgXcQ2";
    const onlineClassDate2: number = Date.now() + 69;

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
        onlineClassId2 = await createOnlineClass(
            courseId,
            onlineClassTitle2,
            onlineClassDescription2,
            onlineClassDate2,
            onlineClassLink2,
        );
    });

    it("Get class list of bad courseId", () => {
        expect(getClassList("bad id")).rejects.toThrow(HttpException);
    });

    it("Get course's class list and check if it contains the correct classes", async () => {
        const data = await getClassList(courseId);
        expect(data.length).toEqual(2);
        expect(data[0].title).toEqual(onlineClassTitle);
        expect(data[0].description).toEqual(onlineClassDescription);
        expect(data[0].linkToClass).toEqual(onlineClassLink);
        expect(data[0].startTime).toEqual(onlineClassDate);
        expect(data[0].running).toEqual(false);
        expect(data[0].chatMessages).toBeUndefined();
        expect(data[1].title).toEqual(onlineClassTitle2);
        expect(data[1].description).toEqual(onlineClassDescription2);
        expect(data[1].linkToClass).toEqual(onlineClassLink2);
        expect(data[1].startTime).toEqual(onlineClassDate2);
        expect(data[1].chatMessages).toBeUndefined();
        expect(data[1].running).toEqual(false);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.deleteMany({ _id: [onlineClassId, onlineClassId2] }).exec();
        await disconnect();
    });
});

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
import { updateOnlineClassDetails } from "./../../routes/onlineClasses/updateOnlineClass.route";

describe("Test update online class", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    const onlineClassTitleUpdated = "Test online class updated";
    const onlineClassDescriptionUpdated = "This is the description updated";
    const onlineClassLinkUpdated = "https://www.youtube.com/watch?v=dQw4w9WgXcQ2";
    const onlineClassDateUpdated: number = Date.now() + 69;

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

    it("Updating online class details with bad id should fail", async () => {
        expect(
            updateOnlineClassDetails(
                "badClassId",
                onlineClassTitleUpdated,
                onlineClassDescriptionUpdated,
                onlineClassDateUpdated,
                onlineClassLinkUpdated,
            ),
        ).rejects.toThrow(HttpException);
        const data = await getClassFromId(onlineClassId);
        expect(data.title).toEqual(onlineClassTitle);
        expect(data.description).toEqual(onlineClassDescription);
        expect(data.linkToClass).toEqual(onlineClassLink);
        expect(data.startTime).toEqual(onlineClassDate);
        expect(data.running).toEqual(false);
        expect(data.chatMessages).toEqual([]);
    });

    it("Update online class successfully", async () => {
        await updateOnlineClassDetails(
            onlineClassId,
            onlineClassTitleUpdated,
            onlineClassDescriptionUpdated,
            onlineClassDateUpdated,
            onlineClassLinkUpdated,
        );

        const data = await getClassFromId(onlineClassId);
        expect(data.title).toEqual(onlineClassTitleUpdated);
        expect(data.description).toEqual(onlineClassDescriptionUpdated);
        expect(data.linkToClass).toEqual(onlineClassLinkUpdated);
        expect(data.startTime).toEqual(onlineClassDateUpdated);
        expect(data.running).toEqual(false);
        expect(data.chatMessages).toEqual([]);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});

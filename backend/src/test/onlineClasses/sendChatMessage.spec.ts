import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { getClassFromId } from "@/routes/onlineClasses/getOnlineClass.route";
import { addNewChatMessage } from "@/routes/onlineClasses/sendMessageOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test start online class", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;
    let userId;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    const chatMessage1 = "This is a test message";
    const chatMessage2 = "This is a test message2";

    beforeAll(async () => {
        await initialiseMongoose();

        userId = await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
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

    it("Bad ids should fail", async () => {
        expect(addNewChatMessage("badClassId", userId, chatMessage1, courseId)).rejects.toThrow(
            HttpException,
        );
        expect(
            addNewChatMessage(onlineClassId, "badUserId", chatMessage1, courseId),
        ).rejects.toThrow(HttpException);
        const data = await getClassFromId(onlineClassId);
        expect(data.chatMessages).toEqual([]);
    });

    it("Send chat message successfully", async () => {
        await addNewChatMessage(onlineClassId, `acc${id}`, chatMessage1, courseId);
        let data = await getClassFromId(onlineClassId);
        expect(data.chatMessages.length).toEqual(1);
        expect(data.chatMessages[0].message).toEqual(chatMessage1);
        expect(data.chatMessages[0].sender.toString()).toEqual(userId);

        await addNewChatMessage(onlineClassId, `acc${id}`, chatMessage2, courseId);
        data = await getClassFromId(onlineClassId);
        expect(data.chatMessages.length).toEqual(2);
        expect(data.chatMessages[0].message).toEqual(chatMessage1);
        expect(data.chatMessages[0].sender.toString()).toEqual(userId);
        expect(data.chatMessages[1].message).toEqual(chatMessage2);
        expect(data.chatMessages[1].sender.toString()).toEqual(userId);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteOne({ firebase_uid: `acc${id}` }).exec();
        await Course.findByIdAndDelete(courseId).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});

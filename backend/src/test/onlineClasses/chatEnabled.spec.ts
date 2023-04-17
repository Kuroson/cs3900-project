import { disconnect } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { HttpException } from "@/exceptions/HttpException";
import Course from "@/models/course/course.model";
import OnlineClass from "@/models/course/onlineClass/onlineClass.model";
import User from "@/models/user.model";
import { createCourse } from "@/routes/course/createCourse.route";
import { createOnlineClass } from "@/routes/onlineClasses/createOnlineClass.route";
import { updateChatEnabled } from "@/routes/onlineClasses/enableChatOnlineClass.route";
import { getClassFromId } from "@/routes/onlineClasses/getOnlineClass.route";
import { addNewChatMessage } from "@/routes/onlineClasses/sendMessageOnlineClass.route";
import { registerUser } from "@/routes/user/register.route";
import initialiseMongoose from "../testUtil";

describe("Test start online class", () => {
    const id = uuidv4();

    let courseId;
    let onlineClassId;
    let userId;
    let studentId;

    const onlineClassTitle = "Test online class";
    const onlineClassDescription = "This is the description";
    const onlineClassLink = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const onlineClassDate: number = Date.now();

    const chatMessage1 = "This is a test message";
    const chatMessage2 = "This is a test message2";

    beforeAll(async () => {
        await initialiseMongoose();

        userId = await registerUser("first_name", "last_name", `admin${id}@email.com`, `acc${id}`);
        studentId = await registerUser(
            "first_name",
            "last_name",
            `student${id}@email.com`,
            `acc1${id}`,
        );
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

    it("Disable and enable Chat", async () => {
        await updateChatEnabled(onlineClassId, false);
        expect((await getClassFromId(onlineClassId)).chatEnabled).toEqual(false);

        await updateChatEnabled(onlineClassId, true);
        expect((await getClassFromId(onlineClassId)).chatEnabled).toEqual(true);

        // await addNewChatMessage(onlineClassId, `acc${id}`, chatMessage1);
        // let data = await getClassFromId(onlineClassId);
        // expect(data.chatMessages.length).toEqual(1);
        // expect(data.chatMessages[0].message).toEqual(chatMessage1);
        // expect(data.chatMessages[0].sender.toString()).toEqual(userId);
        // await addNewChatMessage(onlineClassId, `acc${id}`, chatMessage2);
        // data = await getClassFromId(onlineClassId);
        // expect(data.chatMessages.length).toEqual(2);
        // expect(data.chatMessages[0].message).toEqual(chatMessage1);
        // expect(data.chatMessages[0].sender.toString()).toEqual(userId);
        // expect(data.chatMessages[1].message).toEqual(chatMessage2);
        // expect(data.chatMessages[1].sender.toString()).toEqual(userId);
    });

    it("Instructor should be able to send a message when chat is disabled", async () => {
        await updateChatEnabled(onlineClassId, false);
        expect((await getClassFromId(onlineClassId)).chatEnabled).toEqual(false);
        await addNewChatMessage(onlineClassId, `acc${id}`, chatMessage1, courseId);
        const data = await getClassFromId(onlineClassId);
        expect(data.chatMessages.length).toEqual(1);
        expect(data.chatMessages[0].message).toEqual(chatMessage1);
        expect(data.chatMessages[0].sender.toString()).toEqual(userId);
    });

    it("Student should not be able to send a message when chat is disabled", async () => {
        let data = await getClassFromId(onlineClassId);
        const numMessagesBefore = data.chatMessages.length;
        await updateChatEnabled(onlineClassId, false);
        expect((await getClassFromId(onlineClassId)).chatEnabled).toEqual(false);
        expect(
            addNewChatMessage(onlineClassId, `acc1${id}`, chatMessage1, courseId),
        ).rejects.toThrow(HttpException);
        data = await getClassFromId(onlineClassId);
        expect(data.chatMessages.length).toEqual(numMessagesBefore);
    });

    afterAll(async () => {
        // Clean up
        await User.deleteMany({ firebase_uid: [`acc${id}`, `acc1${id}`] }).exec();
        await Course.findByIdAndDelete([]).exec();
        await OnlineClass.findByIdAndDelete(onlineClassId).exec();
        await disconnect();
    });
});

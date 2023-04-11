import { addStudents } from "@/routes/course/addStudents.route";
import { createCourse } from "@/routes/course/createCourse.route";
import { v4 as uuidv4 } from "uuid";
import initialiseMongoose, { genUserTestOnly, registerMultipleUsersTestingOnly } from "../testUtil";

/**
 * Basic functionality requires end to end to work
 * We want this function to return a
 *
 */

describe("Test getting a list of Students and Kudos ranked based on kudos", () => {
    const id = uuidv4();
    let courseId: string;

    const admin = genUserTestOnly("admin_name", "admin_name", `admin${id}@email.com`, `acc${id}`);

    const userData = [
        admin,
        genUserTestOnly("first_name1", "last_name1", `student1${id}@email.com`, `acc1${id}`),
        genUserTestOnly("first_name2", "last_name2", `student2${id}@email.com`, `acc2${id}`),
        genUserTestOnly("first_name3", "last_name3", `student3${id}@email.com`, `acc3${id}`),
    ];

    beforeAll(async () => {
        await initialiseMongoose();
        await registerMultipleUsersTestingOnly(userData);

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

        await addStudents(
            courseId,
            [`student1${id}@email.com`, `student2${id}@email.com`, `student3${id}@email.com`],
            admin.firebaseUID,
        );
    });
});

import { disconnect } from "mongoose";
import { isValidBody } from "@/utils/util";

describe("Test Util Body Parser", () => {
    type Payload = {
        name: string;
        age: number;
    };

    it("Test normal case", () => {
        const body = { name: "John", age: 20 };
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(true);
    });

    it("Missing fields", () => {
        const body = { name: "John" };
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(false);
    });

    it("No fields", () => {
        const body = {};
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(false);
    });

    it("Extra fields", () => {
        const body = { name: "John", age: 20, useless: "stuff" };
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(true);
    });

    it("Extra fields and missing fields", () => {
        const body = { name: "John", useless: "stuff" };
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(false);
    });

    it("Keys are not strings", () => {
        const body = { name: "John", age: 20, 1: 1 };
        expect(isValidBody<Payload>(body, ["name", "age"])).toBe(true);
    });

    afterAll(async () => {
        await disconnect();
    });
});

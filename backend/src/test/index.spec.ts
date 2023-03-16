import { disconnect } from "mongoose";
import request from "supertest";
import { app } from "../app";

describe("GET /", () => {
    it("should return 200 OK", () => {
        return request(app).get("/").expect(200);
    });

    afterAll(async () => {
        await disconnect();
    });
});

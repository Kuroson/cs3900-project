import { disconnect } from "mongoose";
import request from "supertest";
import { app } from "../app";

describe("Error page", () => {
    it("should return 404 for not existing page", () => {
        return request(app)
            .get("/fake-page")
            .expect(404)
            .then((res) => {
                expect(res.body).toEqual({ message: "Route does not exist" });
            });
    });

    afterAll(async () => {
        await disconnect();
    });
});

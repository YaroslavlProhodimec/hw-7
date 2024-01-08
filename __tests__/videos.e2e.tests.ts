import request from "supertest";
import { StatusCodes } from "http-status-codes";
import { app } from "../src/settings";
import { TVideo } from "../src/dto/videosDTO/CreateVideoModel";

describe("videos router", () => {
  beforeAll(async () => {
    await request(app).delete("/api/testing/all-data");
  });

  test("should return 200 status and list of videos", async () => {
    await request(app).get("/api/videos").expect(200, []);
  });

  test("should return 400 if body was not provided and a new video shouldn't be created", async () => {
    await request(app)
      .post("/api/videos")
      .send({})
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "Please include a valid title",
            field: "title",
          },
          {
            message: "Please include a valid author",
            field: "author",
          },
          {
            message: "Please include at least 1 resolution",
            field: "availableResolutions",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual([]);
  });

  test("should return 400 if title was not provided and a new video shouldn't be created", async () => {
    await request(app)
      .post("/api/videos")
      .send({
        author: "valid author",
        availableResolutions: ["P144", "P240", "P720"],
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "Please include a valid title",
            field: "title",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual([]);
  });

  test("should return 400 if title is null and a new video shouldn't be created", async () => {
    await request(app)
      .post("/api/videos")
      .send({
        title: null,
        author: "valid author",
        availableResolutions: ["P144", "P240", "P720"],
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "Please include a valid title",
            field: "title",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual([]);
  });

  test("should return 400 if author's length is bigger than 20", async () => {
    await request(app)
      .post("/api/videos")
      .send({
        title: "Intellectual games",
        author: "11111111111111111111111111111111111111111111111111111111",
        availableResolutions: ["P144"],
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "author's maximum length must be 20",
            field: "author",
          },
        ],
      });
    const getAllExistingCourses = await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual([]);
  });

  test("should return 400 if resolution is incorrect", async () => {
    await request(app)
      .post("/api/videos")
      .send({
        title: "Intellectual games",
        author: "Newton",
        availableResolutions: ["P148"],
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: `Resolution P148 is invalid`,
            field: "availableResolutions",
          },
        ],
      });
  });

  let createdVideo1: TVideo;
  test("should return status code 201 and newly created course", async () => {
    const createResponse = await request(app)
      .post("/api/videos")
      .send({
        title: "Great girl",
        author: "Cat Ricky",
        availableResolutions: ["P144"],
      })
      .expect(StatusCodes.CREATED)
      .expect("Content-Type", "application/json; charset=utf-8");
    createdVideo1 = createResponse.body;
    expect(createdVideo1.title).toEqual("Great girl");
    expect(createdVideo1.author).toEqual("Cat Ricky");
    expect(createdVideo1.availableResolutions).toEqual(["P144"]);
    const getAllExistingCourses = await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual([createdVideo1]);
  });

  test("SHOULDN'T DELETE video if ID is wrong", async () => {
    await request(app)
      .delete("/api/videos/99999999")
      .expect(StatusCodes.NOT_FOUND);
    await request(app)
      .get("/api/videos")
      .expect(StatusCodes.OK, [createdVideo1]);
  });

  test("DELETE video by ID", async () => {
    await request(app)
      .delete("/api/videos/" + createdVideo1.id)
      .expect(StatusCodes.NO_CONTENT);
    await request(app)
      .get("/api/videos/" + createdVideo1.id)
      .expect(StatusCodes.NOT_FOUND);
    await request(app).get("/api/videos/").expect(StatusCodes.OK, []);
  });
});

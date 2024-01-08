import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";
import { PostViewModel } from "../src/dto/postsDTO/PostModel";
import { BlogViewModel } from "../src/dto/blogsDTO/BlogModel";

const correctAuthToken = "YWRtaW46cXdlcnR5";
const incorrectAuthToken = "YWRtaW46c864XdlcnR5=5";

describe("API for posts", () => {
  let createdBlog: BlogViewModel;
  let createdPost1: PostViewModel;
  let createdPost2: PostViewModel;
  beforeAll(async () => {
    await request(app).delete("/api/testing/all-data");
  });
  test("GET list of posts with status 200", async () => {
    await request(app).get("/api/posts").expect(StatusCodes.OK, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD NOT create a new post with incorrect input data and return status 400", async () => {
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({})
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "title field is required",
            field: "title",
          },
          {
            message: "shortDescription field is required",
            field: "shortDescription",
          },
          {
            message: "content field is required",
            field: "content",
          },
          {
            message: "blogId field is required",
            field: "blogId",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD NOT create a new post with incorrect AUTH TYPE and return status 401", async () => {
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .send({})
      .expect(StatusCodes.UNAUTHORIZED, {});

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD NOT create a new post with incorrect Auth token and return status 401", async () => {
    await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({})
      .expect(StatusCodes.UNAUTHORIZED, {});

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD CREATE NEW POST", async () => {
    const blog = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Stas",
        description: "Tania blog for posts tests",
        websiteUrl:
          "https://MbkyQDhuICIaHnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.CREATED);
    createdBlog = blog.body;
    let inputData = {
      title: "Tatiana",
      shortDescription: "Who run the world",
      content: "ggggggggggggggggggggggggggggggg",
      blogId: blog.body.id,
    };
    const postResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send(inputData)
      .expect(StatusCodes.CREATED);
    expect(postResponse.body.content).toEqual(
      "ggggggggggggggggggggggggggggggg"
    );
    createdPost1 = postResponse.body;
    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(1);
  });

  test("Should not Create a new post with incorrect input values and return status 400", async () => {
    const postResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: null,
        shortDescription: 0,
        content: true,
        blogId: 765,
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "title should be of type String",
            field: "title",
          },
          {
            message: "shortDescription should be of type String",
            field: "shortDescription",
          },
          {
            message: "content should be of type String",
            field: "content",
          },
          {
            message: "blogId should be of type String",
            field: "blogId",
          },
        ],
      });
    expect(postResponse.body.title).toBeUndefined();

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[1]).toEqual(undefined);
  });

  test("GET post ID with 404 status", async () => {
    await request(app).get("/api/posts/125").expect(StatusCodes.NOT_FOUND);
  });

  test("GET post ID with 200 status", async () => {
    await request(app)
      .get(`/api/posts/${createdPost1.id}`)
      .expect(StatusCodes.OK);
  });

  test("CREATE a second new POST with CORRECT input data and return status 201", async () => {
    const postResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: "Valery",
        shortDescription: "Valery is the Hockey World Champion",
        content:
          "I love Valery so much - he is the symbol of bravery and power and talent and hard work and Passion",
        blogId: createdBlog.id,
      })
      .expect(StatusCodes.CREATED);
    createdPost2 = postResponse.body;
    expect(postResponse.body.shortDescription).toEqual(
      "Valery is the Hockey World Champion"
    );

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(2);
  });

  test("Should return Unauthorized status 401 cos' auth token is incorrect", async () => {
    await request(app)
      .delete(`/api/posts/${createdPost2.id}`)
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .expect(StatusCodes.UNAUTHORIZED);
    const getResponse = (await request(app).get("/api/posts")).body;
    expect(getResponse.items.length).toEqual(2);
    expect(getResponse.items[1].title).toEqual("Tatiana");
  });

  test("Should return NOT_FOUND status 404 with incorrect ID", async () => {
    await request(app)
      .delete("/api/posts/123")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NOT_FOUND);
    const getResponse = (await request(app).get("/api/posts")).body;
    expect(getResponse.items.length).toEqual(2);
    expect(getResponse.items[0].title).toEqual("Valery");
  });

  test("Should delete post by ID with correct ID", async () => {
    await request(app)
      .delete(`/api/posts/${createdPost2.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NO_CONTENT);
    const getResponse = (await request(app).get("/api/posts")).body;
    expect(getResponse.items.length).toEqual(1);
    expect(getResponse.items[0].title).toEqual("Tatiana");
  });

  test("Should update post with all input body fields and return status 204", async () => {
    const postResponse = await request(app)
      .put(`/api/posts/${createdPost1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: "new Tania",
        shortDescription: "experimenting with life",
        content: "that is a great story",
        blogId: createdBlog.id,
      })
      .expect(StatusCodes.NO_CONTENT);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].title).toEqual("new Tania");
    expect(getAllExistingCourses.body.items[0].shortDescription).toEqual(
      "experimenting with life"
    );
  });

  test("Shouldn't update blog with incorrect Auth Type -  status 401", async () => {
    const postResponse = await request(app)
      .put(`/api/posts/${createdPost1.id}`)
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .send({
        title: "old jumanji movie",
        shortDescription: "experimenting with MY life",
        content: "that is a great story to be discussed",
        blogId: createdBlog.id,
      })
      .expect(StatusCodes.UNAUTHORIZED);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].title).toEqual("new Tania");
    expect(getAllExistingCourses.body.items[0].shortDescription).toEqual(
      "experimenting with life"
    );
  });

  test("Shouldn't update blog with incorrect Auth Value -  status 401", async () => {
    const postResponse = await request(app)
      .put(`/api/posts/${createdPost1.id}`)
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({
        title: "old wine is better",
        shortDescription: "experimenting with MY life",
        content: "that is a great story to be discussed",
        blogId: createdBlog.id,
      })
      .expect(StatusCodes.UNAUTHORIZED);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].title).toEqual("new Tania");
    expect(getAllExistingCourses.body.items[0].shortDescription).toEqual(
      "experimenting with life"
    );
  });

  test("Shouldn't update blog with missing input values -  status 400", async () => {
    await request(app)
      .put(`/api/posts/${createdPost1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({})
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "title field is required",
            field: "title",
          },
          {
            message: "shortDescription field is required",
            field: "shortDescription",
          },
          {
            message: "content field is required",
            field: "content",
          },
          {
            message: "blogId field is required",
            field: "blogId",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].title).toEqual("new Tania");
    expect(getAllExistingCourses.body.items[0].shortDescription).toEqual(
      "experimenting with life"
    );
  });

  test("Shouldn't UPDATE post with missing content and shortDescription -  status 400", async () => {
    await request(app)
      .put(`/api/posts/${createdPost1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: "old wine is better",
        blogId: createdBlog.id,
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "shortDescription field is required",
            field: "shortDescription",
          },
          {
            message: "content field is required",
            field: "content",
          }
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].title).toEqual("new Tania");
    expect(getAllExistingCourses.body.items[0].shortDescription).toEqual(
      "experimenting with life"
    );
  });
  test("CREATE a new post with CORRECT input data and return status 201", async () => {
    let inputData = {
      title: "Nadin",
      shortDescription: "Nadin runs the world",
      content: "My lovely daughter is amazing!!!",
      blogId: createdBlog.id,
    };
    const postResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send(inputData)
      .expect(StatusCodes.CREATED);
    expect(postResponse.body.content).toEqual(
      "My lovely daughter is amazing!!!"
    );
    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(2);
  });
  test("CREATE a new post with CORRECT input data and return status 201", async () => {
    let inputData = {
      title: "Svetlana",
      shortDescription: "Svetlana runs the world",
      content: "My lovely mommy is wonderful and the only one!!!",
      blogId: createdBlog.id,
    };
    const postResponse = await request(app)
      .post("/api/posts")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send(inputData)
      .expect(StatusCodes.CREATED);
    expect(postResponse.body.content).toEqual(
      "My lovely mommy is wonderful and the only one!!!"
    );
    const getAllExistingCourses = await request(app)
      .get("/api/posts")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(3);
  });
  test("GET list of posts with sorting in ascending order", async () => {
    const result = await request(app)
      .get("/api/posts?sortBy=title&sortDirection=asc")
      .expect(StatusCodes.OK);
    expect(result.body.items[0].title).toEqual("Nadin");
    expect(result.body.items[2].title).toEqual("new Tania");
    expect(result.body.items.length).toEqual(3);
  });
  test("GET list of posts with paging", async () => {
    const result = await request(app)
      .get("/api/posts?pageSize=2&pageNumber=2&sortBy=title&sortDirection=asc")
      .expect(StatusCodes.OK);
    expect(result.body.page).toEqual(2);
    expect(result.body.pagesCount).toEqual(2);
    expect(result.body.items.length).toEqual(1);
    expect(result.body.items[0].title).toEqual("new Tania");
  });
});
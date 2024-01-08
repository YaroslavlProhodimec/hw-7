import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";
import { BlogViewModel } from "../src/dto/blogsDTO/BlogModel";

const correctAuthToken = "YWRtaW46cXdlcnR5";
const incorrectAuthToken = "YWRtaW46c864XdlcnR5=5";

describe("API for blogs", () => {
  beforeAll(async () => {
    await request(app).delete("/api/testing/all-data");
  });
  test("GET list of blogs with status 200", async () => {
    await request(app).get("/api/blogs").expect(StatusCodes.OK, {
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });
  test("SHOULD NOT create a new blog with incorrect input data and return status 400", async () => {
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({})
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "name field is required",
            field: "name",
          },
          {
            message: "description field is required",
            field: "description",
          },
          {
            message: "websiteUrl field is required",
            field: "websiteUrl",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD NOT create a new blog with incorrect AUTH TYPE and return status 401", async () => {
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .send({})
      .expect(StatusCodes.UNAUTHORIZED, {});

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  test("SHOULD NOT create a new blog with incorrect Auth token and return status 401", async () => {
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({})
      .expect(StatusCodes.UNAUTHORIZED, {});

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 0,
      items: [],
    });
  });

  let createdBlog1: BlogViewModel;
  let createdBlog2: BlogViewModel;
  test("Create a new blog with correct input data and return status 201", async () => {
    const postResponse = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "fff",
        description: "koala is about blog 1. That's it",
        websiteUrl:
          "https://MbkyQDhuICIaHnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.CREATED);
    createdBlog1 = postResponse.body;
    expect(createdBlog1.name).toEqual("fff");
    expect(createdBlog1.isMembership).toEqual(false);

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(1);
  });
  test("Create a new blog with incorrect input name and return status 400", async () => {
    const postResponse = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "",
        description: "koala is about blog 1. That's it",
        websiteUrl:
          "https://MbkyQDhuICIaHnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "name must be included in request body",
            field: "name",
          },
        ],
      });
    expect(postResponse.body.name).toBeUndefined();

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(1);
  });

  test("Create a new blog with incorrect input website and description and return status 400", async () => {
    await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Nadine",
        description: null,
        websiteUrl:
          "http://MbkyQDhuICIaHnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "description should be of type String",
            field: "description",
          },
          {
            message: "Url is incorrect",
            field: "websiteUrl",
          },
        ],
      });
    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);
    expect(getAllExistingCourses.body.items.length).toEqual(1);
  });

  test("GET blog ID with 404 status", async () => {
    await request(app).get("/api/blogs/125").expect(StatusCodes.NOT_FOUND);
  });

  test("GET blog ID with 200 status", async () => {
    await request(app)
      .get(`/api/blogs/${createdBlog1.id}`)
      .expect(StatusCodes.OK);
  });

  test("Create second new blog with correct input data and return status 201", async () => {
    const postResponse = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Aadine",
        description: "Cats can cure - CCC",
        websiteUrl: "https://HnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.CREATED);
    createdBlog2 = postResponse.body;
    expect(postResponse.body.description).toEqual("Cats can cure - CCC");

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(2);
  });

  test("Should return Unauthorized status 401 cos' auth token is incorrect", async () => {
    await request(app)
      .delete(`/api/blogs/${createdBlog2.id}`)
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .expect(StatusCodes.UNAUTHORIZED);
    const getResponse = (await request(app).get("/api/blogs")).body.items;
    expect(getResponse.length).toEqual(2);
    expect(getResponse[0].name).toEqual("Aadine");
  });

  test("Should NOT DELETE blog with incorrect ID and should return 404", async () => {
    await request(app)
      .delete("/api/blogs/123")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NOT_FOUND);
    const getResponse = (await request(app).get("/api/blogs")).body.items;
    expect(getResponse.length).toEqual(2);
    expect(getResponse[1].name).toEqual("fff");
  });

  test("Should delete blog by ID with correct ID", async () => {
    await request(app)
      .delete(`/api/blogs/${createdBlog2.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NO_CONTENT);
    const getResponse = (await request(app).get("/api/blogs")).body.items;
    expect(getResponse[0].name).toEqual("fff");
    expect(getResponse.length).toBe(1);
  });

  test("Should update name and description with status 204", async () => {
    const postResponse = await request(app)
      .put(`/api/blogs/${createdBlog1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Tania",
        description: "Dog don't drive - DDD",
        websiteUrl: "https://HnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.NO_CONTENT);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].name).toEqual("Tania");
    expect(getAllExistingCourses.body.items[0].description).toEqual(
      "Dog don't drive - DDD"
    );
  });

  test("Shouldn't update blog with incorrect Auth Type -  status 401", async () => {
    const postResponse = await request(app)
      .put(`/api/blogs/${createdBlog1.id}`)
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .send({
        name: "Stasty",
        description: "Stasty sits straight - SSS",
        websiteUrl: "https://HnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.UNAUTHORIZED);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].name).toEqual("Tania");
    expect(getAllExistingCourses.body.items[0].description).toEqual(
      "Dog don't drive - DDD"
    );
  });

  test("Shouldn't update blog with incorrect Auth Value -  status 401", async () => {
    const postResponse = await request(app)
      .put(`/api/blogs/${createdBlog1.id}`)
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({
        name: "Stasty",
        description: "Stasty sits straight - SSS",
        websiteUrl: "https://HnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.UNAUTHORIZED);
    expect(postResponse.body).toEqual({});

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].name).toEqual("Tania");
    expect(getAllExistingCourses.body.items[0].description).toEqual(
      "Dog don't drive - DDD"
    );
  });

  test("Shouldn't update blog with missing value `description` and `websiteUrl` -  status 400", async () => {
    await request(app)
      .put(`/api/blogs/${createdBlog1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Stasty",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "description field is required",
            field: "description",
          },
          {
            message: "websiteUrl field is required",
            field: "websiteUrl",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].name).toEqual("Tania");
    expect(getAllExistingCourses.body.items[0].description).toEqual(
      "Dog don't drive - DDD"
    );
  });

  test("Shouldn't update blog with incorrect input values -  status 400", async () => {
    await request(app)
      .put(`/api/blogs/${createdBlog1.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: 0,
        description: "",
        websiteUrl: "http://HnYLc7ws51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "name should be of type String",
            field: "name",
          },
          {
            message: "description must be included in request body",
            field: "description",
          },
          {
            message: "Url is incorrect",
            field: "websiteUrl",
          },
        ],
      });

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items[0].name).toEqual("Tania");
    expect(getAllExistingCourses.body.items[0].description).toEqual(
      "Dog don't drive - DDD"
    );
  });
  test("Create a new blog with correct input data and return status 201", async () => {
    const postResponse = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Maria",
        description: "Maria is mother of Jesus Christ",
        websiteUrl: "https://MbkyQDhuI51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.CREATED);
    expect(postResponse.body.name).toEqual("Maria");
    expect(postResponse.body.isMembership).toEqual(false);

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(2);
  });
  let createdBlog3: BlogViewModel;

  test("Create a new blog with correct input data and return status 201", async () => {
    const postResponse = await request(app)
      .post("/api/blogs")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        name: "Lida",
        description: "Lida will be my friend in Future",
        websiteUrl: "https://MbkyQD51KEn5wrp7cYHuVZEHlP9ADc3.uZDiBjA8F",
      })
      .expect(StatusCodes.CREATED);
    createdBlog3 = postResponse.body;
    expect(createdBlog3.name).toEqual("Lida");
    expect(createdBlog3.isMembership).toEqual(false);

    const getAllExistingCourses = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);

    expect(getAllExistingCourses.body.items.length).toEqual(3);
  });
  test("GET list of blogs that match searchNameTerm filtering", async () => {
    const filterResult = await request(app)
      .get("/api/blogs?searchNameTerm=li")
      .expect(StatusCodes.OK);
    expect(filterResult.body.items[0].name).toEqual("Lida");
  });
  test("Should get the particular page with particular blogs", async () => {
    const paginationResult = await request(app).get(
      "/api/blogs?pageSize=1&pageNumber=3"
    );
    expect(paginationResult.body.items.length).toEqual(1);
    expect(paginationResult.body.items[0].name).toEqual("Tania");
  });
  test("Default page number should be 1 and page size should be 10", async () => {
    const filterResult = await request(app)
      .get("/api/blogs")
      .expect(StatusCodes.OK);
    expect(filterResult.body.page).toEqual(1);
    expect(filterResult.body.pageSize).toEqual(10);
  });
  test("Should sort blogs in ascending order", async () => {
    const paginationResult = await request(app).get(
      "/api/blogs?sortBy=name&sortDirection=asc"
    );
    expect(paginationResult.body.items.length).toEqual(3);
    expect(paginationResult.body.items[0].name).toEqual("Lida");
    expect(paginationResult.body.items[2].name).toEqual("Tania");
  });
  test("Should sort blogs in descending order if sortDirection query param is no t provided", async () => {
    const paginationResult = await request(app).get("/api/blogs?sortBy=name");
    expect(paginationResult.body.items.length).toEqual(3);
    expect(paginationResult.body.items[0].name).toEqual("Tania");
    expect(paginationResult.body.items[2].name).toEqual("Lida");
  });
  test("CREATE post for specific blog", async () => {
    const result = await request(app)
      .post(`/api/blogs/${createdBlog3.id}/posts`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: "Stas",
        content: "Stas is my friend",
        shortDescription: "What can I say - love lives long!!!",
      })
      .expect(StatusCodes.CREATED);
    expect(result.body.blogName).toEqual("Lida");
    expect(result.body.title).toEqual("Stas");
  });
  test("SHOULDN'T CREATE post for specific blog with invalid authToken", async () => {
    await request(app)
      .post(`/api/blogs/${createdBlog3.id}/posts`)
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({
        title: "Jenia",
        content: "Jenia is my friend",
        shortDescription: "What can I say - Jenia lives long!!!",
      })
      .expect(StatusCodes.UNAUTHORIZED, {});
  });
  test("SHOULD CREATE post for specific blog with valid authToken", async () => {
    const result = await request(app)
      .post(`/api/blogs/${createdBlog3.id}/posts`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        title: "Jenia",
        content: "Jenia is my friend",
        shortDescription: "What can I say - Jenia lives long!!!",
      })
      .expect(StatusCodes.CREATED);
    expect(result.body.blogName).toEqual("Lida");
    expect(result.body.title).toEqual("Jenia");
  });
  test("GET all posts for specific blog with sorting by name with default descending order", async () => {
    const result = await request(app)
      .get(`/api/blogs/${createdBlog3.id}/posts?sortBy=title`)
      .expect(StatusCodes.OK);
    expect(result.body.items.length).toEqual(2);
    expect(result.body.items[0].title).toEqual("Stas");
    expect(result.body.items[1].content).toEqual("Jenia is my friend");
  });
  test("GET all posts for specific blog with paging", async () => {
    await request(app)
      .get(`/api/blogs/${createdBlog3.id}/posts?pageSize=2&pageNumber=2`)
      .expect(StatusCodes.OK, {
        pagesCount: 1,
        page: 2,
        pageSize: 2,
        totalCount: 2,
        items: [],
      });
  });
});

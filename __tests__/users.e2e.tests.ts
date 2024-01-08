import request from "supertest";
import { app } from "../src/settings";
import { StatusCodes } from "http-status-codes";
import { UserViewModel } from "../src/dto/usersDTO/usersDTO";

const correctAuthToken = "YWRtaW46cXdlcnR5";
const incorrectAuthToken = "YWRtaW46c864XdlcnR5=5";

describe("API for users", () => {
  beforeAll(async () => {
    await request(app).delete("/api/testing/all-data");
  });
  afterAll(async () => {
    await request(app).delete("/api/testing/all-data");
  });
  test("GET list of users with status 200", async () => {
    await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK, {
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: [],
      });
  });

  test("ADD new user", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "Tania",
        password: "TaniaIsTheBest",
        email: "tania@mainModule.org",
      })
      .expect(StatusCodes.CREATED);
    expect(response.body.login).toEqual("Tania");
    expect(response.body.password).toBe(undefined);
    expect(response.body.email).toBe("tania@mainModule.org");
    expect(response.body._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user without authentication", async () => {
    await request(app)
      .post("/api/users")
      .send({
        login: "Lina",
        password: "LinaIsTheBest",
        email: "lina@mainModule.org",
      })
      .expect(StatusCodes.UNAUTHORIZED);
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user with incorrect Auth Type", async () => {
    await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .send({
        login: "Lina",
        password: "LinaIsTheBest",
        email: "lina@mainModule.org",
      })
      .expect(StatusCodes.UNAUTHORIZED);
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user with incorrect Auth Token", async () => {
    await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .send({
        login: "Lina",
        password: "LinaIsTheBest",
        email: "lina@mainModule.org",
      })
      .expect(StatusCodes.UNAUTHORIZED);
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user with incorrect body values", async () => {
    await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "LinaSergeevaIvanovna",
        password: "Two",
        email: "linamainModule.org",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "login's max length is 10",
            field: "login",
          },
          {
            message: "password's min length is 6",
            field: "password",
          },
          {
            message:
              "Email doesn't match this regular expression: /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/",
            field: "email",
          },
        ],
      });
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user with incorrect body values", async () => {
    await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "Li",
        password: "TwoOneThreeFourFiveSixSevenEightNineTen",
        email: "li@mail.bobobobobobobobobobo",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "login's min length is 3",
            field: "login",
          },
          {
            message: "password's max length is 20",
            field: "password",
          },
          {
            message:
              "Email doesn't match this regular expression: /^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$/",
            field: "email",
          },
        ],
      });
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  test("SHOULDN'T ADD new user with missing properties from body object", async () => {
    await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "Lina",
        password: "TwoOneThree",
      })
      .expect(StatusCodes.BAD_REQUEST, {
        errorsMessages: [
          {
            message: "email field is required",
            field: "email",
          },
        ],
      });
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);

    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Tania");
    expect(response.body.items[0].password).toBe(undefined);
    expect(response.body.items[0].email).toBe("tania@mainModule.org");
    expect(response.body.items[0]._id).toBe(undefined);
  });
  let user2: UserViewModel;
  test("ADD second user", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "Lina",
        password: "OneTwoThree",
        email: "lina@mait.au",
      })
      .expect(StatusCodes.CREATED);
    user2 = response.body;
    expect(user2.login).toEqual("Lina");
    expect(user2.email).toBe("lina@mait.au");
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(2);
    expect(listOfUsers.body.items[1].login).toEqual("Tania");
    expect(listOfUsers.body.items[0].email).toEqual("lina@mait.au");
  });
  test("ADD third user", async () => {
    const response = await request(app)
      .post("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .send({
        login: "Pasha",
        password: "PashaPass777",
        email: "pasha@mait.au",
      })
      .expect(StatusCodes.CREATED);
    expect(response.body.login).toEqual("Pasha");
    expect(response.body.email).toBe("pasha@mait.au");
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(3);
    expect(listOfUsers.body.items[1].login).toEqual("Lina");
    expect(listOfUsers.body.items[0].email).toEqual("pasha@mait.au");
  });
  test("GET list of users with paging and sorting", async () => {
    const response = await request(app)
      .get("/api/users?pageSize=1&pageNumber=2&sortBy=login")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Pasha");
  });
  test("GET list of users with paging and sorting", async () => {
    const response = await request(app)
      .get("/api/users?pageSize=1&sortBy=login&sortDirection=asc")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(response.body.items.length).toEqual(1);
    expect(response.body.items[0].login).toEqual("Lina");
  });
  test("GET list of users with search", async () => {
    const response = await request(app)
      .get("/api/users?searchLoginTerm=t&searchEmailTerm=ha")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(response.body.items.length).toEqual(2);
    expect(response.body.items[0].login).toEqual("Pasha");
    expect(response.body.items[1].login).toEqual("Tania");
  });
  test("GET list of users with search", async () => {
    const response = await request(app)
      .get("/api/users?searchLoginTerm=an&searchEmailTerm=na")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(response.body.items.length).toEqual(2);
    expect(response.body.items[0].login).toEqual("Lina");
    expect(response.body.items[1].login).toEqual("Tania");
  });
  test("SHOULDN'T DELETE user without authentication", async () => {
    await request(app).delete("/api/users/4").expect(StatusCodes.UNAUTHORIZED);
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(3);
    expect(listOfUsers.body.items[1].login).toEqual("Lina");
    expect(listOfUsers.body.items[0].email).toEqual("pasha@mait.au");
  });
  test("SHOULDN'T DELETE user with incorrect AUTH TOKEN", async () => {
    await request(app)
      .delete("/api/users/4")
      .set("Authorization", `Basic ${incorrectAuthToken}`)
      .expect(StatusCodes.UNAUTHORIZED);
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(3);
    expect(listOfUsers.body.items[1].login).toEqual("Lina");
    expect(listOfUsers.body.items[0].email).toEqual("pasha@mait.au");
  });
  test("SHOULDN'T DELETE user with missing AUTH TYPE", async () => {
    await request(app)
      .delete("/api/users/4")
      .set("Authorization", `Bearer ${correctAuthToken}`)
      .expect(StatusCodes.UNAUTHORIZED);
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(3);
    expect(listOfUsers.body.items[1].login).toEqual("Lina");
    expect(listOfUsers.body.items[0].email).toEqual("pasha@mait.au");
  });
  test("SHOULDN'T DELETE user with incorrect user id", async () => {
    await request(app)
      .delete("/api/users/4")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NOT_FOUND);
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(3);
    expect(listOfUsers.body.items[1].login).toEqual("Lina");
    expect(listOfUsers.body.items[0].email).toEqual("pasha@mait.au");
  });
  test("DELETE second user", async () => {
    await request(app)
      .delete(`/api/users/${user2.id}`)
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.NO_CONTENT);
    const listOfUsers = await request(app)
      .get("/api/users")
      .set("Authorization", `Basic ${correctAuthToken}`)
      .expect(StatusCodes.OK);
    expect(listOfUsers.body.items.length).toEqual(2);
    expect(listOfUsers.body.items[0].login).toEqual("Pasha");
    expect(listOfUsers.body.items[1].email).toEqual("tania@mainModule.org");
  });
});

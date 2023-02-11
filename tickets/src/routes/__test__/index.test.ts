import request from "supertest";
import { app } from "../../app";

const createTicket = async () => {
  const cookie = global.signup();
  const title = "test";
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(201);
};

it("can fetch list of tickets", async () => {
  await createTicket();
  await createTicket();
  await createTicket();

  const indexResponse = await request(app)
    .get("/api/tickets")
    .send()
    .expect(200);

  expect(indexResponse.body.length).toEqual(3);
});

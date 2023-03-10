import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";

it("returns a 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if it is found", async () => {
  const cookie = global.signup();
  const title = "test";
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(201);

  const id = response.body.id;

  const ticketResponse = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

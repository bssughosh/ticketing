import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { natsWrapper } from "../../nats-wrapper";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signup())
    .send({ title: "Test", price: 10 })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "Test", price: 10 })
    .expect(401);
});

it("returns a 401 if the user does not own the ticket", async () => {
  const title = "test";
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({ price, title })
    .expect(201);

  const id = response.body.id;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signup())
    .send({ price, title })
    .expect(401);
});

it("returns a 400 if the user provides an invalid title or price", async () => {
  const title = "test";
  const price = 10;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signup())
    .send({ price, title })
    .expect(201);

  const id = response.body.id;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signup())
    .send({ price })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signup())
    .send({ title })
    .expect(400);
});

it("updates the ticket with proper input", async () => {
  let title = "test";
  let price = 10;
  const cookie = global.signup();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(201);

  const id = response.body.id;

  title = "new test";
  price = 100;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});

it("published an event", async () => {
  const cookie = global.signup();
  let title = "test";
  let price = 10;
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(201);

  const id = response.body.id;
  title = "new test";
  price = 100;

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

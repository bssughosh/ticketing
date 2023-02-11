import request from "supertest";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { natsWrapper } from "../../nats-wrapper";

it("has a route handler listening to /api/tickets for post requests", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("can only be accessed by authenticated users", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);

  const cookie = global.signup();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({});
  expect(response.status).not.toEqual(404);
});

it("returns an error if an invalid title is provided", async () => {
  const cookie = global.signup();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 10, title: "" })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 10 })
    .expect(400);
});

it("returns an error if an invalid price is provided", async () => {
  const cookie = global.signup();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: -10, title: "test" })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: "-10i", title: "test" })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: "test" })
    .expect(400);
});

it("created a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const cookie = global.signup();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price: 10, title: "test" })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it("published an event", async () => {
  const cookie = global.signup();
  const title = "test";
  const price = 10;
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ price, title })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  var signup: () => string[];
}

jest.mock("../nats-wrapper");

let mongo: any;
beforeAll(async () => {
  process.env.JWT_SECRET = "asdf";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signup = () => {
  // Build a JWT Payload {id, email}
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com",
  };

  // Crate the JWT
  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  // Build the session object {jwt: JWT}
  const session = { jwt: token };

  // Turn session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");

  // return a string thats the cookie with encoded data
  return [`session=${base64}`];
};

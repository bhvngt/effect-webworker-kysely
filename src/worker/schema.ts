import { Schema } from "effect";

export class User extends Schema.Class<User>("User")({
  id: Schema.Number,
  name: Schema.String,
}) {}

export class AddUser extends Schema.TaggedRequest<AddUser>()("AddUser", {
  failure: Schema.Never,
  success: Schema.NullOr(User),
  payload: {
    id: Schema.Number,
  },
}) {}

export const WorkerMessage = Schema.Union(AddUser);
export type WorkerMessage = Schema.Schema.Type<typeof WorkerMessage>
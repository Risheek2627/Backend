import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectID, // the one who subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, //  one to whom "subscriber suscribing"
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

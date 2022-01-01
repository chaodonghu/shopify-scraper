import { Webhook, MessageBuilder } from "discord-webhook-node";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Task from "./classes/Task.js";
import Seller from "./models/Seller.js";
import Discord from "./classes/Discord.js";
import { SITES } from "./config.js";

mongoose.Promise = global.Promise;
dotenv.config();

const { DB_HOST, DB_NAME, DB_PORT } = process.env;

mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

try {
  Seller.deleteMany({}, (err) => {
    if (!err) {
      Seller.insertMany(SITES, (err) => {
        if (!err) {
          Seller.find({}, (err, tasksQuery) => {
            for (let i = 0; i < tasksQuery.length; i++) {
              setTimeout(() => {
                new Task(tasksQuery[i]).start();
              }, 4000 * i);
            }

            Discord.info(
              "Monitor successfully started, time to get that bread fam"
            );
          });
        }
      });
    }
  });
} catch (err) {
  console.log(err);
}

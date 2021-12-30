import { Webhook, MessageBuilder } from "discord-webhook-node";
import dotenv from "dotenv";
import mongoose from "mongoose";

import Task from "./classes/Task.js";
import Seller from "./models/Seller.js";
import Discord from "./classes/Discord.js";

mongoose.Promise = global.Promise;
dotenv.config();

const { DB_HOST, DB_NAME, DB_PORT } = process.env;

const sites = [
  {
    url: "deadstock.ca",
    keywords: [["Nike"], ["Adidas", "Yeezy"], ["Jordan"]],
  },
  {
    url: "capsuletoronto.com",
    keywords: [["Nike"], ["Adidas", "Yeezy"], ["Jordan"]],
  },
  {
    url: "nomadshop.net",
    keywords: [["Nike"], ["Adidas", "Yeezy"], ["Jordan"]],
  },
  {
    url: "ca.octobersveryown.com",
  },
  {
    url: "nrml.ca",
    keywords: [["Nike"], ["Adidas", "Yeezy"], ["Jordan"]],
  },
  {
    url: "shop.havenshop.com",
    keywords: [["Nike"], ["Adidas", "Yeezy"], ["Jordan"]],
  },
];

mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

try {
  Seller.deleteMany({}, (err) => {
    if (!err) {
      Seller.insertMany(sites, (err) => {
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

  const hook = new Webhook(process.env.WEBHOOK_URLS);

  (async () => {
    try {
      await hook.send("Hello there!");
      console.log("Successfully sent webhook!");
    } catch (e) {
      console.log(e.message);
    }
  })();
} catch (err) {
  console.log(
    "---------------- Error has occured ----------------------------"
  );
  console.log(err);
  console.log(
    "---------------- Error has occured ----------------------------"
  );
}

global.config = require("./config");

require('dotenv').config()

const mongoose = require("mongoose");

const Task = require("./src/classes/Task.js");
const Seller = require("./src/models/Seller");

const Discord = require("./src/classes/Discord");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

try {
  Seller.deleteMany({}, (err) => {
    if (!err) {
      Seller.insertMany(global.config.sites, (err) => {
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

import axios from "axios";
import httpsProxyAgent from "https-proxy-agent";

import { REQUEST_TIMING } from "../config.js";
import Discord from "./Discord.js";
import Log from "./Log.js";
import Product from "./Product.js";
import Seller from "../models/Seller.js";

export default class Task {
  constructor(taskSettings) {
    this.sellerUrl = taskSettings.url;
    this.firstRun = true;
    this.sellerId = taskSettings._id;

    this.keywords = taskSettings.keywords;
    // if (global.config.keywords) {
    //   this.keywords = this.keywords.concat(global.config.keywords);
    // }

    this.proxiesList = [{ url: "", unbanTime: 0, banCount: 0.5 }];
    this.proxyCount = 0;
    // if (global.config.proxiesList && global.config.proxiesList.length > 0) {
    //   this.proxiesList = this.proxiesList.concat(
    //     global.config.proxiesList.map((x) => ({
    //       url: x,
    //       unbanTime: 0,
    //       banCount: 0.5,
    //     }))
    //   );
    // }
    this.currentProxy = {};
  }

  start = async () => {
    this.task = setInterval(async () => {
      try {
        let config = {};

        do {
          this.currentProxy = this.proxiesList[this.proxyCount];

          if (
            this.currentProxy.unbanTime > 0 &&
            this.currentProxy.unbanTime <= Date.now()
          ) {
            this.currentProxy.unbanTime = 0;
          }

          this.proxyCount++;
          if (this.proxyCount >= this.proxiesList.length) {
            this.proxyCount = 0;
          }
        } while (
          this.currentProxy.unbanTime === -1 ||
          this.currentProxy.unbanTime > 0
        );

        if (this.currentProxy.url != "") {
          const agent = new httpsProxyAgent(this.currentProxy.url);

          config = {
            method: "GET",
            httpsAgent: agent,
          };
        }

        let url = `https://${this.sellerUrl}/products.json?limit=250`;

        const response = await axios.get(url, config);

        this.currentProxy.banCount = 0.5;

        let products = response.data.products;

        if (this.firstRun) {
          let newProducts = [];

          if (this.keywords.length > 0) {
            products = this.productsToCheck(products);
          }

          products.forEach((x) => {
            let product = new Product(x.id, this.sellerUrl);
            product.updateInformation(x);

            newProducts = [...newProducts, product];
          });

          await Seller.updateOne(
            { _id: this.sellerId },
            {
              products: newProducts,
            }
          );

          this.firstRun = false;

          Log.Info(`Connection done with ${this.sellerUrl}`);
        } else {
          Seller.findById(this.sellerId, async (err, sellerQuery) => {
            if (err) {
              Log.Warning("Seller not found");
            } else if (products.length === 0) {
              Log.Warning(`No products found in ${this.sellerUrl}`);
            } else {
              let oldProducts = sellerQuery.products;
              let newProducts = [];

              if (this.keywords.length > 0) {
                products = this.productsToCheck(products);
              }

              await products.forEach(async (product) => {
                let found = oldProducts.find((x) => x.id === product.id);

                if (found) {
                  if (found.lastUpdate === product.updated_at) {
                    return;
                  }

                  let oldPr = new Product(
                    found.id,
                    found.sellerUrl,
                    found.lastUpdate,
                    found.handle,
                    found.title,
                    found.url,
                    found.image,
                    found.variants
                  );
                  let newPr = new Product(product.id, this.sellerUrl);
                  newPr.updateInformation(product);

                  if (oldPr.needToNotifyUpdate(newPr)) {
                    await Seller.updateOne(
                      { _id: this.sellerId, "products.id": newPr.id },
                      { $set: { "products.$": newPr } }
                    );
                    Discord.notifyProduct(newPr);
                  } else {
                    await Seller.updateOne(
                      { _id: this.sellerId, "products.id": product.id },
                      { $set: { "products.$.lastUpdate": product.updated_at } }
                    );
                  }
                } else {
                  let newPr = new Product(product.id, this.sellerUrl);
                  newPr.updateInformation(product);
                  newProducts = [...newProducts, newPr];
                  Discord.notifyProduct(newPr);
                }
              });

              if (newProducts.length > 0) {
                await Seller.updateOne(
                  { _id: this.sellerId },
                  {
                    $push: {
                      products: { $each: [...newProducts], $position: 0 },
                    },
                  }
                );
              }
            }
          });
        }
      } catch (err) {
        if (
          err.response &&
          (err.response.status === 430 || err.response.status === 429)
        ) {
          this.currentProxy.banCount += 0.5;
          Log.Warning(
            `Ban occurred [${this.sellerUrl}] - Retry after ${
              60 * this.currentProxy.banCount
            } seconds`
          );

          this.currentProxy.unbanTime =
            Date.now() + 60000 * this.currentProxy.banCount;
        } else if (err.response && err.response.status === 403) {
          Log.Error(
            `${this.sellerUrl} has an high level of protection from monitors`
          );
          clearInterval(this.task);
        } else if (err.response && err.response.status === 502) {
          Log.Error(
            `Bad gateway error, if you are using ipv6 proxy don't use it, because it's not supported.`
          );
          this.currentProxy.unbanTime = -1;
        } else if (err.response && err.response.status === 502) {
          Log.Warning(`Unknown Error from server`);
          this.currentProxy.unbanTime = -1;
        } else if (err.code === "ETIMEDOUT") {
          Log.Error(
            `Timeout occurred, a node js script cannot manage a lot of requests in the same time`
          );
          clearInterval(this.task);
        } else if (err.code === "ECONNRESET") {
          Log.Warning(`The connection was reset`);
        } else {
          console.log(err);
        }
      }
    }, REQUEST_TIMING);
  };

  productsToCheck = (products) => {
    return products.filter((product) => {
      let title = product.title.toLowerCase();
      let vendor = product.vendor.toLowerCase();
      let url = product.handle.toLowerCase();
      for (let keys of this.keywords) {
        let check = true;
        for (let key of keys) {
          let keyToLower = key.toLowerCase();
          if (
            title.indexOf(keyToLower) === -1 &&
            vendor.indexOf(keyToLower) === -1 &&
            !product.tags.some(
              (tag) => tag.toLowerCase().indexOf(keyToLower) > -1
            ) &&
            url.indexOf(keyToLower) === -1
          ) {
            check = false;
            break;
          }
        }

        if (check) {
          return true;
        }
      }
      return false;
    });
  };
}

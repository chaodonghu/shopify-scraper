import { Webhook, MessageBuilder } from "discord-webhook-node";
import Log from "./Log.js";
import { DISCORD_MESSAGE_SETTINGS } from "../config.js";

if (process.env.WEBHOOK_URLS.split(",") === []) {
  Log.Error(
    "Discord webhook url cannot be empty, insert it in the config.json file"
  );
  process.exit();
}

const hooks = [];

var setBotName =
  DISCORD_MESSAGE_SETTINGS.botName && DISCORD_MESSAGE_SETTINGS.botName != "";
var setBotImage =
  DISCORD_MESSAGE_SETTINGS.botImage && DISCORD_MESSAGE_SETTINGS.botImage != "";

process.env.WEBHOOK_URLS.split(",").forEach((x) => {
  var hook = new Webhook(x);

  if (setBotName) {
    hook.setUsername(DISCORD_MESSAGE_SETTINGS.botName);
  }

  if (setBotImage) {
    hook.setAvatar(DISCORD_MESSAGE_SETTINGS.botImage);
  }

  hooks.push(hook);
});

let Discord = {};

Discord.notifyProduct = async ({
  title,
  sellerUrl,
  image,
  url,
  variants,
  status,
}) => {
  const embed = new MessageBuilder()
    .setTitle(title)
    .setAuthor(sellerUrl, image, url)
    .setURL(url);

  var availablesVariants = variants.filter((x) => x.available);
  if (availablesVariants.length > 0) {
    var sizesDescription = [];
    sizesDescription.push("");
    var count = 0;

    availablesVariants.forEach((x) => {
      var toAdd = `${x.title} [[ATC](https://${sellerUrl}/cart/add?id=${x.id})]\n`;
      if (sizesDescription[count].length + toAdd.length > 1024) {
        sizesDescription.push(toAdd);
        count++;
      } else {
        sizesDescription[count] += toAdd;
      }
    });

    sizesDescription.forEach((x) => {
      embed.addField("**Sizes**", x, true);
    });
  }

  embed.addField("**Price**", variants[0].price, true);

  if (status.length > 0) {
    embed.addField("**Status**", status.join("\n"), true);
  }

  embed
    .addField("**Links**", `[[Cart](https://${sellerUrl}/cart)]`, true)
    .setThumbnail(image);

  if (
    (DISCORD_MESSAGE_SETTINGS.footerDescription &&
      DISCORD_MESSAGE_SETTINGS.footerDescription != "") ||
    (DISCORD_MESSAGE_SETTINGS.footerImage &&
      DISCORD_MESSAGE_SETTINGS.footerImage != "")
  ) {
    embed.setFooter(
      DISCORD_MESSAGE_SETTINGS.footerDescription,
      DISCORD_MESSAGE_SETTINGS.footerImage
    );
  }

  if (DISCORD_MESSAGE_SETTINGS.timeOfNotification) {
    embed.setTimestamp();
  }

  hooks.forEach((hook) => {
    hook.send(embed);
  });
};

Discord.info = async (title) => {
  hooks.forEach((hook) => {
    hook.info(title);
  });
};

export default Discord;

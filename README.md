**Shopify Scraper**
---

A shopify products monitor that notifies users of products that have been added to sites. Enables the ability to receive notifications for certain keywords.

Connects directly with discord for notifications.

Users are notified of the product that has been added to the shopify site and can add to the user's cart if desired.

A sample notification on discord:

<img width="618" alt="Screen Shot 2020-12-24 at 11 51 42 PM" src="https://user-images.githubusercontent.com/22258898/103120452-ccf18480-4645-11eb-98db-520c147efa2f.png">

**Usage**
---

The repository has been dockerized to allow for easy development and deployment and to also avoid any environment issues.

1. Install [`Docker`](https://www.docker.com/)

2. Make a `.env` file to store environment variables/secrets/urls

Add your `MONGODB_URI` and `WEBHOOK_URLS` to the `.env` file (See `Configuration Options` for more information)

```
MONGODB_URI = “mongodb://db:27017/shopify”
WEBHOOK_URLS = "https://discord.com/api/webhooks/etcetcetc"

```

3. Build the image

```
docker-compose build
```

4. Run the container

```
docker-compose up
```

On successful run you should see a message in your discord: `Monitor successfully started, time to get that bread fam`

<img width="498" alt="Screen Shot 2020-12-25 at 12 00 03 AM" src="https://user-images.githubusercontent.com/22258898/103120436-b9deb480-4645-11eb-97ca-f486f190ff1d.png">

**Configuration Options**
---

**Environment variables:**

These should be defined in `.env`

1. MONGODB_URI

    + URI that connects to your mongodb database by default utilize `mongodb://db:27017/xxx` with xxx being any database  name you would like to specify (eg. `mongodb://db:27017/shopify_database`)

2. WEBHOOK_URLS

    + Discord webhook urls which will be converted into an array, seperate these urls by commas in your `.env` file
    + eg. (`"https://discord.com/api/webhooks/1/,"https://discord.com/api/webhooks/2/")

**Configuration:**

These should be defined in `config.json`

1. discord_message_settings

TODOTODOTODO
        
**Future Improvements**
---

- [ ] Implement scraping on sites that do not utilize Shopify platform

**Acknowledgements**
---

+ This is an extension of the Shopify Monitor created by https://github.com/Dam998/shopify-monitor/.

**Donations**
---

If this has helped you!

<a href="https://www.buymeacoffee.com/cdhu" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-blue.png" width="180" height="50"></a>

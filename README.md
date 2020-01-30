# reaction-dummy-data

Generates dummy data (products, tags & orders) for Reaction Commerce.

## How to use

First, install the package in your project's `reaction` (API) directory:

```bash
npm install --save-dev @outgrow/reaction-dummy-data
```

Then, register the plugin in your project's `reaction/src/registerPlugins.js`, calling the function at the end of the file:

```js
import registerDummyData from "@outgrow/reaction-dummy-data/index.js";

// Built-in plugin register calls go here

await registerDummyData(app);
```

## GraphQL API

Once the plugin is registered, you get access to the following GraphQL mutations. Call these from the GraphQL Playground at http://localhost:3000/graphql.

As you can see in the example variables, there is no need to encode the `shopId`. This is a developer tool, and we want to keep things straightforward.

### Create tags and products:

```graphql
mutation loadProductsAndTags($input: LoadProductsAndTagsInput!) {
    loadProductsAndTags(input: $input) {
        productsCreated,
        tagsCreated
    }
}
```

Call with the following variables:

```json
{
    "input": {
        "shopId": "kspBu62vAyXnnb2v6",
        "desiredTagCount": 15,
        "desiredProductCount": 20
    }
}
```

### Add images to all products

```graphql
mutation loadProductImages($input: LoadProductImagesInput!) {
    loadProductImages(input: $input) {
        wasDataLoaded
    }
}
```

Call with the following variables:

```json
{
    "input": {
        "shopId": "kspBu62vAyXnnb2v6"
    }
}
```

### Create orders

```graphql 
mutation loadOrders($input: LoadOrdersInput!) {
    loadOrders(input: $input) {
        ordersCreated
    }
}
```

Call with the following variables:

```json
{
    "input": {
        "shopId": "kspBu62vAyXnnb2v6",
        "desiredOrderCount": 15
    }
}
```

### Remove all data (armageddon)

Beware: this will erase the content of the `Products`, `Catalog`, `Tags` and `Orders` collections!

```graphql 
mutation removeAllData($input: RemoveDataInput!) {
    removeAllData(input: $input) {
        wasDataRemoved
    }
}
```

Call with the following variables:

```json
{
    "input": {
        "shopId": "kspBu62vAyXnnb2v6"
    }
}
```

### Authentication

Don't forget to use an `Authorization` HTTP header to authenticate your API calls. Example:

```json
{
    "Authorization": "skwL_8jUOkmom7wW_se6_XgfSBtBrUBSR9UL-CUq74A.fwTZ8_G2QTMPf83O6jAOtYxyEU1TYV6spm8abPENutg"
}
```

You can get the value for the `Authorization` header in the `reaction-admin` UI (http://localhost:4080). By using your browser's network analyzer in the devtools, look for any recent `POST` call to `/graphql` or `/graphql-beta` and copy the value for `Authorization` in the request headers. 

## A note on performance

This plugin is a developer tool and hasn't necessarily been built with optimal performance in mind. It will make your GraphQL server hang while generating products, tags, images or orders. These mutations will most likely take time to finish because of the necessary use of many `await`s in the code.

We hope that the `job-queue` plugin will soon be available as an NPM package, enabling us to simply register jobs instead of having so much synchronous code in mutation resolvers. Until then, PRs are obviously welcome to enhance performance!

## Help

Need help integrating this plugin into your Reaction Commerce project? Simply looking for expert [Reaction Commerce developers](https://outgrow.io)? Want someone to train your team to use Reaction at its fullest?

Whether it is just a one-hour consultation to get you set up or helping your team ship a whole project from start to finish, you can't go wrong by reaching out to us:

* +1 (281) OUT-GROW
* contact@outgrow.io
* https://outgrow.io

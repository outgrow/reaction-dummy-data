import ReactionError from "@reactioncommerce/reaction-error";
import createProductImageFromUrl from "../../utils/createProductImageFromUrl.js";

/**
 * @name ReactionDummyData/loadProductImages
 * @memberof Mutations/ReactionDummyData
 * @method
 * @summary Inserts dummy product images into the database
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments for the operation
 * @param {String} input.shopId - the shop to create the product for
 * @returns {Boolean} true if data was inserted
 */
export default async function loadProductImages(context, input) {
  const { userHasPermission } = context;
  const {
    shopId
  } = input;

  if (userHasPermission(["admin"], shopId) === false) {
    throw new ReactionError("access-denied", "User does not have permissions to generate sitemaps");
  }

  const {
    collections: {
      Products,
      MediaRecords
    }
  } = context;

  const products = await Products.find({}).toArray();
  const productIds = products.map((product) => product._id);
  const media = await MediaRecords.find({ "metadata.productId": { $in: productIds } }).toArray();
  const productIdsWithMedia = [...new Set(media.map((doc) => doc.metadata.productId))];

  const alteredProductIds = [];

  for (const product of products) {
    if (!productIdsWithMedia.includes(product._id && product.ancestors.length > 1)) {
      await createProductImageFromUrl(product, context);
    }

    if (product.type === "simple" && product.isVisible) {
      alteredProductIds.push(product._id);
    }
  }

  const publishedProducts = await context.mutations.publishProducts(context, alteredProductIds);

  return {
    wasDataLoaded: publishedProducts.length > 0
  };
}

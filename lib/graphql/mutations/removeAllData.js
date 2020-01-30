import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name ReactionDummyData/removeAllData
 * @memberof Mutations/ReactionDummyData
 * @method
 * @summary Flushes all products, tags and orders from the database.
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments for the operation
 * @returns {Boolean} true if data was removed
 */
export default async function removeAllData(context, input) {
  const { shopId } = input;

  const isUserShopOwner = await context.userHasPermission("reaction:legacy:shops", "owner", { shopId });

  if (isUserShopOwner === false) {
    throw new ReactionError("access-denied", "User has to be a shop owner");
  }

  const {
    collections: {
      Catalog,
      Orders,
      Products,
      Tags
    }
  } = context;

  await Catalog.deleteMany({ shopId });
  await Orders.deleteMany({ shopId });
  await Products.deleteMany({ shopId });
  await Tags.deleteMany({ shopId });

  return {
    wasDataRemoved: true
  };
}

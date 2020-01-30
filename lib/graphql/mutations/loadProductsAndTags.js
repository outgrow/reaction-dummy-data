import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import faker from "faker";

/**
 * @name ReactionDummyData/loadProductsAndTags
 * @memberof Mutations/ReactionDummyData
 * @method
 * @summary Inserts dummy products and tags into the database
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments for the operation
 * @param {String} input.shopId - the shop to create the product for
 * @returns {Boolean} true if data was inserted
 */
export default async function loadProductsAndTags(context, input) {
  const { shopId, desiredProductCount, desiredTagCount } = input;

  const {
    collections: {
      Products,
      Tags
    }
  } = context;

  // Count current amount of tags and keep track of names to avoid duplicates
  const tagCursor = Tags.find({
    isDeleted: false,
    isVisible: true
  });

  let existingTagCount = await tagCursor.count();
  let addedTagCount = 0;

  const tagSlugs = await tagCursor.map((tag) => tag.name).toArray();

  // Generate and add tags until we reach the desired count
  for (existingTagCount; existingTagCount < desiredTagCount; existingTagCount += 1) {
    let displayTitle;

    // Generate a random title until we find one that's not in use
    do {
      displayTitle = faker.commerce.department();
    } while (displayTitle !== undefined && tagSlugs.includes(getSlug(displayTitle)));

    const insertedTag = await context.mutations.addTag(context, {
      shopId,
      name: getSlug(displayTitle),
      displayTitle,
      isVisible: true
    });

    if (insertedTag !== undefined && typeof insertedTag._id === "string") {
      addedTagCount += 1;
      tagSlugs.push(getSlug(displayTitle));
    }
  }

  // Count current amount of products and keep track of names to avoid duplicates
  const productCursor = Products.find({
    ancestors: [] // Exclude variants and options
  });
  const insertedProductIds = [];

  let existingProductCount = await productCursor.count();

  const tagIdCursor = Tags.find({
    isDeleted: false,
    isVisible: true
  });
  const tagIds = await tagIdCursor.map((tag) => tag._id).toArray();

  // Create and populate products until we reach the desired count
  for (existingProductCount; existingProductCount < desiredProductCount; existingProductCount += 1) {
    const insertedProduct = await context.mutations.createProduct(context, { shopId });

    insertedProductIds.push(insertedProduct._id);

    const productTitle = faker.commerce.productName();

    const product = {
      description: faker.lorem.sentences(8),
      isVisible: true,
      slug: productTitle,
      metaDescription: faker.lorem.sentences(2),
      originCountry: faker.address.countryCode(),
      pageTitle: productTitle,
      supportedFulfillmentTypes: ["shipping"],
      title: productTitle,
      vendor: faker.company.companyName()
    };

    context.mutations.updateProduct(context, {
      product,
      productId: insertedProduct._id,
      shopId
    });

    context.mutations.addTagsToProducts(context, {
      productIds: [insertedProduct._id],
      shopId,
      tagIds: [faker.random.arrayElement(tagIds)]
    });

    let insertedVariant = await Products.findOne({ ancestors: insertedProduct._id });

    const variantTitle = faker.commerce.color()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    context.mutations.updateProductVariant(context, {
      variant: {
        attributeLabel: "Color",
        height: faker.random.number(99),
        isVisible: true,
        length: faker.random.number(99),
        optionTitle: variantTitle,
        originCountry: product.originCountry,
        sku: faker.random.alphaNumeric(9).toUpperCase(),
        title: `${product.title} - ${variantTitle}`,
        weight: faker.random.number(99),
        width: faker.random.number(99)
      },
      variantId: insertedVariant._id,
      shopId
    });

    context.mutations.updateProductVariantPrices(context, {
      prices: {
        compareAtPrice: 0,
        price: Number(faker.commerce.price())
      },
      shopId,
      variantId: insertedVariant._id
    });
  }

  const publishedProducts = await context.mutations.publishProducts(context, insertedProductIds);

  return {
    productsCreated: publishedProducts.length,
    tagsCreated: addedTagCount
  };
}

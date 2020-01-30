import FileCollections from "@reactioncommerce/file-collections";
import Logger from "@reactioncommerce/logger";
import randomPuppy from "random-puppy";
import fetch from "node-fetch";

const { FileRecord } = FileCollections;

/**
 * @method createProductImageFromUrl
 * @summary Pull a puppy image from the internet and attach it to a product
 * @param {object} product - the product to attach an image to
 * @param {object} context - the app context
 * @returns {object} fileRecord - the file object that's been created
 */
export default async function createProductImageFromUrl(product, context) {
  const {
    collections: {
      Products
    }
  } = context;

  let url;
  let isImage;

  do {
    url = await randomPuppy();
    isImage = url.endsWith(".jpg") || url.endsWith(".png");

    if (!isImage) {
      Logger.info(`Got non-image file "${url}". Trying again.`);
    }
  } while (!isImage);

  const fileRecord = await FileRecord.fromUrl(url, { fetch });

  const { shopId } = product;
  const topVariant = await Products.findOne({
    ancestors: [product._id]
  });

  if (product.type === "simple") {
    fileRecord.metadata = {
      productId: product._id,
      variantId: topVariant._id,
      priority: 0
    };
  } else {
    const parent = await Products.findOne({
      _id: product.ancestors[0]
    });

    fileRecord.metadata = {
      productId: parent._id,
      variantId: product._id,
      priority: 0
    };
  }

  const mediaRecord = {
    ...fileRecord.document,
    original: {
      ...fileRecord.document.original,
      uploadedAt: fileRecord.document.original.updatedAt,
      type: fileRecord.document.original.type[0]
    }
  };

  const insertedMediaRecord = await context.mutations.createMediaRecord(context, {
    mediaRecord,
    shopId
  });

  return insertedMediaRecord;
}

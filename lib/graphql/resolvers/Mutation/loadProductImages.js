/**
 *
 * @method loadProductImages
 * @summary Inserts dummy product images into the database
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {String[]} args.input.source - where to get the images from
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with the clientMutationId
 * of the bulk operation
 */
export default async function loadProductImages(_, { input }, context) {
  const { clientMutationId } = input;

  const mutationResult = await context.mutations.loadProductImages(context, input);

  return {
    clientMutationId,
    ...mutationResult
  };
}

/**
 *
 * @method loadProductsAndTags
 * @summary Inserts dummy products and tags into the database.
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {Int[]} args.input.desiredProductCount - The desired count of products to reach in the database
 * @param {Int[]} args.input.desiredTagCount - The desired count of tags to reach in the database
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with the clientMutationId
 * of the bulk operation
 */
export default async function loadProductsAndTags(_, { input }, context) {
  const { clientMutationId } = input;

  const mutationResult = await context.mutations.loadProductsAndTags(context, input);

  return {
    clientMutationId,
    ...mutationResult
  };
}

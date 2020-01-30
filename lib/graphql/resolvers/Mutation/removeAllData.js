/**
 *
 * @method removeAllData
 * @summary Flushes all products, tags and orders from the database.
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with the clientMutationId
 * of the bulk operation
 */
export default async function removeAllData(_, { input }, context) {
  const { clientMutationId } = input;

  const mutationResult = await context.mutations.removeAllData(context, input);

  return {
    clientMutationId,
    ...mutationResult
  };
}

/**
 *
 * @method loadOrders
 * @summary Inserts dummy orders into the database.
 * @param {Object} _ - unused
 * @param {Object} args - The input arguments
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.clientMutationId - The mutation id
 * @param {Number} args.input.desiredOrderCount - the desired count of orders to reach in the database
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} Returns an object with the clientMutationId
 * of the bulk operation
 */
export default async function loadOrders(_, { input }, context) {
  const { clientMutationId } = input;

  const mutationResult = await context.mutations.loadOrders(context, input);

  return {
    clientMutationId,
    ...mutationResult
  };
}

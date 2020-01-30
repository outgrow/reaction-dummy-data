import ReactionError from "@reactioncommerce/reaction-error";
import faker from "faker";

/**
 * @name ReactionDummyData/loadOrders
 * @memberof Mutations/ReactionDummyData
 * @method
 * @summary Inserts dummy orders into the database
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments for the operation
 * @param {String} input.shopId - the shop to create the product for
 * @param {Number} input.desiredOrderCount - the desired count of orders to reach in the database
 * @returns {Number} the number of orders created
 */
export default async function loadOrders(context, input) {
  const { desiredOrderCount, shopId } = input;

  const isUserShopOwner = await context.userHasPermission("reaction:legacy:shops", "owner", { shopId });

  if (isUserShopOwner === false) {
    throw new ReactionError("access-denied", "User has to be a shop owner");
  }

  const {
    collections: {
      Catalog,
      Orders,
      Shipping,
      Shops
    }
  } = context;

  const shop = await Shops.findOne({ _id: shopId });

  const orderCursor = Orders.find({});
  let orderCount = await orderCursor.count();

  const shippingProviders = await Shipping.find({
    "provider.enabled": true,
    "methods.enabled": true
  }).toArray();

  const insertedOrders = [];

  for (orderCount; orderCount < desiredOrderCount; orderCount += 1) {
    let randomProduct = await Catalog.aggregate([{ "$sample": { size: 1 } }]).toArray();
    [randomProduct] = randomProduct;

    const productVariant = randomProduct.product.variants && randomProduct.product.variants.length > 0 && randomProduct.product.variants[0];
    const randomShippingProvider = faker.random.arrayElement(shippingProviders);
    const randomFulfillmentMethod = faker.random.arrayElement(randomShippingProvider.methods);
    const quantity = faker.random.number(9) + 1; // Make sure we don't have 0 quantity
    const totalPrice = productVariant.pricing[shop.currency].maxPrice * quantity + randomFulfillmentMethod.rate + randomFulfillmentMethod.handling;
    const address = {
      fullName: `${faker.name.firstName()} ${faker.name.lastName()}`,
      address1: faker.address.streetAddress(),
      city: faker.address.city(),
      phone: faker.phone.phoneNumber(),
      region: faker.address.state(),
      postal: faker.address.zipCode(),
      country: faker.address.country(),
      isCommercial: faker.random.boolean()
    };

    const order = {
      order: {
        currencyCode: shop.currency,
        email: faker.internet.email(),
        fulfillmentGroups: [
          {
            data: {
              shippingAddress: address
            },
            items: [
              {
                price: productVariant.pricing[shop.currency].maxPrice || 0,
                productConfiguration: {
                  productId: randomProduct.product._id,
                  productVariantId: productVariant._id
                },
                quantity
              }
            ],
            selectedFulfillmentMethodId: randomFulfillmentMethod._id,
            shopId,
            totalPrice,
            type: faker.random.arrayElement(randomFulfillmentMethod.fulfillmentTypes)
          }
        ],
        shopId
      },
      payments: [
        {
          amount: totalPrice,
          billingAddress: address,
          data: {
            fullName: address.fullName
          },
          method: faker.random.arrayElement(shop.availablePaymentMethods)
        }
      ]
    };

    const placeOrderPayload = await context.mutations.placeOrder(context, order);
    insertedOrders.push(...placeOrderPayload.orders);
  }

  return {
    ordersCreated: insertedOrders.length
  };
}

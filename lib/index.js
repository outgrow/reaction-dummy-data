import mutations from "./graphql/mutations/index.js";
import resolvers from "./graphql/resolvers/index.js";
import schemas from "./graphql/schemas/index.js";


/**
 * @summary Registers the plugin.
 * @param {ReactionAPI} api The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(api) {
  await api.registerPlugin({
    label: "Dummy Data",
    name: "reaction-dummy-data",
    graphQL: {
      resolvers,
      schemas
    },
    mutations,
    i18n: {
      translations: [{
        i18n: "en",
        ns: "reaction-dummy-data",
        translation: {
          "reaction-dummy-data": {
            dummyDataSetting: {
              sidebarLabel: "Dummy Data"
            }
          }
        }
      }]
    }
  });
}

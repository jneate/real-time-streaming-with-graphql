import { generatePubSub } from "./kafkaPubSub";

const countryTopic = 'country-topic';
const purchaseTopic = 'purchase-topic';

const countryPubsub = generatePubSub(countryTopic);
const purchasePubsub = generatePubSub(purchaseTopic);

export const resolvers = {
  Subscription: {
    fetchCountries: {
      subscribe: () => countryPubsub.asyncIterator([countryTopic])
    },
    fetchPurchases: {
      subscribe: () => purchasePubsub.asyncIterator([purchaseTopic])
    },
  }
};
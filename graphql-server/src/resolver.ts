import { pubsub } from "./kafkaPubSub";

export const resolvers = {
  Subscription: {
    fetchCountries: {
      subscribe: () => pubsub.asyncIterator(['country-topic'])
    }
  }
};
// Schema definition
export const typeDefs = `
  type Query {
    totalCountries: Int
  }

  type Country {
    countryName: String
    population: Int
    cca3: String
  }

  type Purchase {
    country: String
    category: String
    cost: Float
    reference: String
  }
  
  type Subscription {
    fetchCountries: Country
    fetchPurchases: Purchase
  }
`;
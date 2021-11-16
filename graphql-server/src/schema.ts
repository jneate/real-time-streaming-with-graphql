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
  
  "The subscription type to receive events"
  type Subscription {
    fetchCountries: Country
  }
`;
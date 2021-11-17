export interface Country {
  countryName: string
  population: number
  cca3: string
}

export interface CountrySubscription {
  fetchCountries: Country
}

export interface Purchase {
  country: string
  category: string
  cost: number
  reference: string
}

export interface PurchaseSubscription {
  fetchPurchases: Purchase
}
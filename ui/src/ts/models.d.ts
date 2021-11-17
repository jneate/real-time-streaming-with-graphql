export interface Country {
    countryName: string;
    population: number;
    cca3: string;
}
export interface CountrySubscription {
    fetchCountries: Country;
}

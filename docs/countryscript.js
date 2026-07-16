import {checkHostName} from "./utils.js";

const COUNTRIES_JSON_URL = "./data/countries.json";

const countriesList = document.createElement("div");
  countriesList.id = "countriesContainer";
  document.body.appendChild(countriesList);

const countriesFilter = document.getElementById("filterCountries");

const filters = [
  "Less than or Equal to 1 Million",
  "Greater than 1 Million"
];

const countriesArr = [];

filters.forEach(item => {
  const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
  countriesFilter.appendChild(option);
});

countriesFilter.value = "All";

countriesFilter.addEventListener("change", function () {
  displayCountries();
});

function displayCountries() {
  countriesList.innerHTML = "";

  let filteredCountries = countriesArr;

  if (countriesFilter.value === "Less than or Equal to 1 Million") {
    filteredCountries = countriesArr.filter(country => country.population <= 1000000);
  } else if (countriesFilter.value === "Greater than 1 Million") {
    filteredCountries = countriesArr.filter(country => country.population > 1000000);
  }

  filteredCountries.forEach((country, index) => {
    createCountry(country, index + 1);
  });
}

function createCountry(countryInfo, number) {
  
  const card = document.createElement("div");
    card.className = "country-card";

  const flag = document.createElement("img");
    flag.className = "country-flag";
    flag.src = countryInfo.flagpng;
    flag.alt = countryInfo.countryName;

  if (countryInfo.population < 1000000) {
    flag.style.border = "3px solid #008000";
    flag.style.boxShadow = "0 4px 8px green";
  }

  const cardNumber = document.createElement("div");
    cardNumber.className = "card-number";
    cardNumber.textContent = number;

  const countryDesc = document.createElement("ul");
    countryDesc.className = "country-details";
    countryDesc.className = "list-unstyled text-start ps-2 mt-3";

  const countryName = document.createElement("li");
    countryName.textContent = "Country Name: " + countryInfo.countryName;
    countryName.className = "mb-2 text-start fw-semibold text-dark";

  const countryCapital = document.createElement("li");
    countryCapital.textContent = "Capital: " + countryInfo.capital;
    countryCapital.className = "mb-2 text-start fw-semibold text-dark";

  const countryPopulation = document.createElement("li");
    countryPopulation.textContent = "Population: " + countryInfo.population;
    countryPopulation.className = "mb-2 text-start fw-semibold text-dark";

  countryDesc.appendChild(countryName);
  countryDesc.appendChild(countryCapital);
  countryDesc.appendChild(countryPopulation);

  card.appendChild(cardNumber);
  card.appendChild(flag);
  card.appendChild(countryDesc);

  countriesList.appendChild(card);
}

async function getCountries() {
  try {
    const response = await fetch(COUNTRIES_JSON_URL);

    if (!response.ok) {
      throw new Error("Failed to load countries.json");
    }

    const countries = await response.json();

    countriesArr.length = 0;

    countries.forEach(country => {
      const Country = {
        countryName: country.countryName,
        flagpng: country.flagpng,
        capital: country.capital,
        population: country.population
      };

      countriesArr.push(Country);
    });

    displayCountries();

  } catch (error) {
    console.error("Failed to fetch countries:", error.message);
  }
}

window.addEventListener("load",checkHostName);
getCountries();
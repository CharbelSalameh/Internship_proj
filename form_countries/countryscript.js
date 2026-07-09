const API_URL = "https://api.restcountries.com/countries/v5";
const API_KEY = "rc_live_6266955c622e46d4b7b6ca61f0993313";

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
    let limit = 100;
    let offset = 0;
    let moreCountries = true;

    while (moreCountries) {
      const response = await fetch(`${API_URL}?limit=${limit}&offset=${offset}`, {
        headers: {
          "Authorization": `Bearer ${API_KEY}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      const countries = result.data.objects;

      countries.forEach(country => {
        const Country = {
          countryName: country.names.common,
          flagpng: country.flag.url_png,
          capital: country.capitals?.[0]?.name,
          population: country.population
        };

        countriesArr.push(Country);
      });

      moreCountries = result.data.meta.more;
      offset += limit;
    }

    displayCountries();
  } catch (error) {
    console.error("Failed to fetch countries:", error.message);
  }
}
getCountries();
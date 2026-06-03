const DATASET_ID = "d_696c994c50745b079b3684f0e90ffc53";
const API_BASE_URL = "https://data.gov.sg/api/action/datastore_search";
const PAGE_SIZE = 500;
const MAX_VISIBLE_RESULTS = 100;
const STORAGE_KEY = "littleLearnersSavedCentres";

let allCentres = [];
let filteredCentres = [];
let savedCentreIds = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const elements = {
  dataStatus: document.querySelector("#data-status"),
  form: document.querySelector("#filter-form"),
  searchInput: document.querySelector("#search-input"),
  serviceFilter: document.querySelector("#service-filter"),
  vacancyFilter: document.querySelector("#vacancy-filter"),
  foodFilter: document.querySelector("#food-filter"),
  languageFilter: document.querySelector("#language-filter"),
  resultCount: document.querySelector("#result-count"),
  availableCount: document.querySelector("#available-count"),
  savedCount: document.querySelector("#saved-count"),
  resultNote: document.querySelector("#result-note"),
  resultsGrid: document.querySelector("#results-grid"),
  emptyState: document.querySelector("#empty-state"),
  googleMap: document.querySelector("#google-map"),
  openGoogleMap: document.querySelector("#open-google-map"),
  selectedCentre: document.querySelector("#selected-centre"),
  savedGrid: document.querySelector("#saved-grid"),
  clearSaved: document.querySelector("#clear-saved"),
  dialog: document.querySelector("#details-dialog"),
  dialogTitle: document.querySelector("#dialog-title"),
  dialogBody: document.querySelector("#dialog-body"),
  closeDialog: document.querySelector("#close-dialog")
};

const sampleCentres = [
  {
    centre_code: "SAMPLE-001",
    centre_name: "Little Seeds Preschool @ Tampines",
    organisation_description: "Anchor Operator",
    service_model: "CC",
    centre_contact_no: "6123 4567",
    centre_email_address: "hello@littleseeds.example",
    centre_address: "10 Tampines Street 23",
    postal_code: "529123",
    food_offered: "No Pork No Lard with No Beef",
    second_languages_offered: "Chinese|Malay",
    weekday_full_day: "07:00-19:00",
    scheme_type: "Anchor Operator Scheme",
    government_subsidy: "Yes",
    infant_vacancy_current_month: "Available",
    n1_vacancy_current_month: "Limited"
  },
  {
    centre_code: "SAMPLE-002",
    centre_name: "Bright Steps Kindergarten",
    organisation_description: "Private Operators",
    service_model: "KN",
    centre_contact_no: "6987 6543",
    centre_email_address: "care@brightsteps.example",
    centre_address: "55 Ang Mo Kio Avenue 3",
    postal_code: "560055",
    food_offered: "Others",
    second_languages_offered: "Chinese|Tamil",
    weekday_full_day: "08:00-17:00",
    scheme_type: "Not Applicable",
    k1_vacancy_current_month: "Full"
  }
];

async function loadCentres() {
  elements.dataStatus.textContent = "Loading centre data from data.gov.sg...";

  try {
    const firstPage = await fetchCentresPage(0);
    const total = firstPage.result.total;
    let records = firstPage.result.records;

    for (let offset = PAGE_SIZE; offset < total; offset += PAGE_SIZE) {
      elements.dataStatus.textContent = `Loading ${Math.min(offset + PAGE_SIZE, total)} of ${total} centres...`;
      const nextPage = await fetchCentresPage(offset);
      records = records.concat(nextPage.result.records);
    }

    allCentres = records.map(formatCentre).sort(sortByName);
    elements.dataStatus.textContent = `Loaded ${allCentres.length} centres from data.gov.sg.`;
  } catch (error) {
    allCentres = sampleCentres.map(formatCentre);
    elements.dataStatus.textContent =
      "Live data could not be loaded. Sample records are shown for testing.";
  }

  filterCentres();

  if (filteredCentres.length > 0) {
    showOnMap(filteredCentres[0].id);
  }
}

async function fetchCentresPage(offset) {
  const url = `${API_BASE_URL}?resource_id=${DATASET_ID}&limit=${PAGE_SIZE}&offset=${offset}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Unable to load data.gov.sg data");
  }

  return response.json();
}

function formatCentre(record) {
  const centreCode = getField(record, ["centre_code", "Centre Code", "tp_code", "_id"]);
  const name = getField(record, ["centre_name", "Centre Name"]);
  const address = getField(record, ["centre_address", "Centre Address"]);
  const postalCode = getField(record, ["postal_code", "Postal Code"]);

  return {
    id: centreCode !== "Not stated" ? centreCode : `${name}-${postalCode}`,
    name,
    operator: getField(record, ["organisation_description", "Organisation Description"]),
    serviceModel: getField(record, ["service_model", "Service Model"]),
    serviceLabel: getServiceLabel(getField(record, ["service_model", "Service Model"])),
    phone: getField(record, ["centre_contact_no", "contactno_lifesg", "Centre Contact No"]),
    email: getField(record, ["centre_email_address", "emailaddress_lifesg", "Centre Email Address"]),
    website: getField(record, ["centre_website", "website_lifesg", "Centre Website"]),
    address,
    postalCode,
    location: createLocationText(address, postalCode),
    food: getField(record, ["food_offered", "Food Offered"]),
    language: getField(record, ["second_languages_offered", "Second Languages Offered"]),
    sparkCertified: getField(record, ["spark_certified", "Spark Certified"]),
    hours: getField(record, ["weekday_full_day", "Weekday Full Day"]),
    saturday: getField(record, ["saturday", "Saturday"]),
    scheme: getField(record, ["scheme_type", "Scheme Type"]),
    extendedHours: getField(record, ["extended_operating_hours", "Extended Operating Hours"]),
    transport: getField(record, ["provision_of_transport", "Provision Of Transport"]),
    subsidy: getField(record, ["government_subsidy", "Government Subsidy"]),
    gst: getField(record, ["gst_regisration", "Gst Regisration"]),
    lastUpdated: getField(record, ["last_updated", "Last Updated"]),
    vacancy: getCurrentVacancy(record)
  };
}

function getField(record, possibleNames) {
  const keys = Object.keys(record);

  for (const name of possibleNames) {
    const matchingKey = keys.find((key) => cleanKey(key) === cleanKey(name));

    if (matchingKey && hasValue(record[matchingKey])) {
      return String(record[matchingKey]).trim();
    }
  }

  return "Not stated";
}

function cleanKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hasValue(value) {
  if (value === undefined || value === null) return false;

  const text = String(value).trim().toLowerCase();
  return text !== "" && text !== "na" && text !== "null" && text !== "not applicable";
}

function createLocationText(address, postalCode) {
  if (address !== "Not stated" && postalCode !== "Not stated") {
    return `${address}, Singapore ${postalCode}`;
  }

  if (address !== "Not stated") return `${address}, Singapore`;
  if (postalCode !== "Not stated") return `Singapore ${postalCode}`;
  return "Singapore preschool";
}

function getCurrentVacancy(record) {
  const vacancyValues = Object.entries(record)
    .filter(([key]) => {
      const normalisedKey = key.toLowerCase();
      return normalisedKey.includes("vacancy") && normalisedKey.includes("current");
    })
    .map(([, value]) => String(value).trim().toLowerCase());

  if (vacancyValues.some((value) => value.includes("available"))) return "Available";
  if (vacancyValues.some((value) => value.includes("limited"))) return "Limited";
  if (vacancyValues.some((value) => value.includes("full"))) return "Full";

  return "Not stated";
}

function filterCentres() {
  const searchText = elements.searchInput.value.trim().toLowerCase();
  const service = elements.serviceFilter.value;
  const vacancy = elements.vacancyFilter.value;
  const food = elements.foodFilter.value;
  const language = elements.languageFilter.value;

  filteredCentres = allCentres.filter((centre) => {
    const combinedText = [
      centre.name,
      centre.operator,
      centre.serviceModel,
      centre.location,
      centre.food,
      centre.language,
      centre.scheme
    ]
      .join(" ")
      .toLowerCase();

    return (
      combinedText.includes(searchText) &&
      matchesService(centre, service) &&
      matchesVacancy(centre, vacancy) &&
      matchesFood(centre, food) &&
      matchesLanguage(centre, language)
    );
  });

  renderResults();
  renderSavedCentres();
  updateSummary();
}

function matchesService(centre, service) {
  return service === "all" || centre.serviceModel.toUpperCase().includes(service);
}

function getServiceLabel(serviceModel) {
  const text = serviceModel.toUpperCase();

  if (text.includes("CC")) return "Childcare";
  if (text.includes("KN")) return "Kindergarten";
  if (text.includes("DS")) return "Development Support";

  return serviceModel;
}

function matchesVacancy(centre, vacancy) {
  return vacancy === "all" || centre.vacancy.toLowerCase().includes(vacancy);
}

function matchesFood(centre, food) {
  const foodText = centre.food.toLowerCase();

  if (food === "all") return true;
  if (food === "no-pork") return foodText.includes("no pork");
  return foodText.includes(food);
}

function matchesLanguage(centre, language) {
  return language === "all" || centre.language.toLowerCase().includes(language);
}

function renderResults() {
  elements.resultsGrid.innerHTML = "";
  elements.emptyState.hidden = filteredCentres.length > 0;

  const visibleCentres = filteredCentres.slice(0, MAX_VISIBLE_RESULTS);

  elements.resultNote.textContent =
    filteredCentres.length > MAX_VISIBLE_RESULTS
      ? `Showing the first ${MAX_VISIBLE_RESULTS} matches. Use search or filters to narrow the list.`
      : "";

  visibleCentres.forEach((centre) => {
    const card = document.createElement("article");
    card.className = "centre-card";

    const isSaved = savedCentreIds.includes(centre.id);
    const vacancyClass = getVacancyClass(centre.vacancy);

    card.innerHTML = `
      <h3>${escapeHTML(centre.name)}</h3>
      <p class="location"><strong>Location:</strong> ${escapeHTML(centre.location)}</p>
      <p class="muted">${escapeHTML(centre.operator)}</p>

      <div class="tag-row">
        <span class="tag ${getServiceClass(centre.serviceModel)}">${escapeHTML(centre.serviceLabel)}</span>
        <span class="tag ${vacancyClass}">${escapeHTML(centre.vacancy)}</span>
        <span class="tag">${escapeHTML(centre.language)}</span>
      </div>

      <p><strong>Food:</strong> ${escapeHTML(centre.food)}</p>
      <p><strong>Hours:</strong> ${escapeHTML(centre.hours)}</p>

      <div class="card-actions">
        <button class="button secondary" type="button" data-action="map" data-id="${escapeHTML(centre.id)}">View map</button>
        <button class="button secondary" type="button" data-action="details" data-id="${escapeHTML(centre.id)}">Details</button>
        <button class="button primary" type="button" data-action="save" data-id="${escapeHTML(centre.id)}">${isSaved ? "Saved" : "Save"}</button>
      </div>
    `;

    elements.resultsGrid.appendChild(card);
  });
}

function getServiceClass(serviceModel) {
  if (serviceModel.toUpperCase().includes("CC")) return "childcare";
  if (serviceModel.toUpperCase().includes("KN")) return "kindergarten";
  return "";
}

function getVacancyClass(vacancy) {
  const text = vacancy.toLowerCase();

  if (text.includes("available")) return "available";
  if (text.includes("limited")) return "limited";
  if (text.includes("full")) return "full";
  return "";
}

function updateSummary() {
  elements.resultCount.textContent = filteredCentres.length;
  elements.savedCount.textContent = savedCentreIds.length;
  elements.availableCount.textContent = filteredCentres.filter((centre) =>
    centre.vacancy.toLowerCase().includes("available")
  ).length;
}

function showOnMap(id) {
  const centre = allCentres.find((item) => item.id === id);

  if (!centre) return;

  const query = encodeURIComponent(centre.location);
  const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
  const openUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

  elements.googleMap.src = embedUrl;
  elements.openGoogleMap.href = openUrl;
  elements.selectedCentre.innerHTML = `
    <strong>${escapeHTML(centre.name)}</strong>
    <span>${escapeHTML(centre.location)}</span>
  `;
}

function showDetails(id) {
  const centre = allCentres.find((item) => item.id === id);

  if (!centre) return;

  elements.dialogTitle.textContent = centre.name;
  elements.dialogBody.innerHTML = `
    <div class="details-grid">
      ${detailItem("Address", centre.location)}
      ${detailItem("Service model", centre.serviceLabel)}
      ${detailItem("Vacancy", centre.vacancy)}
      ${detailItem("Food", centre.food)}
      ${detailItem("Language", centre.language)}
      ${detailItem("Weekday hours", centre.hours)}
      ${detailItem("Saturday hours", centre.saturday)}
      ${detailItem("Scheme", centre.scheme)}
      ${detailItem("SPARK certified", centre.sparkCertified)}
      ${detailItem("Transport", centre.transport)}
      ${detailItem("Government subsidy", centre.subsidy)}
      ${detailItem("Extended hours", centre.extendedHours)}
      ${detailItem("Phone", centre.phone)}
      ${detailItem("Email", centre.email)}
      ${detailItem("Website", centre.website)}
      ${detailItem("Last updated", centre.lastUpdated)}
    </div>
  `;
  elements.dialog.showModal();
}

function detailItem(label, value) {
  return `
    <div>
      <strong>${escapeHTML(label)}</strong>
      <span>${escapeHTML(value)}</span>
    </div>
  `;
}

function toggleSavedCentre(id) {
  if (savedCentreIds.includes(id)) {
    savedCentreIds = savedCentreIds.filter((savedId) => savedId !== id);
  } else {
    savedCentreIds.push(id);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCentreIds));
  filterCentres();
}

function renderSavedCentres() {
  const savedCentres = allCentres.filter((centre) => savedCentreIds.includes(centre.id));
  elements.savedGrid.innerHTML = "";

  if (savedCentres.length === 0) {
    elements.savedGrid.innerHTML =
      '<div class="empty-state"><h3>No saved centres yet</h3><p>Click Save on a centre to keep it here.</p></div>';
    return;
  }

  savedCentres.forEach((centre) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.innerHTML = `
      <strong>${escapeHTML(centre.name)}</strong>
      <span>${escapeHTML(centre.location)}</span>
      <span>${escapeHTML(centre.phone)} - ${escapeHTML(centre.vacancy)}</span>
      <div class="card-actions">
        <button class="button secondary" type="button" data-action="map" data-id="${escapeHTML(centre.id)}">View map</button>
        <button class="button secondary" type="button" data-action="details" data-id="${escapeHTML(centre.id)}">Details</button>
      </div>
    `;
    elements.savedGrid.appendChild(card);
  });
}

function sortByName(a, b) {
  return a.name.localeCompare(b.name);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.form.addEventListener("input", filterCentres);

elements.form.addEventListener("reset", () => {
  setTimeout(filterCentres, 0);
});

elements.resultsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;

  if (button.dataset.action === "map") showOnMap(id);
  if (button.dataset.action === "details") showDetails(id);
  if (button.dataset.action === "save") toggleSavedCentre(id);
});

elements.savedGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = button.dataset.id;

  if (button.dataset.action === "map") showOnMap(id);
  if (button.dataset.action === "details") showDetails(id);
});

elements.clearSaved.addEventListener("click", () => {
  savedCentreIds = [];
  localStorage.removeItem(STORAGE_KEY);
  filterCentres();
});

elements.closeDialog.addEventListener("click", () => {
  elements.dialog.close();
});

loadCentres();

const FUEL_ECONOMY_BASE_URL = "https://www.fueleconomy.gov/ws/rest/vehicle";

const KNOWN_MAKES = [
  "Acura", "Audi", "BMW", "Buick", "Cadillac", "Chevrolet", "Chrysler", "Dodge", "Ford",
  "GMC", "Honda", "Hyundai", "Jeep", "Kia", "Lexus", "Lincoln", "Mazda", "Mercedes-Benz",
  "Nissan", "Ram", "Subaru", "Tesla", "Toyota", "Volkswagen", "Volvo"
];
const POPULAR_MAKES = ["Toyota", "Honda", "Ford", "Chevrolet", "Nissan", "Hyundai", "Kia", "Subaru", "Tesla", "Jeep"];

function decodeXml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .trim();
}

function parseMenuItems(xml = "") {
  return [...xml.matchAll(/<menuItem>[\s\S]*?<text>([\s\S]*?)<\/text>[\s\S]*?<value>([\s\S]*?)<\/value>[\s\S]*?<\/menuItem>/g)]
    .map((match) => ({
      text: decodeXml(match[1]),
      value: decodeXml(match[2])
    }));
}

function parseTag(xml = "", tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  return match ? decodeXml(match[1]) : "";
}

function normalizeFuelType(rawFuelType = "") {
  const fuelType = rawFuelType.toLowerCase();
  if (fuelType.includes("electric")) return "EV";
  if (fuelType.includes("diesel")) return "diesel";
  if (fuelType.includes("hybrid") || fuelType.includes("phev")) return "hybrid";
  return "gas";
}

function inferTankCapacity({ fuelType, vehicleClass, highwayMpg }) {
  if (fuelType === "EV") return 0;
  const className = String(vehicleClass || "").toLowerCase();
  if (className.includes("pickup") || className.includes("van")) return 24;
  if (className.includes("sport utility") || className.includes("suv")) return 18.5;
  if (className.includes("large")) return 18;
  if (fuelType === "hybrid" || Number(highwayMpg) >= 40) return 13.2;
  return 15.8;
}

function buildVehiclePhotoUrl({ year, make, model }) {
  const baseUrl = process.env.EXPO_PUBLIC_VEHICLE_IMAGE_BASE_URL;
  if (!baseUrl || !year || !make || !model) return null;
  const url = new URL(baseUrl);
  url.searchParams.set("year", year);
  url.searchParams.set("make", make);
  url.searchParams.set("model", model);
  return url.toString();
}

async function fuelEconomyRequest(path, params = {}) {
  const url = new URL(`${FUEL_ECONOMY_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  const response = await fetch(url.toString(), {
    headers: { Accept: "application/xml" }
  });
  if (!response.ok) {
    throw new Error(`Vehicle lookup failed (${response.status}).`);
  }
  return response.text();
}

export async function getVehicleYears() {
  const xml = await fuelEconomyRequest("/menu/year");
  return parseMenuItems(xml)
    .map((item) => item.value || item.text)
    .filter(Boolean)
    .slice(0, 18);
}

export async function getVehicleMakes(year) {
  const xml = await fuelEconomyRequest("/menu/make", { year });
  const makes = parseMenuItems(xml).map((item) => item.text).filter(Boolean);
  return [
    ...POPULAR_MAKES.filter((make) => makes.includes(make)),
    ...makes.filter((make) => !POPULAR_MAKES.includes(make))
  ];
}

export async function getVehicleModels(year, make) {
  const xml = await fuelEconomyRequest("/menu/model", { year, make });
  return parseMenuItems(xml).map((item) => item.text).filter(Boolean);
}

async function getVehicleDetailsById(id, { year, make, model, trim } = {}) {
  const detailXml = await fuelEconomyRequest(`/${id}`);
  const rawFuelType = parseTag(detailXml, "fuelType") || parseTag(detailXml, "fuelType1");
  const fuelType = normalizeFuelType(rawFuelType);
  const highwayMpg = Number(parseTag(detailXml, "highway08")) || Number(parseTag(detailXml, "highwayA08")) || 0;
  const cityMpg = Number(parseTag(detailXml, "city08")) || Number(parseTag(detailXml, "cityA08")) || 0;
  const vehicleClass = parseTag(detailXml, "VClass");
  const cylinders = parseTag(detailXml, "cylinders");
  const displacement = parseTag(detailXml, "displ");
  const transmission = parseTag(detailXml, "trany");
  const drive = parseTag(detailXml, "drive");

  return {
    id: `fueleconomy-${id}`,
    vehicleName: [year, make, model].filter(Boolean).join(" "),
    trim,
    fuelType,
    cityMpg,
    highwayMpg,
    tankCapacity: inferTankCapacity({ fuelType, vehicleClass, highwayMpg }),
    engine: [displacement ? `${displacement}L` : "", cylinders ? `${cylinders} cyl` : ""].filter(Boolean).join(" "),
    transmission,
    drive,
    vehicleClass,
    photoUrl: buildVehiclePhotoUrl({ year, make, model }),
    source: "EPA fuel economy",
    sourceId: id
  };
}

export async function getVehicleOptions(year, make, model) {
  const optionsXml = await fuelEconomyRequest("/menu/options", { year, make, model });
  const options = parseMenuItems(optionsXml).slice(0, 6);
  return Promise.all(
    options.map((option) => getVehicleDetailsById(option.value, {
      year,
      make,
      model,
      trim: option.text
    }))
  );
}

export function parseVehicleQuery(query = "") {
  const normalized = query.replace(/\s+/g, " ").trim();
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : "";
  const withoutYear = normalized.replace(year, "").trim();
  const lower = withoutYear.toLowerCase();
  const make = KNOWN_MAKES.find((item) => lower.startsWith(item.toLowerCase())) || "";
  const model = make ? withoutYear.slice(make.length).trim() : "";

  return { year, make, model };
}

export async function lookupVehicleSpecs(query) {
  const { year, make, model } = parseVehicleQuery(query);
  if (!year || !make || model.length < 2) return [];

  const optionsXml = await fuelEconomyRequest("/menu/options", { year, make, model });
  const options = parseMenuItems(optionsXml).slice(0, 5);
  const detailRequests = options.map((option) => getVehicleDetailsById(option.value, { year, make, model, trim: option.text }));

  const vehicles = await Promise.all(detailRequests);
  return vehicles.filter((item) => item.cityMpg || item.highwayMpg || item.fuelType === "EV");
}

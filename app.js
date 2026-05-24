function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const clockElement = document.getElementById("clock");
  if (clockElement) clockElement.innerText = `${hours}:${minutes}`;
}

function updateDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const dateElement = document.getElementById("date");
  if (dateElement) dateElement.innerText = `${day}/${month}/${year}`;
}

let oldPrices = {};

const madenOrder = [
  "HAS ALTIN", "HAS ALTIN ÇEKİLİ", "ALTIN ONS", "USD KG",
  "ALTIN USDKG", "EUR KG", "ALTIN EURKG", "GÜMÜŞ ONS",
  "GÜMÜŞ TL", "GÜMÜŞ USD", "GÜMÜŞ EUR", "ALTIN GÜMÜŞ",
  "PLATIN ONS", "PALADYUM ONS", "14 AYAR", "22 AYAR"
];

const sarrafiyeOrder = [
  "YENİ ÇEYREK", "ESKİ ÇEYREK", "YENİ YARIM", "ESKİ YARIM",
  "YENİ TAM", "ESKİ TAM", "YENİ ATA", "ESKİ ATA",
  "YENİ GREMSE", "ESKİ GREMSE", "YENİ ATA5", "ESKİ ATA5",
  "GRAM ALTIN"
];

const dovizOrder = [
  "USDTRY", "EURTRY", "EURUSD", "GBPTRY", "CHFTRY",
  "AUDTRY", "CADTRY", "SARTRY", "JPYTRY"
];

function cleanName(name) {
  return String(name)
    .toUpperCase()
    .replaceAll("İ", "I")
    .replaceAll("Ü", "U")
    .replaceAll("Ş", "S")
    .replaceAll("Ğ", "G")
    .replaceAll("Ö", "O")
    .replaceAll("Ç", "C")
    .replace(/[^A-Z0-9]/g, "");
}

function getOrderIndex(itemName, orderList) {
  const item = cleanName(itemName);

  const index = orderList.findIndex(orderName => {
    const order = cleanName(orderName);
    return item === order || item.includes(order) || order.includes(item);
  });

  return index === -1 ? 999 : index;
}

function getCategory(itemName) {
  const name = cleanName(itemName);

  if (
    name.includes("CEYREK") ||
    name.includes("YARIM") ||
    name.includes("TAM") ||
    name.includes("ATA") ||
    name.includes("GREMSE")
  ) {
    return "sarrafiye";
  }

  return "maden";
}

function parsePrice(value) {
  return parseFloat(String(value).replace(".", "").replace(",", "."));
}

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return number.toFixed(3);
}

function createGoldRow(item) {
  const buy = item.buy;
  const sell = item.sell;

  const buyNumber = parsePrice(buy);
  const sellNumber = parsePrice(sell);

  let buyClass = "";
  let sellClass = "";

  if (oldPrices[item.key]) {
    if (buyNumber > oldPrices[item.key].buy) buyClass = "up";
    else if (buyNumber < oldPrices[item.key].buy) buyClass = "down";

    if (sellNumber > oldPrices[item.key].sell) sellClass = "up";
    else if (sellNumber < oldPrices[item.key].sell) sellClass = "down";
  }

  oldPrices[item.key] = {
    buy: buyNumber,
    sell: sellNumber
  };

  return `
    <tr>
      <td>${item.key}</td>
      <td class="${buyClass}">${buy}</td>
      <td class="${sellClass}">${sell}</td>
    </tr>
  `;
}

async function loadGold() {
  try {
    const response = await fetch(
      "https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices/23b4c2fb31a242d1eebc0df9b9b65e5e",
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": "a1692331famsh5bbb25822034d5bp180102jsn1334712f8d03",
          "x-rapidapi-host": "harem-altin-live-gold-price-data.p.rapidapi.com"
        }
      }
    );

    const result = await response.json();

    const madenBody = document.getElementById("madenBody");
    const sarrafiyeBody = document.getElementById("sarrafiyeBody");

    if (!madenBody || !sarrafiyeBody || !Array.isArray(result.data)) return;

    const madenItems = [];
    const sarrafiyeItems = [];

    result.data.forEach(item => {
      if (getCategory(item.key) === "sarrafiye") {
        sarrafiyeItems.push(item);
      } else {
        madenItems.push(item);
      }
    });

    madenItems.sort((a, b) => getOrderIndex(a.key, madenOrder) - getOrderIndex(b.key, madenOrder));
    sarrafiyeItems.sort((a, b) => getOrderIndex(a.key, sarrafiyeOrder) - getOrderIndex(b.key, sarrafiyeOrder));

    madenBody.innerHTML = madenItems.map(createGoldRow).join("");
    sarrafiyeBody.innerHTML = sarrafiyeItems.map(createGoldRow).join("");

  } catch (err) {
    console.log("Gold Error:", err);
  }
}

async function loadDoviz() {
  try {
    const response = await fetch(
      "https://altinapi-turkish-live-gold-prices1.p.rapidapi.com/prices/category/DOVIZ",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": "a1692331famsh5bbb25822034d5bp180102jsn1334712f8d03",
          "x-rapidapi-host": "altinapi-turkish-live-gold-prices1.p.rapidapi.com"
        }
      }
    );

    const result = await response.json();
    const dovizBody = document.getElementById("dovizBody");

    if (!dovizBody || !Array.isArray(result.data)) {
      console.log("Döviz data gelmedi:", result);
      return;
    }

    const rows = result.data
      .map(item => {
        const code = cleanName(item.symbol || item.kod || "");

        return {
          code,
          buy: item.bid ?? item.alis,
          sell: item.ask ?? item.satis
        };
      })
      .filter(item => dovizOrder.includes(item.code))
      .sort((a, b) => dovizOrder.indexOf(a.code) - dovizOrder.indexOf(b.code));

    if (rows.length === 0) {
      console.log("Döviz eşleşmedi:", result.data);
      return;
    }

    dovizBody.innerHTML = rows.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${formatNumber(item.buy)}</td>
        <td>${formatNumber(item.sell)}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.log("Döviz Error:", err);
  }
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("show");
}

updateClock();
setInterval(updateClock, 1000);

updateDate();
setInterval(updateDate, 60000);

loadGold();
setInterval(loadGold, 60000);

loadDoviz();
setInterval(loadDoviz, 60000);
 
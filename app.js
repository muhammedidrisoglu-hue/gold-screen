const ALTINAPI_KEY = "hapi_0213f88582a046e6836fdb7bafb43c3d";

let oldPrices = {};
let oldTickerPrices = {};
let tickerData = {};
let latestItems = {};

const symbols = [
  "ALTIN",
  "XAUUSD",
  "PARUSD",
  "PAREUR",
  "GUMUSD",
  "XAGUSD",
  "XAUXAG",

  "CEYREK_YENI",
  "CEYREK_ESKI",
  "YARIM_YENI",
  "YARIM_ESKI",
  "TEK_YENI",
  "TEK_ESKI",
  "ATA_YENI",
  "ATA_ESKI",
  "GREMESE_YENI",
  "GREMESE_ESKI",
  "ATA5_YENI",
  "ATA5_ESKI",

  "USDTRY",
  "EURTRY",
  "EURUSD",
  "GBPTRY",
  "CHFTRY",
  "AUDTRY",
  "CADTRY",
  "SARTRY",
  "JPYTRY"
];

const nameMap = {
  ALTIN: "HAS ALTIN",
  XAUUSD: "ALTIN ONS",
  PARUSD: "USD/KG",
  PAREUR: "EUR/KG",
  GUMUSD: "GÜMÜŞ USD",
  XAGUSD: "GÜMÜŞ ONS",
  XAUXAG: "ALTIN GÜMÜŞ",

  CEYREK_YENI: "YENİ ÇEYREK",
  CEYREK_ESKI: "ESKİ ÇEYREK",

  YARIM_YENI: "YENİ YARIM",
  YARIM_ESKI: "ESKİ YARIM",

  TEK_YENI: "YENİ TAM",
  TEK_ESKI: "ESKİ TAM",

  ATA_YENI: "YENİ ATA",
  ATA_ESKI: "ESKİ ATA",

  GREMESE_YENI: "YENİ GREMSE",
  GREMESE_ESKI: "ESKİ GREMSE",

  ATA5_YENI: "YENİ ATA5",
  ATA5_ESKI: "ESKİ ATA5"
};

const madenOrder = [
  "HAS ALTIN",
  "ALTIN ONS",
  "USD/KG",
  "EUR/KG",
  "GÜMÜŞ USD",
  "GÜMÜŞ ONS",
  "ALTIN GÜMÜŞ"
];

const dovizOrder = [
  "USDTRY",
  "EURTRY",
  "EURUSD",
  "GBPTRY",
  "CHFTRY",
  "AUDTRY",
  "CADTRY",
  "SARTRY",
  "JPYTRY"
];

const sarrafiyeOrder = [
  "YENİ ÇEYREK",
  "ESKİ ÇEYREK",
  "YENİ YARIM",
  "ESKİ YARIM",
  "YENİ TAM",
  "ESKİ TAM",
  "YENİ ATA",
  "ESKİ ATA",
  "YENİ GREMSE",
  "ESKİ GREMSE",
  "YENİ ATA5",
  "ESKİ ATA5"
];

const tickerOrder = [
  "HAS ALTIN",
  "ALTIN ONS",
  "GÜMÜŞ ONS",
  "GÜMÜŞ USD",
  "USDTRY",
  "EURTRY",
  "YENİ ÇEYREK",
  "YENİ YARIM",
  "YENİ TAM"
];

function parsePrice(value) {
  if (typeof value === "number") return value;

  return parseFloat(
    String(value)
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

function formatNumber(value) {
  const n = Number(value);

  if (!Number.isFinite(n)) return "";

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(n);
}

function createRow(item) {
  const buy = parsePrice(item.buy);
  const sell = parsePrice(item.sell);

  let percent = 0;
  let arrow = "▲";
  let trendClass = "up";

  if (oldPrices[item.name]) {
    const oldSell = oldPrices[item.name].sell;

    if (Number.isFinite(oldSell) && oldSell !== 0) {
      percent = ((sell - oldSell) / oldSell) * 100;
    }

    if (sell < oldSell) {
      arrow = "▼";
      trendClass = "down";
    }
  }

  oldPrices[item.name] = { buy, sell };
  tickerData[item.name] = sell;

  return `
    <tr>
      <td>
        <span class="price-name">${item.name}</span>
      </td>

      <td class="percent-cell ${trendClass}">
        <span>%${Math.abs(percent).toFixed(3)}</span>
        <span class="arrow">${arrow}</span>
      </td>

      <td>${formatNumber(buy)}</td>
      <td>${formatNumber(sell)}</td>
    </tr>
  `;
}

function updateTicker() {
  const tickerTrack = document.getElementById("tickerTrack");

  if (!tickerTrack) return;

  const items = [];

  tickerOrder.forEach(name => {

    const price = tickerData[name];

    if (!Number.isFinite(price)) return;

    items.push(`
      <div class="ticker-item">
        <div class="ticker-left">
          <strong>${name}</strong>
        </div>

        <span class="ticker-price">
          ${formatNumber(price)}
        </span>
      </div>
    `);
  });

  tickerTrack.innerHTML = items.join("") + items.join("");
}

function renderPrices() {

  const all = Object.values(latestItems);

  const maden = madenOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const doviz = dovizOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const sarrafiye = sarrafiyeOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const madenBody = document.getElementById("madenBody");
  const dovizBody = document.getElementById("dovizBody");
  const sarrafiyeBody = document.getElementById("sarrafiyeBody");

  if (madenBody) {
    madenBody.innerHTML = maden.map(createRow).join("");
  }

  if (dovizBody) {
    dovizBody.innerHTML = doviz.map(createRow).join("");
  }

  if (sarrafiyeBody) {
    sarrafiyeBody.innerHTML = sarrafiye.map(createRow).join("");
  }

  updateTicker();
}

function normalizeItem(item) {

  const symbol =
    item.symbol ||
    item.code ||
    item.key ||
    item.name;

  if (!symbol) return null;

  const buy =
    item.buy ??
    item.bid ??
    item.alis ??
    item.alış;

  const sell =
    item.sell ??
    item.ask ??
    item.satis ??
    item.satış;

  if (buy === undefined || sell === undefined) {
    return null;
  }

  const name = nameMap[symbol] || symbol;

  return {
    symbol,
    name,
    buy,
    sell
  };
}

function handleLiveData(data) {

  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.prices)
      ? data.prices
      : [];

  list.forEach(raw => {

    const item = normalizeItem(raw);

    if (!item) return;

    latestItems[item.symbol] = item;
  });

  renderPrices();
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.toggle("show");
  }
}

document.addEventListener("DOMContentLoaded", () => {

const socket = io("https://altinapi.com", {
      transports: ["websocket"],

    auth: {
      api_key: ALTINAPI_KEY
    }
  });

  socket.on("connect", () => {

    console.log("CONNECTED");

    socket.emit("subscribe", symbols);
  });

  socket.on("prices", data => {

    console.log("LIVE", data);

    handleLiveData(data);
  });

  socket.on("prices:snapshot", data => {

    console.log("SNAPSHOT", data);

    handleLiveData(data);
  });

  socket.on("prices:update", data => {

    console.log("UPDATE", data);

    handleLiveData(data);
  });

  socket.on("connect_error", err => {
    console.log("SOCKET ERROR", err.message);
  });

  socket.on("disconnect", () => {
    console.log("DISCONNECTED");
  });
});
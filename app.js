function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  const el = document.getElementById("clock");
  if (el) el.innerText = `${h}:${m}`;
}

function updateDate() {
  const today = new Date();
  const d = String(today.getDate()).padStart(2, "0");
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const y = today.getFullYear();
  const el = document.getElementById("date");
  if (el) el.innerText = `${d}/${m}/${y}`;
}

const ALTINAPI_KEY = "hapi_0213f88582a046e6836fdb7bafb43c3d";

let oldPrices = {};
let oldTickerPrices = {};
let tickerData = {};
let latestItems = {};

const symbols = [
  "ALTIN", "XAUUSD", "PARUSD", "PAREUR", "GUMUSD", "XAGUSD", "XAUXAG",

  "CEYREK_YENI", "CEYREK_ESKI",
  "YARIM_YENI", "YARIM_ESKI",
  "TEK_YENI", "TEK_ESKI",
  "ATA_YENI", "ATA_ESKI",
  "GREMESE_YENI", "GREMESE_ESKI",
  "ATA5_YENI", "ATA5_ESKI",

  "USDTRY", "EURTRY", "EURUSD", "GBPTRY", "CHFTRY",
  "AUDTRY", "CADTRY", "SARTRY", "JPYTRY"
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
  "USDTRY", "EURTRY", "EURUSD", "GBPTRY", "CHFTRY",
  "AUDTRY", "CADTRY", "SARTRY", "JPYTRY"
];

const sarrafiyeOrder = [
  "YENİ ÇEYREK", "ESKİ ÇEYREK",
  "YENİ YARIM", "ESKİ YARIM",
  "YENİ TAM", "ESKİ TAM",
  "YENİ ATA", "ESKİ ATA",
  "YENİ GREMSE", "ESKİ GREMSE",
  "YENİ ATA5", "ESKİ ATA5"
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
  return parseFloat(String(value).replace(/\./g, "").replace(",", "."));
}

function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(n);
}

function getTodayKey() {
  const d = new Date();

  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function getPercent(key, newValue) {

  const todayKey = getTodayKey();

  const savedDay =
    localStorage.getItem("priceDay");

  if (savedDay !== todayKey) {

    localStorage.setItem(
      "priceDay",
      todayKey
    );

    localStorage.removeItem(
      "basePrices"
    );
  }

  const basePrices = JSON.parse(
    localStorage.getItem("basePrices") || "{}"
  );

  if (!basePrices[key]) {

    basePrices[key] = newValue;

    localStorage.setItem(
      "basePrices",
      JSON.stringify(basePrices)
    );

    return 0;
  }

  const base = basePrices[key];

  if (
    !Number.isFinite(base) ||
    base === 0
  ) {
    return 0;
  }

  return (
    ((newValue - base) / base) * 100
  );
}

function createNameCell(name, percent) {

  if (percent === null) {
    return `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        width:100%;
      ">
        <span class="price-name">
          ${name}
        </span>
      </div>
    `;
  }

  const up = percent >= 0;

  return `
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      width:100%;
      gap:8px;
    ">

      <span class="price-name">
        ${name}
      </span>

      <span class="price-rate ${up ? "up" : "down"}">
        ${up ? "▲" : "▼"} %${Math.abs(percent).toFixed(2)}
      </span>

    </div>
  `;
}
function createRow(item) {
  const buy = parsePrice(item.buy);
  const sell = parsePrice(item.sell);
  const percent = getPercent(item.name, sell);

  let buyClass = "";
  let sellClass = "";

  if (oldPrices[item.name]) {
    if (buy > oldPrices[item.name].buy) buyClass = "up";
    else if (buy < oldPrices[item.name].buy) buyClass = "down";

    if (sell > oldPrices[item.name].sell) sellClass = "up";
    else if (sell < oldPrices[item.name].sell) sellClass = "down";
  }

  oldPrices[item.name] = { buy, sell };
  tickerData[item.name] = sell;

  return `
    <tr>
      <td>${createNameCell(item.name, percent)}</td>
      <td class="${buyClass}">${formatNumber(buy)}</td>
      <td class="${sellClass}">${formatNumber(sell)}</td>
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

    const old = oldTickerPrices[name];
    let percent = 0;

    if (Number.isFinite(old) && old !== 0) {
      percent = ((price - old) / old) * 100;
    }

    const up = percent >= 0;

    items.push(`
      <div class="ticker-item">
        <div class="ticker-left">
          <strong>${name}</strong>
          <span class="${up ? "ticker-up" : "ticker-down"}">
            ${up ? "▲" : "▼"} %${Math.abs(percent).toFixed(2)}
          </span>
        </div>
        <span class="ticker-price">${formatNumber(price)}</span>
      </div>
    `);

    oldTickerPrices[name] = price;
  });

  tickerTrack.innerHTML = items.join("") + items.join("");
}

function renderPrices() {
  const madenBody = document.getElementById("madenBody");
  const dovizBody = document.getElementById("dovizBody");
  const sarrafiyeBody = document.getElementById("sarrafiyeBody");

  const all = Object.values(latestItems);

  const maden = madenOrder.map(name => all.find(i => i.name === name)).filter(Boolean);
  const doviz = dovizOrder.map(name => all.find(i => i.name === name)).filter(Boolean);
  const sarrafiye = sarrafiyeOrder.map(name => all.find(i => i.name === name)).filter(Boolean);

  if (madenBody) madenBody.innerHTML = maden.map(createRow).join("");
  if (dovizBody) dovizBody.innerHTML = doviz.map(createRow).join("");
  if (sarrafiyeBody) sarrafiyeBody.innerHTML = sarrafiye.map(createRow).join("");

  updateTicker();
}

function normalizeItem(item) {
  const symbol = item.symbol || item.code || item.key || item.name;
  if (!symbol) return null;

  const buy = item.bid ?? item.buy ?? item.alis ?? item.alış;
  const sell = item.ask ?? item.sell ?? item.satis ?? item.satış;

  if (buy === undefined || sell === undefined) return null;

  const name = nameMap[symbol] || symbol;

  let type = null;

  if (madenOrder.includes(name)) type = "maden";
  else if (dovizOrder.includes(name)) type = "doviz";
  else if (sarrafiyeOrder.includes(name)) type = "sarrafiye";
  else return null;

  return { symbol, name, buy, sell, type };
}

function handleLiveData(data) {
  const list = Array.isArray(data) ? data : data?.data || data?.prices || [];

  list.forEach(raw => {
    const item = normalizeItem(raw);
    if (!item) return;
    latestItems[item.symbol] = item;
  });

  renderPrices();
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("show");
}

function openFullScreen() {
  const elem = document.documentElement;
  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

document.addEventListener("DOMContentLoaded", () => {
  updateClock();
  updateDate();

  setInterval(updateClock, 1000);
  setInterval(updateDate, 60000);

  const socket = io("https://altinapi.com", {
    transports: ["websocket"],
    auth: {
      api_key: ALTINAPI_KEY
    }
  });

  socket.on("connect", () => {
    console.log("ALTINAPI CONNECTED");
    socket.emit("subscribe", symbols);
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
    console.log("SOCKET DISCONNECTED");
  });

  setTimeout(() => {
    const loader = document.getElementById("loader");
    if (loader) loader.style.display = "none";
  }, 900);
});
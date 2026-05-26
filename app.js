const ALTINAPI_KEY = "hapi_0213f88582a046e6836fdb7bafb43c3d";

let oldPrices = {};
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

function formatCustomNumber(value, digits = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }).format(n);
}

function formatItemNumber(value, item) {
  if (item.zeroDigits) return formatCustomNumber(value, 0);
  if (item.twoDigits) return formatCustomNumber(value, 2);
  return formatNumber(value);
}

function getTrend(itemName, sell) {
  let percent = 0;
  let arrow = "▲";
  let trendClass = "up";
  let flashClass = "";

  const oldSell = oldPrices[itemName]?.sell;

  if (Number.isFinite(oldSell) && oldSell !== 0) {
    percent = ((sell - oldSell) / oldSell) * 100;

    if (sell > oldSell) {
      flashClass = "flash-up";
    } else if (sell < oldSell) {
      arrow = "▼";
      trendClass = "down";
      flashClass = "flash-down";
    }
  }

  return { percent, arrow, trendClass, flashClass };
}

function createRow(item) {
  const buy = parsePrice(item.buy);
  const sell = parsePrice(item.sell);
  const trend = getTrend(item.name, sell);

  oldPrices[item.name] = { buy, sell };
  tickerData[item.name] = sell;

  return `
    <tr>
      <td>
        <span class="price-name">${item.name}</span>
      </td>

      <td class="percent-cell ${trend.trendClass}">
        <span>%${Math.abs(trend.percent).toFixed(3)}</span>
        <span class="arrow">${trend.arrow}</span>
      </td>

      <td class="price-update ${trend.flashClass}">
        ${formatItemNumber(buy, item)}
      </td>

      <td class="price-update ${trend.flashClass}">
        ${formatItemNumber(sell, item)}
      </td>
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

  if (items.length === 0) return;

  tickerTrack.innerHTML = items.join("") + items.join("");
}

function renderPrices() {
  const all = Object.values(latestItems);

  const maden = madenOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const twoDigitItems = [
    "USD/KG",
    "EUR/KG",
    "GÜMÜŞ ONS",
    "ALTIN GÜMÜŞ"
  ];

  maden.forEach(item => {
    if (twoDigitItems.includes(item.name)) {
      item.twoDigits = true;
    }
  });

  const doviz = dovizOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const sarrafiye = sarrafiyeOrder
    .map(name => all.find(i => i.name === name))
    .filter(Boolean);

  const madenBody = document.getElementById("madenBody");
  const dovizBody = document.getElementById("dovizBody");
  const sarrafiyeBody = document.getElementById("sarrafiyeBody");

  if (madenBody) madenBody.innerHTML = maden.map(createRow).join("");
  if (dovizBody) dovizBody.innerHTML = doviz.map(createRow).join("");
  if (sarrafiyeBody) sarrafiyeBody.innerHTML = sarrafiye.map(createRow).join("");

  updateTicker();
  renderArabicPrices();
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

  if (buy === undefined || sell === undefined) return null;

  const name = nameMap[symbol] || symbol;

  return { symbol, name, buy, sell };
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

  localStorage.setItem("hac_last_prices", JSON.stringify(latestItems));
  renderPrices();
}

function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  if (menu) menu.classList.toggle("show");
}

function getItem(name) {
  return Object.values(latestItems).find(i => i.name === name);
}

function makeItem(name, buy, sell, options = {}) {
  return { name, buy, sell, ...options };
}

function createArabicRow(item) {
  const buy = parsePrice(item.buy);
  const sell = parsePrice(item.sell);
  const trend = getTrend(item.name, sell);

  oldPrices[item.name] = { buy, sell };

  const percentText =
    item.name === "EURUSD"
      ? Math.abs(trend.percent).toFixed(4)
      : Math.abs(trend.percent).toFixed(3);

  return `
    <tr class="${trend.flashClass}">
      <td>
        <span class="price-name arabic-name">
          ${item.name}
        </span>
      </td>

      <td class="percent-cell ${trend.trendClass}">
        <span>%${percentText}</span>
        <span class="arrow">${trend.arrow}</span>
      </td>

      <td>${formatItemNumber(buy, item)}</td>
      <td>${formatItemNumber(sell, item)}</td>
    </tr>
  `;
}

function renderArabicPrices() {
  const goldBody = document.getElementById("arabicGoldBody");
  const metalBody = document.getElementById("arabicMetalBody");
  const exchangeBody = document.getElementById("arabicExchangeBody");

  if (!goldBody || !metalBody || !exchangeBody) return;

  const has = getItem("HAS ALTIN");
  const usd = getItem("USDTRY");
  const eur = getItem("EURTRY");

  const ons = getItem("ALTIN ONS");
  const silverOns = getItem("GÜMÜŞ ONS");
  const silverUsd = getItem("GÜMÜŞ USD");

  const tam = getItem("YENİ TAM");
  const yarim = getItem("YENİ YARIM");
  const ceyrek = getItem("YENİ ÇEYREK");

  if (!has || !usd || !eur) return;

  const usdRate = parsePrice(usd.sell);
  const eurRate = parsePrice(eur.sell);

  const hasBuy = parsePrice(has.buy);
  const hasSell = parsePrice(has.sell);

  const ayar21Buy = (hasSell * 0.875) - 75;
  const ayar21Sell = hasSell * 0.875;

  const ayar22Buy = hasBuy * 0.916;
  const ayar22Sell = hasSell * 0.916;

  const ayar18Buy = hasBuy * 0.750;
  const ayar18Sell = hasSell * 0.750;

  const ayar14Buy = hasBuy * 0.585;
  const ayar14Sell = hasSell * 0.585;

  const tamSell = tam ? parsePrice(tam.sell) : null;
  const tamBuy = tam ? tamSell - 1000 : null;

  const yarimSell = yarim ? parsePrice(yarim.sell) : null;
  const yarimBuy = yarim ? yarimSell - 600 : null;

  const ceyrekSell = ceyrek ? parsePrice(ceyrek.sell) : null;
  const ceyrekBuy = ceyrek ? ceyrekSell - 300 : null;

  const goldItems = [
    makeItem("ذهب عيار 21<br>بالليرة التركية", ayar21Buy, ayar21Sell, { zeroDigits:true }),
    makeItem("ذهب عيار 21 <br>بالدولار", ayar21Buy / usdRate, ayar21Sell / usdRate, { twoDigits:true }),
    makeItem("ذهب عيار 21 <br>باليورو", ayar21Buy / eurRate, ayar21Sell / eurRate, { twoDigits:true }),

    tam ? makeItem("الليرة تام <br>بالليرة التركية", tamBuy, tamSell, { zeroDigits:true }) : null,
    tam ? makeItem("الليرة تام <br>بالدولار", tamBuy / usdRate, tamSell / usdRate, { zeroDigits:true }) : null,

    yarim ? makeItem("نص ليرة <br>بالليرة التركية", yarimBuy, yarimSell, { zeroDigits:true }) : null,
    yarim ? makeItem("نص ليرة <br>بالدولار", yarimBuy / usdRate, yarimSell / usdRate, { zeroDigits:true }) : null,

    ceyrek ? makeItem("ربع ليرة <br>بالليرة التركية", ceyrekBuy, ceyrekSell, { zeroDigits:true }) : null,
    ceyrek ? makeItem("ربع ليرة <br>بالدولار", ceyrekBuy / usdRate, ceyrekSell / usdRate, { zeroDigits:true }) : null,

    makeItem("ذهب عيار 22 <br>بالليرة التركية", ayar22Buy, ayar22Sell, { zeroDigits:true }),
    makeItem("ذهب عيار 18 <br>بالليرة التركية", ayar18Buy, ayar18Sell, { zeroDigits:true }),
    makeItem("ذهب عيار 14 <br>بالليرة التركية", ayar14Buy, ayar14Sell, { zeroDigits:true })
  ].filter(Boolean);

  const metalItems = [
    ons ? makeItem("سعر الاونصة <br>بالدولار", parsePrice(ons.buy), parsePrice(ons.sell)) : null,

    makeItem("ذهب عيار 24 <br>بالليرة التركية", hasBuy, hasSell),

    getItem("USD/KG") ? makeItem(
      "ذهب عيار 24 <br>بالدولار",
      parsePrice(getItem("USD/KG").buy),
      parsePrice(getItem("USD/KG").sell),
      { twoDigits:true }
    ) : null,

    getItem("EUR/KG") ? makeItem(
      "ذهب عيار 24 <br>باليورو",
      parsePrice(getItem("EUR/KG").buy),
      parsePrice(getItem("EUR/KG").sell),
      { twoDigits:true }
    ) : null,

    silverOns ? makeItem(
      "سعر اونصة الفضة <br>بالدولار",
      parsePrice(silverOns.buy),
      parsePrice(silverOns.sell),
      { twoDigits:true }
    ) : null,

    silverUsd ? makeItem(
      "الفضة <br>بالدولار",
      parsePrice(silverUsd.buy),
      parsePrice(silverUsd.sell)
    ) : null,

    makeItem("اونصة 1 غرام", hasBuy / usdRate, (hasSell / usdRate) * 1.02, { zeroDigits:true }),
    makeItem("اونصة 5 غرام", (hasBuy * 5) / usdRate, ((hasSell * 5) / usdRate) * 1.015, { zeroDigits:true }),
    makeItem("اونصة 20 غرام", (hasBuy * 20) / usdRate, ((hasSell * 20) / usdRate) * 1.01005, { zeroDigits:true }),
    makeItem("اونصة 50 غرام", (hasBuy * 50) / usdRate, ((hasSell * 50) / usdRate) * 1.007, { zeroDigits:true }),
    makeItem("اونصة 100 غرام", (hasBuy * 100) / usdRate, ((hasSell * 100) / usdRate) * 1.005, { zeroDigits:true })
  ].filter(Boolean);

  const gbp = getItem("GBPTRY");
  const chf = getItem("CHFTRY");
  const sar = getItem("SARTRY");
  const aed = getItem("AEDTRY");
  const eurusd = getItem("EURUSD");

  const exchangeItems = [
    makeItem("الليرة التركية <br>مقابل الدولار", parsePrice(usd.buy), parsePrice(usd.sell)),
    makeItem("الليرة التركية <br>مقابل اليورو", parsePrice(eur.buy), parsePrice(eur.sell)),

    eurusd ? makeItem("اليورو <br>مقابل الدولار", parsePrice(eurusd.buy), parsePrice(eurusd.sell)) : null,
    gbp ? makeItem("الاسترليني <br>مقابل الليرة التركية", parsePrice(gbp.buy), parsePrice(gbp.sell)) : null,
    chf ? makeItem("الفرنك السويسري <br>مقابل الليرة التركية", parsePrice(chf.buy), parsePrice(chf.sell)) : null,
    sar ? makeItem("الريال السعودي <br>مقابل الليرة التركية", parsePrice(sar.buy), parsePrice(sar.sell)) : null,
    aed ? makeItem("الدرهم الاماراتي <br>مقابل الليرة التركية", parsePrice(aed.buy), parsePrice(aed.sell)) : null
  ].filter(Boolean);

  goldBody.innerHTML = goldItems.map(createArabicRow).join("");
  metalBody.innerHTML = metalItems.map(createArabicRow).join("");
  exchangeBody.innerHTML = exchangeItems.map(createArabicRow).join("");
}

function openFullScreen() {
  const elem = document.documentElement;

  if (elem.requestFullscreen) elem.requestFullscreen();
  else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
  else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedPrices = localStorage.getItem("hac_last_prices");

  if (savedPrices) {
    latestItems = JSON.parse(savedPrices);
    renderPrices();
  }

  const socket = io("https://altinapi.com", {
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 1500,
    timeout: 10000,

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

  socket.on("disconnect", () => {
    console.log("DISCONNECTED");
  });

  socket.io.on("reconnect", () => {
    console.log("RECONNECTED");
    socket.emit("subscribe", symbols);
  });
});
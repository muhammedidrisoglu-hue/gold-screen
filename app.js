function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const clockElement = document.getElementById("clock");

  if (clockElement) {
    clockElement.innerText = `${hours}:${minutes}`;
  }
}

function updateDate() {
  const today = new Date();

  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = today.getFullYear();

  const dateElement = document.getElementById("date");

  if (dateElement) {
    dateElement.innerText = `${day}/${month}/${year}`;
  }
}

let oldPrices = {};
let oldTickerPrices = {};
let tickerData = {};

const API_KEY =
  "a1692331famsh5bbb25822034d5bp180102jsn1334712f8d03";

const madenOrder = [
  "HAS ALTIN",
  "HAS ALTIN ÇEKİLİ",
  "ALTIN ONS",
  "USD KG",
  "ALTIN USDKG",
  "EUR KG",
  "ALTIN EURKG",
  "GÜMÜŞ ONS",
  "GÜMÜŞ TL",
  "GÜMÜŞ USD",
  "GÜMÜŞ EUR",
  "ALTIN GÜMÜŞ",
  "PLATIN ONS",
  "PALADYUM ONS",
  "14 AYAR",
  "22 AYAR"
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
  "ESKİ ATA5",
  "GRAM ALTIN"
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

const tickerOrder = [
  "ONS",
  "USD KG",
  "EUR KG",
  "GÜMÜŞ ONS",
  "HAS ALTIN",
  "USDTRY",
  "EURTRY"
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

    return (
      item === order ||
      item.includes(order) ||
      order.includes(item)
    );
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
  if (typeof value === "number") return value;

  return parseFloat(
    String(value)
      .replace(/\./g, "")
      .replace(",", ".")
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "";
  }

  return new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  }).format(number);
}

function getPercent(key, newValue) {
  const old = oldPrices[key]?.sell;

  if (!Number.isFinite(old) || old === 0) {
    return 0;
  }

  return ((newValue - old) / old) * 100;
}

function createNameCell(name, percent) {
  const isUp = percent >= 0;

  const cls = isUp ? "up" : "down";

  const arrow = isUp ? "▲" : "▼";

  return `
    <div class="name-wrap">
      <span class="price-name">${name}</span>
      <span class="price-rate ${cls}">
        ${arrow} %${Math.abs(percent).toFixed(2)}
      </span>
    </div>
  `;
}

function createGoldRow(item) {
  const buy = item.buy;
  const sell = item.sell;

  const buyNumber = parsePrice(buy);
  const sellNumber = parsePrice(sell);

  const percent = getPercent(item.key, sellNumber);

  let buyClass = "";
  let sellClass = "";

  if (oldPrices[item.key]) {

    if (buyNumber > oldPrices[item.key].buy) {
      buyClass = "up";
    }

    else if (buyNumber < oldPrices[item.key].buy) {
      buyClass = "down";
    }

    if (sellNumber > oldPrices[item.key].sell) {
      sellClass = "up";
    }

    else if (sellNumber < oldPrices[item.key].sell) {
      sellClass = "down";
    }
  }

  oldPrices[item.key] = {
    buy: buyNumber,
    sell: sellNumber
  };

  tickerData[item.key] = sellNumber;

  return `
    <tr>
      <td>
        ${createNameCell(item.key, percent)}
      </td>

      <td class="${buyClass}">
        ${formatNumber(buyNumber)}
      </td>

      <td class="${sellClass}">
        ${formatNumber(sellNumber)}
      </td>
    </tr>
  `;
}

function updateTicker() {

  const tickerTrack =
    document.getElementById("tickerTrack");

  if (!tickerTrack) return;

  const items = [];

  tickerOrder.forEach(name => {

    const cleanTarget = cleanName(name);

    const realKey = Object.keys(tickerData).find(key => {

      const cleanKey = cleanName(key);

      return (
        cleanKey === cleanTarget ||
        cleanKey.includes(cleanTarget) ||
        cleanTarget.includes(cleanKey)
      );
    });

    if (!realKey) return;

    const price = tickerData[realKey];

    if (!Number.isFinite(price)) return;

    const old = oldTickerPrices[realKey];

    let percent = 0;

    if (Number.isFinite(old) && old !== 0) {
      percent = ((price - old) / old) * 100;
    }

    const isUp = percent >= 0;

    const arrow = isUp ? "▲" : "▼";

    const cls =
      isUp ? "ticker-up" : "ticker-down";

    items.push(`
      <div class="ticker-item">
        <strong>${name}</strong>

        <span class="ticker-price">
          ${formatNumber(price)}
        </span>

        <span class="${cls}">
          ${arrow} %${Math.abs(percent).toFixed(2)}
        </span>
      </div>
    `);

    oldTickerPrices[realKey] = price;
  });

  tickerTrack.innerHTML =
    items.join("") + items.join("");
}

async function loadGold() {

  try {

    const response = await fetch(
      `https://harem-altin-live-gold-price-data.p.rapidapi.com/harem_altin/prices/23b4c2fb31a242d1eebc0df9b9b65e5e?t=${Date.now()}`,
      {
        method: "GET",

        headers: {
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host":
            "harem-altin-live-gold-price-data.p.rapidapi.com"
        }
      }
    );

    const result = await response.json();

    const madenBody =
      document.getElementById("madenBody");

    const sarrafiyeBody =
      document.getElementById("sarrafiyeBody");

    if (
      !madenBody ||
      !sarrafiyeBody ||
      !Array.isArray(result.data)
    ) {
      return;
    }

    const madenItems = [];
    const sarrafiyeItems = [];

    result.data.forEach(item => {

      if (
        getCategory(item.key) === "sarrafiye"
      ) {
        sarrafiyeItems.push(item);
      }

      else {
        madenItems.push(item);
      }
    });

    madenItems.sort((a, b) =>
      getOrderIndex(a.key, madenOrder) -
      getOrderIndex(b.key, madenOrder)
    );

    sarrafiyeItems.sort((a, b) =>
      getOrderIndex(a.key, sarrafiyeOrder) -
      getOrderIndex(b.key, sarrafiyeOrder)
    );

    madenBody.innerHTML =
      madenItems.map(createGoldRow).join("");

    sarrafiyeBody.innerHTML =
      sarrafiyeItems.map(createGoldRow).join("");

    updateTicker();

  }

  catch (err) {
    console.log("Gold Error:", err);
  }
}

async function loadDoviz() {

  try {

    const response = await fetch(
      `https://altinapi-turkish-live-gold-prices1.p.rapidapi.com/prices/category/DOVIZ?t=${Date.now()}`,
      {
        method: "GET",

        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": API_KEY,
          "x-rapidapi-host":
            "altinapi-turkish-live-gold-prices1.p.rapidapi.com"
        }
      }
    );

    const result = await response.json();

    const dovizBody =
      document.getElementById("dovizBody");

    if (
      !dovizBody ||
      !Array.isArray(result.data)
    ) {
      return;
    }

    const rows = result.data
      .map(item => {

        const code = cleanName(
          item.symbol || item.kod || ""
        );

        const buy = Number(
          item.bid ?? item.alis
        );

        const sell = Number(
          item.ask ?? item.satis
        );

        return {
          code,
          buy,
          sell
        };
      })

      .filter(item =>
        dovizOrder.includes(item.code)
      )

      .sort((a, b) =>
        dovizOrder.indexOf(a.code) -
        dovizOrder.indexOf(b.code)
      );

    rows.forEach(item => {
      tickerData[item.code] = item.sell;
    });

    dovizBody.innerHTML = rows.map(item => {

      const percent =
        getPercent(item.code, item.sell);

      oldPrices[item.code] = {
        buy: item.buy,
        sell: item.sell
      };

      return `
        <tr>
          <td>
            ${createNameCell(item.code, percent)}
          </td>

          <td>
            ${formatNumber(item.buy)}
          </td>

          <td>
            ${formatNumber(item.sell)}
          </td>
        </tr>
      `;
    }).join("");

    updateTicker();

  }

  catch (err) {
    console.log("Döviz Error:", err);
  }
}

function toggleMenu() {

  const menu =
    document.getElementById("mobileMenu");

  if (menu) {
    menu.classList.toggle("show");
  }
}

function openFullScreen() {

  const elem = document.documentElement;

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  }

  else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  }

  else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
}

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    updateClock();
    updateDate();

    await loadGold();
    await loadDoviz();

    setInterval(updateClock, 1000);
    setInterval(updateDate, 60000);

    // تحديث الأسعار كل ثانية
    setInterval(loadGold, 1000);
    setInterval(loadDoviz, 1000);

    setTimeout(() => {

      const loader =
        document.getElementById("loader");

      if (loader) {
        loader.style.display = "none";
      }

    }, 1200);
  }
);

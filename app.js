const ALTINAPI_KEY = "hapi_0213f88582a046e6836fdb7bafb43c3d";

let oldPrices = {};
let oldTickerPrices = {};
let tickerData = {};
let latestItems = {};

const symbols = [
<<<<<<< HEAD
  "ALTIN","XAUUSD","PARUSD","PAREUR","USDKG","EURKG","GUMUSD","XAGUSD","XAUXAG",
  "CEYREK_YENI","CEYREK_ESKI","YARIM_YENI","YARIM_ESKI",
  "TEK_YENI","TEK_ESKI","ATA_YENI","ATA_ESKI",
  "GREMESE_YENI","GREMESE_ESKI","ATA5_YENI","ATA5_ESKI",
  "USDTRY","EURTRY","EURUSD","GBPTRY","CHFTRY","AUDTRY","CADTRY","SARTRY","JPYTRY"
];

const nameMap = {
  ALTIN:"HAS ALTIN", XAUUSD:"ALTIN ONS",
  PARUSD:"USD/KG", USDKG:"USD/KG",
  PAREUR:"EUR/KG", EURKG:"EUR/KG",
  GUMUSD:"GÜMÜŞ USD", XAGUSD:"GÜMÜŞ ONS", XAUXAG:"ALTIN GÜMÜŞ",
  CEYREK_YENI:"YENİ ÇEYREK", CEYREK_ESKI:"ESKİ ÇEYREK",
  YARIM_YENI:"YENİ YARIM", YARIM_ESKI:"ESKİ YARIM",
  TEK_YENI:"YENİ TAM", TEK_ESKI:"ESKİ TAM",
  ATA_YENI:"YENİ ATA", ATA_ESKI:"ESKİ ATA",
  GREMESE_YENI:"YENİ GREMSE", GREMESE_ESKI:"ESKİ GREMSE",
  ATA5_YENI:"YENİ ATA5", ATA5_ESKI:"ESKİ ATA5"
};

const madenOrder = ["HAS ALTIN","ALTIN ONS","USD/KG","EUR/KG","GÜMÜŞ USD","GÜMÜŞ ONS","ALTIN GÜMÜŞ"];
const dovizOrder = ["USDTRY","EURTRY","EURUSD","GBPTRY","CHFTRY","AUDTRY","CADTRY","SARTRY","JPYTRY"];
const sarrafiyeOrder = ["YENİ ÇEYREK","ESKİ ÇEYREK","YENİ YARIM","ESKİ YARIM","YENİ TAM","ESKİ TAM","YENİ ATA","ESKİ ATA","YENİ GREMSE","ESKİ GREMSE","YENİ ATA5","ESKİ ATA5"];
const tickerOrder = ["HAS ALTIN","ALTIN ONS","GÜMÜŞ ONS","GÜMÜŞ USD","USDTRY","EURTRY","YENİ ÇEYREK","YENİ YARIM","YENİ TAM"];

function updateClock(){const n=new Date(),h=String(n.getHours()).padStart(2,"0"),m=String(n.getMinutes()).padStart(2,"0"),e=document.getElementById("clock");if(e)e.innerText=`${h}:${m}`}
function updateDate(){const t=new Date(),d=String(t.getDate()).padStart(2,"0"),m=String(t.getMonth()+1).padStart(2,"0"),y=t.getFullYear(),e=document.getElementById("date");if(e)e.innerText=`${d}/${m}/${y}`}

function parsePrice(v){
  if(typeof v==="number") return v;
  return parseFloat(String(v).replace(/\./g,"").replace(",","."));
}

function formatNumber(v){
  const n=Number(v);
  if(!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("tr-TR",{minimumFractionDigits:0,maximumFractionDigits:3}).format(n);
}

function getPercent(key,newValue){
  const old=oldPrices[key]?.sell;
  if(!Number.isFinite(old)||old===0) return 0;
  return ((newValue-old)/old)*100;
}

function createNameCell(name,percent){
  const up=percent>=0;
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;gap:8px;">
      <span class="price-name">${name}</span>
      <span class="price-rate ${up ? "up" : "down"}">${up ? "▲" : "▼"} %${Math.abs(percent).toFixed(2)}</span>
    </div>
  `;
}

function createRow(item){
  const buy=parsePrice(item.buy), sell=parsePrice(item.sell), percent=getPercent(item.name,sell);
  let buyClass="", sellClass="";

  if(oldPrices[item.name]){
    if(buy>oldPrices[item.name].buy) buyClass="up";
    else if(buy<oldPrices[item.name].buy) buyClass="down";
    if(sell>oldPrices[item.name].sell) sellClass="up";
    else if(sell<oldPrices[item.name].sell) sellClass="down";
  }

  oldPrices[item.name]={buy,sell};
  tickerData[item.name]=sell;

  return `<tr><td>${createNameCell(item.name,percent)}</td><td class="${buyClass}">${formatNumber(buy)}</td><td class="${sellClass}">${formatNumber(sell)}</td></tr>`;
}

function normalizeItem(item){
  const symbol = item.symbol || item.code || item.key || item.name;
  if(!symbol) return null;

  const buy = item.bid ?? item.buy ?? item.alis ?? item.alış;
  const sell = item.ask ?? item.sell ?? item.satis ?? item.satış;
  if(buy == null || sell == null) return null;

  const name = nameMap[symbol] || symbol;
  if(!madenOrder.includes(name) && !dovizOrder.includes(name) && !sarrafiyeOrder.includes(name)) return null;

  return {symbol, name, buy, sell};
}

function handleLiveData(data){
  let list=[];
  if(Array.isArray(data)) list=data;
  else if(Array.isArray(data?.data)) list=data.data;
  else if(Array.isArray(data?.prices)) list=data.prices;
  else if(data?.data && typeof data.data==="object") list=Object.values(data.data);
  else if(data?.prices && typeof data.prices==="object") list=Object.values(data.prices);

  list.forEach(raw=>{
    const item=normalizeItem(raw);
    if(item) latestItems[item.name]=item;
  });

  renderPrices();
}

function renderPrices(){
  const all=Object.values(latestItems);
  const maden=madenOrder.map(n=>all.find(i=>i.name===n)).filter(Boolean);
  const doviz=dovizOrder.map(n=>all.find(i=>i.name===n)).filter(Boolean);
  const sarrafiye=sarrafiyeOrder.map(n=>all.find(i=>i.name===n)).filter(Boolean);

  const madenBody=document.getElementById("madenBody");
  const dovizBody=document.getElementById("dovizBody");
  const sarrafiyeBody=document.getElementById("sarrafiyeBody");

  if(madenBody) madenBody.innerHTML=maden.map(createRow).join("");
  if(dovizBody) dovizBody.innerHTML=doviz.map(createRow).join("");
  if(sarrafiyeBody) sarrafiyeBody.innerHTML=sarrafiye.map(createRow).join("");

  updateTicker();
}

function updateTicker(){
  const tickerTrack=document.getElementById("tickerTrack");
  if(!tickerTrack) return;

  const items=[];
  tickerOrder.forEach(name=>{
    const price=tickerData[name];
    if(!Number.isFinite(price)) return;

    const old=oldTickerPrices[name];
    let percent=0;
    if(Number.isFinite(old)&&old!==0) percent=((price-old)/old)*100;

    const up=percent>=0;
=======
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

  tickerData[item.name] = sell;

  return `
    <tr>
      <td>
        <span class="price-name">${item.name}</span>
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

>>>>>>> 8cc9672 (fix socket connection)
    items.push(`
      <div class="ticker-item">
        <div class="ticker-left">
          <strong>${name}</strong>
<<<<<<< HEAD
          <span class="${up ? "ticker-up" : "ticker-down"}">${up ? "▲" : "▼"} %${Math.abs(percent).toFixed(2)}</span>
        </div>
        <span class="ticker-price">${formatNumber(price)}</span>
      </div>
    `);

    oldTickerPrices[name]=price;
  });

  tickerTrack.innerHTML=items.join("")+items.join("");
}

function toggleMenu(){const menu=document.getElementById("mobileMenu");if(menu)menu.classList.toggle("show")}
function openFullScreen(){const elem=document.documentElement;if(elem.requestFullscreen)elem.requestFullscreen();else if(elem.webkitRequestFullscreen)elem.webkitRequestFullscreen();else if(elem.msRequestFullscreen)elem.msRequestFullscreen()}

document.addEventListener("DOMContentLoaded",()=>{
  updateClock();
  updateDate();
  setInterval(updateClock,1000);
  setInterval(updateDate,60000);

  const socket=io("https://altinapi.com",{
    transports:["websocket"],
    auth:{api_key:ALTINAPI_KEY}
  });

  socket.on("connect",()=>{
    console.log("ALTINAPI CONNECTED");
    socket.emit("subscribe",symbols);
  });

  socket.on("prices:snapshot",handleLiveData);
  socket.on("prices:update",handleLiveData);
  socket.on("connect_error",err=>console.log("SOCKET ERROR",err.message));
  socket.on("disconnect",()=>console.log("SOCKET DISCONNECTED"));

  setTimeout(()=>{
    const loader=document.getElementById("loader");
    if(loader) loader.style.display="none";
  },900);
});
=======
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
>>>>>>> 8cc9672 (fix socket connection)

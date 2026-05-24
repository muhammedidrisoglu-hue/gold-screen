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

updateClock();
setInterval(updateClock, 1000);

updateDate();
setInterval(updateDate, 60000);


let oldPrices = {};

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
const dovizBody = document.getElementById("dovizBody");

madenBody.innerHTML = "";
sarrafiyeBody.innerHTML = "";
dovizBody.innerHTML = "";

  result.data.sort((a, b) => a.key.localeCompare(b.key));

result.data.forEach((item) => {

      const buy = item.buy;
      const sell = item.sell;

      const buyNumber = parseFloat(
        buy.replace(".", "").replace(",", ".")
      );

      const sellNumber = parseFloat(
        sell.replace(".", "").replace(",", ".")
      );

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

    let targetBody = madenBody;

if (
  item.key.includes("CEYREK") ||
  item.key.includes("YARIM") ||
  item.key.includes("TAM") ||
  item.key.includes("ATA") ||
  item.key.includes("GREMSE")
) {
  targetBody = sarrafiyeBody;
}

if (
  item.key.includes("USD") ||
  item.key.includes("EUR") ||
  item.key.includes("GBP") ||
  item.key.includes("CHF")
) {
  targetBody = dovizBody;
}
targetBody.innerHTML += `
  <tr>
  <td>${item.key}</td>
  <td class="${buyClass}">${buy}</td>
  <td class="${sellClass}">${sell}</td>
</tr>
      `;

      oldPrices[item.key] = {
        buy: buyNumber,
        sell: sellNumber
      };

    });

  }

  catch (err) {
    console.log(err);
  }

}

loadGold();

setInterval(loadGold, 5000);

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

updateDate();
setInterval(updateDate, 60000);
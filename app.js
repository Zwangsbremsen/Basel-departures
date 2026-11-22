async function loadDepartures(station) {
  const status = document.getElementById("status");
  const board = document.getElementById("board");
  status.textContent = "Loading...";

  try {
    const url = "https://transport.opendata.ch/v1/stationboard?station=" + encodeURIComponent(station) + "&limit=10";
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("HTTP " + response.status);
    }
    const data = await response.json();

    board.replaceChildren();

    if (data.stationboard.length === 0) {
      status.textContent = "No departures found for " + station + ".";
      return;
    }

    data.stationboard.forEach(function (d) {
      const time = new Date(d.stop.departure).toLocaleTimeString("de-CH", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const values = [time, d.category + d.number, d.to, d.stop.platform || "-"];
      const row = document.createElement("tr");

      values.forEach(function (value) {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.appendChild(cell);
      });

      board.appendChild(row);
    });

    status.textContent = "";
  } catch (error) {
    status.textContent = "Could not load departures. Please try again.";
    console.error(error);
  }
}

const form = document.getElementById("search-form");
const input = document.getElementById("station-input");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  loadDepartures(input.value);
});

loadDepartures(input.value);
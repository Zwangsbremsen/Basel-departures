async function loadDepartures(station) {
  const url = "https://transport.opendata.ch/v1/stationboard?station=" + encodeURIComponent(station) + "&limit=10";
  const response = await fetch(url);
  const data = await response.json();

  const board = document.getElementById("board");
  board.replaceChildren();

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
}

const form = document.getElementById("search-form");
const input = document.getElementById("station-input");

form.addEventListener("submit", function (event) {
  event.preventDefault();
  loadDepartures(input.value);
});

loadDepartures(input.value);
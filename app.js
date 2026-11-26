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

async function sendJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  return { ok: response.ok, data: data };
}

const authForm = document.getElementById("auth-form");
const authStatus = document.getElementById("auth-status");

function credentials() {
  return {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };
}

authForm.addEventListener("submit", async function (event) {
  event.preventDefault();
  const result = await sendJson("backend/login.php", credentials());
  authStatus.textContent = result.ok ? "Logged in" : result.data.error;
});

document.getElementById("register-btn").addEventListener("click", async function () {
  const result = await sendJson("backend/register.php", credentials());
  authStatus.textContent = result.ok ? "Account created, you can log in now" : result.data.error;
});
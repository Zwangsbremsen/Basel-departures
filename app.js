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
  
  if (result.ok) {
  loadFavorites();
  }
});

document.getElementById("register-btn").addEventListener("click", async function () {
  const result = await sendJson("backend/register.php", credentials());
  authStatus.textContent = result.ok ? "Account created, you can log in now" : result.data.error;
});

async function apiRequest(url, method, body) {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const data = await response.json();
  return { ok: response.ok, data: data };
}

const favList = document.getElementById("Favorites");
const favBtn = document.getElementById("fav-btn");

async function loadFavorites() {
  const result = await apiRequest("backend/favorites.php", "GET");
  favList.replaceChildren();
  if (!result.ok) {
    favBtn.hidden = true;
    return;
    }
    favBtn.hidden = false;
  result.data.forEach(function (name) {
    const item = document.createElement("li");

    const open = document.createElement("button");
    open.type = "button";
    open.textContent = name;
    open.addEventListener("click", function () {
      input.value = name;
      loadDepartures(name);
    });

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "x";
    remove.addEventListener("click", async function () {
      await apiRequest("backend/favorites.php", "DELETE", { station: name });
      loadFavorites();
    });
    item.append(open, remove);
    favList.appendChild(item);
  });
}

favBtn.addEventListener("click", async function () {
  await apiRequest("backend/favorites.php", "POST", { station: input.value });
  loadFavorites();
});

loadFavorites();

document.getElementById("logout-btn").addEventListener("click", async function () {
  await sendJson("backend/logout.php", {});
  authStatus.textContent = "Logged out";
  loadFavorites();
});

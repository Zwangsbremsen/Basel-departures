async function loadDepartures() {
  const url = "https://transport.opendata.ch/v1/stationboard?station=Basel%20SBB&limit=5";
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
}

loadDepartures();
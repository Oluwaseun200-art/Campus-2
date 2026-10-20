(() => {
  const form = document.getElementById("route-form");
  const originSelect = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const message = document.getElementById("form-message");
  const emptyState = document.getElementById("empty-state");
  const resultPanel = document.getElementById("route-result");
  const routeList = document.getElementById("route-list");

  const network = window.CAMPUS_NETWORK;
  if (!network || !Array.isArray(network.locations) || !Array.isArray(network.connections)) {
    message.textContent = "The location data could not be loaded. Check data/locations.js.";
    return;
  }

  const locationById = new Map(network.locations.map(location => [location.id, location]));
  network.locations.forEach(location => {
    [originSelect, destinationSelect].forEach(select => {
      const option = document.createElement("option");
      option.value = location.id;
      option.textContent = location.name;
      select.appendChild(option);
    });
  });

  function shortestPath(start, end) {
    const distances = new Map(network.locations.map(location => [location.id, Infinity]));
    const previous = new Map();
    const unvisited = new Set(network.locations.map(location => location.id));
    distances.set(start, 0);

    while (unvisited.size) {
      let current = null;
      let smallest = Infinity;
      for (const id of unvisited) {
        if (distances.get(id) < smallest) {
          smallest = distances.get(id);
          current = id;
        }
      }
      if (current === null) break;
      if (current === end) break;
      unvisited.delete(current);

      for (const edge of network.connections) {
        let neighbor = null;
        if (edge.from === current) neighbor = edge.to;
        else if (edge.to === current) neighbor = edge.from;
        if (!neighbor || !unvisited.has(neighbor)) continue;

        const candidate = distances.get(current) + Number(edge.distance);
        if (candidate < distances.get(neighbor)) {
          distances.set(neighbor, candidate);
          previous.set(neighbor, current);
        }
      }
    }

    if (!Number.isFinite(distances.get(end))) return null;
    const path = [];
    let step = end;
    while (step) {
      path.unshift(step);
      if (step === start) break;
      step = previous.get(step);
    }
    if (path[0] !== start) return null;
    return { path, distance: distances.get(end) };
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    message.textContent = "";
    routeList.replaceChildren();

    const start = originSelect.value;
    const end = destinationSelect.value;
    if (!start || !end) {
      message.textContent = "Please choose both a starting location and a destination.";
      return;
    }
    if (start === end) {
      message.textContent = "Choose two different locations to find a route.";
      return;
    }

    const result = shortestPath(start, end);
    if (!result) {
      message.textContent = "No route is available between these locations in the current sample network.";
      emptyState.hidden = false;
      resultPanel.hidden = true;
      return;
    }

    result.path.forEach(id => {
      const item = document.createElement("li");
      item.textContent = locationById.get(id)?.name ?? id;
      routeList.appendChild(item);
    });

    document.getElementById("distance").textContent = `${result.distance.toFixed(1)} km`;
    // Illustrative walking estimate: about 5 km/h. Not a live prediction.
    document.getElementById("duration").textContent = `${Math.max(1, Math.round(result.distance / 5 * 60))} min`;
    emptyState.hidden = true;
    resultPanel.hidden = false;
  });
})();

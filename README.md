# UI Campus Route — University of Ibadan

A responsive campus transportation routing prototype based on the uploaded project proposal.

## Features
- Responsive layout for desktop, tablet and mobile.
- Interactive OpenStreetMap map using Leaflet.
- Campus location pins with popups and "set as start/destination" actions.
- Location search and category filters.
- Origin/destination selection and swap controls.
- Dijkstra shortest-path search across a weighted graph.
- Route polyline, ordered route steps, approximate distance and estimated time.
- Accessible labels, keyboard-operable controls, input validation and no-route handling.

## Run locally
1. Extract the ZIP.
2. Open `index.html` in a modern browser. If your browser blocks local scripts, run a local static server from this folder, for example:
   - VS Code: install/use Live Server, then right-click `index.html` → **Open with Live Server**.
   - Python: `python -m http.server 8000`, then visit `http://localhost:8000`.
3. Internet access is required for the Tailwind CDN, Leaflet library, fonts and OpenStreetMap tiles.

## File structure
- `index.html` — page structure, Tailwind setup and external libraries.
- `css/styles.css` — custom design and responsive styling.
- `js/app.js` — map setup, UI events and Dijkstra route search.
- `data/locations.js` — editable campus location and connection data.

## Important data and scope note
The proposal describes a route-search prototype and explicitly places live vehicle GPS, live traffic, arrival predictions, payment and ticketing outside the initial scope. This implementation does not claim to provide those services.

The initial map coordinates, connections, distances and shuttle preference costs are illustrative starter data, not an official University of Ibadan GIS dataset or approved transport network. Verify every location, coordinate, path, distance, stop and service detail with reliable campus information before using this for real journeys. OpenStreetMap is a base map and is not itself proof that the route network in this prototype is official.

## Editing the data
Edit `data/locations.js`.
- Each location has a unique `id`, name, category, description, latitude and longitude.
- Each connection is `[fromId, toId, distanceKm]`.
- Connections are treated as bidirectional in this prototype.
- Dijkstra requires non-negative edge weights.
- If you change the location IDs, update all references in the connection list.

## Production improvements
For a deployable service, verify route data, test all paths and screen sizes, add a server/API and database if persistent administrative updates are needed, establish a route-data maintenance process, and review accessibility, privacy, security and OpenStreetMap usage requirements.

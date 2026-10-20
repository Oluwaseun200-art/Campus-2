(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const originSelect = $("#origin"), destinationSelect = $("#destination");
  const routeForm = $("#routeForm"), routeResult = $("#routeResult"), routeMessage = $("#routeMessage");
  const placeCards = $("#placeCards"), placeSearch = $("#placeSearch");
  let mode = "walk", activeCategory = "all", activeSearch = "", selectedRoute = null;
  let markerById = {}, routeLayer = null, highlightLayer = null;

  const categories = {academic:"Academic",transport:"Transport",residential:"Hostel",service:"Service"};
  const icons = {academic:"▥",transport:"↗",residential:"⌂",service:"＋"};
  const locationById = Object.fromEntries(CAMPUS_LOCATIONS.map(p=>[p.id,p]));
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

  function populateSelects() {
    const options = CAMPUS_LOCATIONS.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
    originSelect.innerHTML = `<option value="">Choose a starting point</option>${options}`;
    destinationSelect.innerHTML = `<option value="">Choose a destination</option>${options}`;
    originSelect.value = "ui-gate"; destinationSelect.value = "ken-anthony";
  }

  function makeGraph() {
    const graph = {};
    CAMPUS_LOCATIONS.forEach(p => graph[p.id] = []);
    CAMPUS_CONNECTIONS.forEach(([a,b,d]) => {
      if (!graph[a] || !graph[b] || !Number.isFinite(d) || d < 0) return;
      // Shuttle mode favours the illustrative transport interchange and uses
      // a small transfer penalty. It is not a real service timetable.
      const cost = mode === "shuttle" ? d + ((a==="transit-hub"||b==="transit-hub") ? 0.03 : 0.12) : d;
      graph[a].push({to:b,cost,distance:d}); graph[b].push({to:a,cost,distance:d});
    });
    return graph;
  }

  function dijkstra(start, end) {
    const graph = makeGraph();
    if (!graph[start] || !graph[end]) return null;
    const dist = {}, previous = {}, visited = new Set();
    Object.keys(graph).forEach(id=>dist[id]=Infinity);
    dist[start]=0;
    while (visited.size < Object.keys(graph).length) {
      let current = null, best = Infinity;
      for (const id of Object.keys(dist)) if (!visited.has(id) && dist[id] < best) {best=dist[id];current=id;}
      if (current === null) break;
      if (current === end) break;
      visited.add(current);
      for (const edge of graph[current]) {
        if (visited.has(edge.to)) continue;
        const next = dist[current] + edge.cost;
        if (next < dist[edge.to]) {dist[edge.to]=next;previous[edge.to]=current;}
      }
    }
    if (start !== end && !previous[end]) return null;
    const path=[]; let cursor=end;
    while (cursor) {path.unshift(cursor);if(cursor===start)break;cursor=previous[cursor];}
    if (path[0] !== start) return null;
    let distance=0;
    for(let i=1;i<path.length;i++){
      const edge=(CAMPUS_CONNECTIONS.find(e=>(e[0]===path[i-1]&&e[1]===path[i])||(e[1]===path[i-1]&&e[0]===path[i])));
      if(edge) distance += edge[2];
    }
    return {path,distance,cost:dist[end]};
  }

  const map = L.map("map", {zoomControl:false, scrollWheelZoom:true}).setView([7.4395,3.8987],15);
  L.control.zoom({position:"bottomright"}).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:19, attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
  }).addTo(map);

  function markerIcon(place, type="") {
    const cls = type ? ` ${type}` : "";
    return L.divIcon({className:"",html:`<div class="custom-marker${cls}"><span>${escapeHtml(place.icon || icons[place.category] || "•")}</span></div>`,iconSize:[30,30],iconAnchor:[15,28],popupAnchor:[0,-27]});
  }
  function popupContent(place) {
    return `<div class="popup-title">${escapeHtml(place.name)}</div><div class="popup-category">${escapeHtml(categories[place.category]||"Campus place")} · ${escapeHtml(place.description)}</div><div style="margin-top:9px;display:flex;gap:6px"><button data-set-origin="${place.id}" style="border:0;background:#eaf3e5;color:#17452e;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700">Set as start</button><button data-set-destination="${place.id}" style="border:0;background:#073b2a;color:white;padding:6px 8px;border-radius:6px;font-size:10px;font-weight:700">Set as destination</button></div>`;
  }
  function addMarkers() {
    CAMPUS_LOCATIONS.forEach(place=>{
      const marker=L.marker([place.lat,place.lng],{icon:markerIcon(place)}).bindPopup(popupContent(place));
      marker.on("click",()=>{renderPlaceCards();});
      marker.addTo(map); markerById[place.id]=marker;
    });
    map.on("popupopen", e=>{
      const el=e.popup.getElement();
      el.querySelectorAll("[data-set-origin]").forEach(btn=>btn.addEventListener("click",()=>{originSelect.value=btn.dataset.setOrigin;map.closePopup();}));
      el.querySelectorAll("[data-set-destination]").forEach(btn=>btn.addEventListener("click",()=>{destinationSelect.value=btn.dataset.setDestination;map.closePopup();}));
    });
  }

  function filteredLocations() {
    const q=activeSearch.trim().toLowerCase();
    return CAMPUS_LOCATIONS.filter(p=>(activeCategory==="all"||p.category===activeCategory)&&(!q||`${p.name} ${p.description} ${categories[p.category]}`.toLowerCase().includes(q)));
  }
  function renderPlaceCards() {
    const items=filteredLocations();
    $("#placeCount").textContent=`${items.length} place${items.length===1?"":"s"} shown`;
    if(!items.length){placeCards.innerHTML='<div class="empty-places">No locations match your search. Try another name or category.</div>';return;}
    placeCards.innerHTML=items.map(p=>`<button type="button" class="place-card ${selectedRoute?.path.includes(p.id)?"selected":""}" data-place="${p.id}" aria-label="Show ${escapeHtml(p.name)} on map"><div class="place-card-top"><span class="place-icon">${escapeHtml(p.icon||icons[p.category])}</span><span class="place-arrow">↗</span></div><b>${escapeHtml(p.name)}</b><small>${escapeHtml(categories[p.category]||"Campus place")} · ${escapeHtml(p.description)}</small></button>`).join("");
    $$(".place-card",placeCards).forEach(card=>card.addEventListener("click",()=>{
      const p=locationById[card.dataset.place];map.setView([p.lat,p.lng],17,{animate:true});markerById[p.id].openPopup();
    }));
  }

  function applyMapFilters() {
    const visible=new Set(filteredLocations().map(p=>p.id));
    CAMPUS_LOCATIONS.forEach(p=>{const m=markerById[p.id];if(visible.has(p.id)){if(!map.hasLayer(m))m.addTo(map);}else if(map.hasLayer(m))map.removeLayer(m);});
    renderPlaceCards();
  }
  function setMessage(text,type="error") {
    routeMessage.textContent=text;routeMessage.classList.remove("hidden","success");
    if(type==="success")routeMessage.classList.add("success");
  }
  function clearMessage(){routeMessage.classList.add("hidden");}
  function clearRoute() {
    selectedRoute=null;routeResult.classList.add("hidden");clearMessage();
    if(routeLayer){map.removeLayer(routeLayer);routeLayer=null;}
    if(highlightLayer){map.removeLayer(highlightLayer);highlightLayer=null;}
    CAMPUS_LOCATIONS.forEach(p=>{const m=markerById[p.id];m.setIcon(markerIcon(p));});
    renderPlaceCards();
  }
  function showRoute() {
    clearRoute();
    const start=originSelect.value,end=destinationSelect.value;
    if(!start||!end){setMessage("Please choose both a starting point and a destination.");return;}
    if(start===end){setMessage("Your starting point and destination are the same. Choose two different locations.");return;}
    const result=dijkstra(start,end);
    if(!result){setMessage("No connected route was found in the current prototype data. This may mean the sample network needs another connection.");return;}
    selectedRoute=result;
    const coords=result.path.map(id=>[locationById[id].lat,locationById[id].lng]);
    routeLayer=L.polyline(coords,{color:"#e5a847",weight:5,opacity:.95,lineCap:"round",lineJoin:"round"}).addTo(map);
    highlightLayer=L.circleMarker(coords.slice(1,-1),{radius:5,color:"#fff",weight:2,fillColor:"#d79532",fillOpacity:1}).addTo(map);
    result.path.forEach((id,i)=>markerById[id].setIcon(markerIcon(locationById[id],i===0?"origin":i===result.path.length-1?"destination":"route-stop")));
    map.fitBounds(routeLayer.getBounds(),{padding:[45,45],maxZoom:17});
    const mins=mode==="walk"?Math.max(1,Math.round(result.distance/4.5*60)):Math.max(2,Math.round(result.distance/12*60)+3);
    $("#resultTitle").textContent=`${locationById[start].name} to ${locationById[end].name}`;
    $("#distanceValue").textContent=`${result.distance.toFixed(2)} km`;
    $("#timeValue").textContent=`~${mins} min`;
    $("#routeSteps").innerHTML=result.path.map((id,i)=>`<li><span class="step-num">${i===0?"A":i===result.path.length-1?"B":i}</span><span class="step-copy"><b>${escapeHtml(locationById[id].name)}</b><small>${i===0?"Start here":i===result.path.length-1?"You have reached your destination":`Continue to ${escapeHtml(locationById[id].name)}`}</small></span></li>`).join("");
    routeResult.classList.remove("hidden");
    setMessage("Route calculated using the included prototype network. Check local signs and directions before travelling.","success");
    renderPlaceCards();
  }

  populateSelects(); addMarkers(); renderPlaceCards();
  routeForm.addEventListener("submit",e=>{e.preventDefault();showRoute();});
  $("#swapBtn").addEventListener("click",()=>{const old=originSelect.value;originSelect.value=destinationSelect.value;destinationSelect.value=old;});
  $("#clearRoute").addEventListener("click",clearRoute);
  $$(".mode-btn").forEach(btn=>btn.addEventListener("click",()=>{
    mode=btn.dataset.mode;$$(".mode-btn").forEach(b=>{const active=b===btn;b.classList.toggle("active",active);b.setAttribute("aria-pressed",String(active));});
    if(mode==="shuttle")setMessage("Shuttle preference uses illustrative costs only; no live shuttle service or timetable is connected.");
    else clearMessage();
  }));
  placeSearch.addEventListener("input",()=>{activeSearch=placeSearch.value;applyMapFilters();});
  $("#clearPlaceSearch").addEventListener("click",()=>{placeSearch.value="";activeSearch="";applyMapFilters();placeSearch.focus();});
  $$(".category-chip").forEach(btn=>btn.addEventListener("click",()=>{activeCategory=btn.dataset.category;$$(".category-chip").forEach(b=>b.classList.toggle("active",b===btn));applyMapFilters();}));
  $("#resetFilters").addEventListener("click",()=>{activeCategory="all";activeSearch="";placeSearch.value="";$$(".category-chip").forEach(b=>b.classList.toggle("active",b.dataset.category==="all"));applyMapFilters();});
  $("#showAllBtn").addEventListener("click",()=>{activeCategory="all";activeSearch="";placeSearch.value="";$$(".category-chip").forEach(b=>b.classList.toggle("active",b.dataset.category==="all"));applyMapFilters();const group=L.featureGroup(CAMPUS_LOCATIONS.map(p=>markerById[p.id]));map.fitBounds(group.getBounds().pad(.12));});
  $("#locateCampusBtn").addEventListener("click",()=>map.setView([7.4395,3.8987],15,{animate:true}));
  $("#mobileMenuBtn").addEventListener("click",()=>{const nav=$("#mobileNav"),open=nav.classList.contains("hidden");nav.classList.toggle("hidden",!open);$("#mobileMenuBtn").setAttribute("aria-expanded",String(open));});
  $$("#mobileNav a").forEach(a=>a.addEventListener("click",()=>{$("#mobileNav").classList.add("hidden");$("#mobileMenuBtn").setAttribute("aria-expanded","false");}));
  // Handle tile/map resizing when responsive layout changes.
  window.addEventListener("resize",()=>{if(map)map.invalidateSize({pan:false});});
})();

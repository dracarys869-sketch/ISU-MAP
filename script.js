const programs = [
  {
    name:"BS in Information Technology",
    college: "College of CCSICT",
    location: "CCSICT Building",
    link: "programs/bsit.html",
    image: "images/ict.png",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BS in Agriculture",
    college: "College of Agriculture",
    location: "IAT Building",
    link: "programs/agri.html",
    image: "images/agri.jpg",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BA in Political Science",
    college: "College of Law",
    location: "SAS Building",
    link: "programs/polsci.html",
    image: "images/polsci.png",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BS in Business Administration",
    college: "College of Business and Management",
    location: "New Building",
    link: "programs/bsba.html",
    image: "images/business-add.jpg",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BS in Secondary Education",
    college: "College of Education",
    location: "CED Old Building",
    link: "programs/secondary-ed.html",
    image: "images/secondary.jpg",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BS in Criminology",
    college: "College of Criminal and Justice Education",
    location: "CCJE Building",
    link: "programs/crim.html",
    image: "images/crim.jpg",
    duration: "4 Years",
    type: "On-campus"
  },
  {
    name: "BS in Automotive",
    college: "College of Polytechnic",
    location: "PS Building",
    link: "programs/auto.html",
    image: "images/auto.png",
    duration: "4 Years",
    type: "On-campus"
  }
];

let searchDebounceTimeout = null;
function onSearchInput() {
  clearTimeout(searchDebounceTimeout);
  searchDebounceTimeout = setTimeout(filterPrograms, 200);
}

function filterPrograms() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const filter = document.getElementById("collegeFilter").value;
  const list = document.getElementById("programList");
  const countEl = document.getElementById("programCount");

  const filtered = programs.filter(p => {
    const textMatch = (
      p.name.toLowerCase().includes(search) ||
      p.college.toLowerCase().includes(search) ||
      p.location.toLowerCase().includes(search)
    );
    const collegeMatch = filter === "all" || p.college.trim() === filter.trim();
    return textMatch && collegeMatch;
  });

  if (countEl) {
    countEl.textContent = `Showing ${filtered.length} of ${programs.length} programs`;
  }

  if (filtered.length === 0) {
    list.innerHTML = `<p class="empty-state">No results found. Try a different search or college filter.</p>`;
    return;
  }

  list.innerHTML = "";
  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "program-card";
    div.innerHTML = `
      <a href="${p.link}" class="program-link">
        <img src="${p.image}" alt="${p.name}" />
        <div class="program-content">
          <h3>${p.name}</h3>
          <p>${p.college}</p>
          <p>Located at: ${p.location}</p>
          <div class="program-meta">
            <span class="chip">${p.type}</span>
            <span class="chip">${p.duration}</span>
            <button class="chip chip-locate" aria-label="Locate ${p.name} on map">📍 Locate</button>
          </div>
        </div>
      </a>
    `;
    
    const locateBtn = div.querySelector(".chip-locate");
    if (locateBtn) {
      locateBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.locateOnMap) {
          window.locateOnMap(p.college);
        }
      });
    }

    list.appendChild(div);
  });
}

window.addEventListener("load", function () {
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("siteNavLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      const isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Display Skeletons before final program list filter load to improve perceived performance
  const programListEl = document.getElementById("programList");
  if (programListEl) {
    programListEl.innerHTML = Array(4).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-text">
          <div class="skeleton-line title"></div>
          <div class="skeleton-line sub"></div>
          <div class="skeleton-line loc"></div>
          <div class="skeleton-line chips"></div>
        </div>
      </div>
    `).join("");
  }

  setTimeout(filterPrograms, 450);

  const campusCenter = [121.7645, 16.9385]; // [lng, lat]
  const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets-v2/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
    center: campusCenter,
    zoom: 17,
    pitch: 60,
    bearing: -20,
    antialias: true
  });

  let mapReady = false;
  let pendingRouteFn = null;

  map.on('load', () => {
    mapReady = true;

    const layers = map.getStyle().layers;
    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addSource('openmaptiles', {
        url: 'https://api.maptiler.com/tiles/v3/tiles.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
        type: 'vector'
    });

    map.addLayer(
        {
            'id': '3d-buildings',
            'source': 'openmaptiles',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );

    // Run any route that was queued before the style finished loading
    if (pendingRouteFn) {
      pendingRouteFn();
      pendingRouteFn = null;
    }
  });

  const locations = [
    { name: "College of CCSICT", lat: 16.9379686, lng: 121.7639893 },
    { name: "College of Agriculture", lat: 16.9401390, lng: 121.7647525 },
    { name: "College of Law", lat: 16.9373171, lng: 121.7637492 },
    { name: "College of Business and Management", lat: 16.9360109, lng: 121.7645025 },
    { name: "College of Education", lat: 16.9365611, lng: 121.7646828 },
    { name: "College of Criminal and Justice Education", lat: 16.9393644, lng: 121.7652884 },
    { name: "College of Polytechnic", lat: 16.9387236, lng: 121.7642303 },
    { name: "Gate", lat: 16.9358273, lng: 121.7640069 },
    { name: "Library", lat: 16.9369665, lng: 121.7637022 },
    { name: "Food Court", lat: 16.9380052, lng: 121.7649993 },
    { name: "Cashier", lat: 16.9364721, lng: 121.7643378 },
    { name: "CBAO", lat: 16.9358188, lng: 121.7642777 },
    { name: "CBM (U BUILDING)", lat: 16.9371557, lng: 121.7648479 },
  ];

  const gateLocation = locations.find(loc => loc.name === "Gate");
  const routeStartSelect = document.getElementById("routeStartSelect");
  const locateBtn = document.getElementById("locateBtn");
  const routeStatus = document.getElementById("routeStatus");

  let routeStartMode = "gate";
  let userLocation = null;
  let userMarker = null;
  let lastDestination = null;
  let routeSourceId = "route";
  let selectedPinpoint = null;

  function setRouteStatus(message, isError) {
    if (!routeStatus) return;
    routeStatus.textContent = message;
    routeStatus.style.color = isError ? "#b42318" : "";
  }

  function drawRouteLine(geojson) {
    if (!mapReady) return; // style not ready yet — caller handles retry via pendingRouteFn
    if (map.getSource(routeSourceId)) {
        map.getSource(routeSourceId).setData(geojson);
    } else {
        map.addSource(routeSourceId, {
            'type': 'geojson',
            'data': geojson
        });
        map.addLayer({
            'id': 'route-line',
            'type': 'line',
            'source': routeSourceId,
            'layout': {
                'line-join': 'round',
                'line-cap': 'round'
            },
            'paint': {
                'line-color': '#1b6ef3',
                'line-width': 5,
                'line-opacity': 0.9
            }
        });
    }
  }

  function drawRoute(startLat, startLng, startLabel, endLat, endLng, endLabel) {
    const samePoint = Math.abs(endLat - startLat) < 0.000001 && Math.abs(endLng - startLng) < 0.000001;
    if (samePoint) {
      if (map.getSource(routeSourceId)) {
          map.getSource(routeSourceId).setData({ type: 'FeatureCollection', features: [] });
      }
      setRouteStatus("You are already at this point.", false);
      return;
    }

    const osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    setRouteStatus("Calculating route...", false);

    fetch(osrmUrl)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes.length > 0) {
            const routeGeoJSON = {
                type: 'Feature',
                properties: {},
                geometry: data.routes[0].geometry
            };
            drawRouteLine(routeGeoJSON);
            
            const coordinates = routeGeoJSON.geometry.coordinates;
            const bounds = coordinates.reduce(function (b, coord) {
                return b.extend(coord);
            }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

            map.fitBounds(bounds, { padding: 50 });
            
            const distance = data.routes[0].distance; // meters
            const duration = data.routes[0].duration; // seconds
            const distStr = distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${Math.round(distance)} m`;
            const durationStr = duration >= 60 ? `${Math.ceil(duration / 60)} min` : `${Math.round(duration)} sec`;
            
            setRouteStatus(`Showing route from ${startLabel} to ${endLabel} (${distStr} · ~${durationStr} walk).`, false);
        } else {
            setRouteStatus(`Could not find a route to ${endLabel}.`, true);
        }
      })
      .catch(err => {
        setRouteStatus(`Error fetching route: ${err.message}`, true);
      });
  }

  function requestUserLocation(onSuccess) {
    if (!navigator.geolocation) {
      setRouteStatus("Geolocation is not supported by this browser.", true);
      return;
    }

    setRouteStatus("Getting your location...", false);
    navigator.geolocation.getCurrentPosition(
      function (position) {
        const { latitude, longitude } = position.coords;
        userLocation = { lat: latitude, lng: longitude };

        if (userMarker) {
          userMarker.remove();
        }

        const el = document.createElement('div');
        el.className = 'user-location-marker';

        userMarker = new maplibregl.Marker({ element: el })
          .setLngLat([longitude, latitude])
          .setPopup(new maplibregl.Popup().setHTML("<b>Your current location</b>"))
          .addTo(map);

        setRouteStatus("My Location is ready. Click a marker or map point for directions.", false);

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      },
      function () {
        setRouteStatus("Unable to access your location. Please allow location permission.", true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }

  function showRouteFromSelectedStart(lat, lng, destinationName) {
    if (!gateLocation) return;
    lastDestination = { lat, lng, name: destinationName };

    // If map style isn't ready yet, queue this call to run once it loads
    if (!mapReady) {
      pendingRouteFn = () => showRouteFromSelectedStart(lat, lng, destinationName);
      return;
    }

    if (routeStartMode === "user") {
      if (!userLocation) {
        requestUserLocation(function () {
          showRouteFromSelectedStart(lat, lng, destinationName);
        });
        return;
      }
      drawRoute(userLocation.lat, userLocation.lng, "My Location", lat, lng, destinationName);
      return;
    }
    drawRoute(gateLocation.lat, gateLocation.lng, "Gate", lat, lng, destinationName);
  }

  const bounds = new maplibregl.LngLatBounds();

  locations.forEach(loc => {
    const el = document.createElement('div');
    el.className = 'location-pin-icon location-pin-wrapper';
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "button");
    el.setAttribute("aria-label", loc.name);
    el.innerHTML = `
      <span class="location-pin-body"></span>
      <div class="location-pin-label">${loc.name}</div>
    `;

    const popup = new maplibregl.Popup({ offset: 25 })
      .setHTML(`<b>${loc.name}</b><br><small>Click for directions</small>`);

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([loc.lng, loc.lat])
      .setPopup(popup)
      .addTo(map);

    const selectLocation = function (e) {
      e.stopPropagation();
      showRouteFromSelectedStart(loc.lat, loc.lng, loc.name);
    };

    el.addEventListener("click", selectLocation);
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectLocation(e);
      }
    });

    bounds.extend([loc.lng, loc.lat]);
  });

  function setPinpoint(lat, lng, label) {
    if (selectedPinpoint) {
      selectedPinpoint.remove();
    }

    const el = document.createElement('div');
    el.className = 'pinpoint-icon';
    el.innerHTML = '<span class="pinpoint-icon-body"></span>';

    selectedPinpoint = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b>${label}</b>`))
      .addTo(map);
      
    selectedPinpoint.togglePopup();
    showRouteFromSelectedStart(lat, lng, label);
  }

  window.locateOnMap = function (targetCollege) {
    const targetLoc = locations.find(l => l.name === targetCollege);
    if (targetLoc) {
      showRouteFromSelectedStart(targetLoc.lat, targetLoc.lng, targetLoc.name);
      const mapTitle = document.getElementById("map-title");
      if (mapTitle) {
        mapTitle.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  if (routeStartSelect) {
    routeStartSelect.addEventListener("change", function () {
      routeStartMode = routeStartSelect.value;
      if (routeStartMode === "user" && !userLocation) {
        requestUserLocation(function () {
          if (lastDestination) {
            showRouteFromSelectedStart(lastDestination.lat, lastDestination.lng, lastDestination.name);
          }
        });
        return;
      }
      const startName = routeStartMode === "user" ? "My Location" : "Gate";
      setRouteStatus(`Route start changed to ${startName}.`, false);
      if (lastDestination) {
        showRouteFromSelectedStart(lastDestination.lat, lastDestination.lng, lastDestination.name);
      }
    });
  }

  if (locateBtn) {
    locateBtn.addEventListener("click", function () {
      requestUserLocation(function () {
        if (routeStartSelect) {
          routeStartSelect.value = "user";
          routeStartMode = "user";
        }
        if (lastDestination) {
          showRouteFromSelectedStart(lastDestination.lat, lastDestination.lng, lastDestination.name);
        }
      });
    });
  }

  const clearRouteBtn = document.getElementById("clearRouteBtn");
  const clearAllRoute = function () {
    if (selectedPinpoint) {
      selectedPinpoint.remove();
      selectedPinpoint = null;
    }
    if (map.getSource(routeSourceId)) {
        map.getSource(routeSourceId).setData({ type: 'FeatureCollection', features: [] });
    }
    setRouteStatus("Pinpoint and route cleared.", false);
  };

  if (clearRouteBtn) {
    clearRouteBtn.addEventListener("click", clearAllRoute);
  }

  setPinpoint(campusCenter[1], campusCenter[0], "ISU Main Campus");

  map.on("click", function (e) {
    const { lng, lat } = e.lngLat;
    setPinpoint(lat, lng, `Custom Destination (${lng.toFixed(4)}, ${lat.toFixed(4)})`);
  });

  map.on("contextmenu", function () {
    clearAllRoute();
  });

  map.fitBounds(bounds, { padding: 50 });

  // Highlight Active Nav Links on Scroll
  const navAnchorLinks = document.querySelectorAll(".nav-links a");
  const sectionsToObserve = [
    document.getElementById("top"),
    document.getElementById("programList"),
    document.querySelector(".map-section"),
    document.getElementById("about")
  ].filter(Boolean);

  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.3
  };

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id") || (entry.target.classList.contains("map-section") ? "map-title" : "");
        navAnchorLinks.forEach(link => {
          const href = link.getAttribute("href");
          if (href === `#${id}` || (id === "map-title" && href === "#map-title")) {
            link.classList.add("active");
          } else {
            link.classList.remove("active");
          }
        });
      }
    });
  }, observerOptions);

  sectionsToObserve.forEach(section => navObserver.observe(section));

  // Handle URL routing request
  const urlParams = new URLSearchParams(window.location.search);
  const routeToTarget = urlParams.get('routeTo');
  if (routeToTarget) {
    const targetLoc = locations.find(l => l.name === routeToTarget);
    if (targetLoc) {
      if (!mapReady) {
        pendingRouteFn = () => showRouteFromSelectedStart(targetLoc.lat, targetLoc.lng, targetLoc.name);
      } else {
        showRouteFromSelectedStart(targetLoc.lat, targetLoc.lng, targetLoc.name);
      }
    }
  }
});

window.addEventListener("load", () => {
    var mapToken = "pk.eyJ1Ijoic2FsdmFoZHotMTEiLCJhIjoiY2x3czBoYTJiMDI1OTJqb2VmZzVueG1ocCJ9.dDJweS7MAR5N2U3SF64_Xw";
    var mapElement = document.getElementById("map");
    const savedLastLayerMap = localStorage.getItem("mapbox-last_layer");
    const inputsLayer = document.querySelectorAll("#offcanvasbody input[type='radio']");
    const labelsLayer = document.querySelectorAll("#offcanvasbody label");
    const formRoute = document.querySelector("#form_route");
    const selectOrigin = formRoute.querySelector("#origen");
    const selectDestiny = formRoute.querySelector("#destino");
    const resetRoutBtn = formRoute.querySelector("[data-reset_form]");
    const delRoutBtn = formRoute.querySelector("[data-del_route]");
    let colorlabels = "#000";
    let offcanvasOpen = false;
    let formChanges = false;
    let currentRoute;
    var currentMarker;
    var doorMarker;

    const offcanvasElement = document.querySelector("#infoLateral");
    const offcanvasInstance =
        bootstrap.Offcanvas.getInstance(offcanvasElement) || new bootstrap.Offcanvas(offcanvasElement);

    mapboxgl.accessToken = mapToken;
    const mapMapbox = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/mapbox/streets-v12",
        center: [-100.93655, 25.55701],
        zoom: 16,
        maxZoom: 20,
        minZoom: 15,
        maxBounds: [
            [-100.9736, 25.5142],
            [-100.9117, 25.5735],
        ],
    });

    // Cambiar Estilo con switch de tema ######################################
    $("#switchTheme").click(function () {
        if ($("#switchTheme").is(":checked")) {
            colorlabels = "#000";
            setMapStyle("streets-v12");
            updateLabelsAndInputs("streets-v12");
        } else {
            colorlabels = "#fff";
            setMapStyle("dark-v11");
            updateLabelsAndInputs("dark-v11");
        }
    });

    if (mapElement.classList.contains("map_editing")) {
        formChanges = true;

        // Traducir nombre a color
        var colorMap = {
            black: "#000000",
            negro: "#000000",
            white: "#FFFFFF",
            blanco: "#FFFFFF",
            red: "#FF0000",
            rojo: "#FF0000",
            green: "#008000",
            verde: "#008000",
            blue: "#0000FF",
            azul: "#0000FF",
            yellow: "#FFFF00",
            amarillo: "#FFFF00",
            cyan: "#00FFFF",
            cian: "#00FFFF",
            magenta: "#FF00FF",
            magenta: "#FF00FF",
            gray: "#808080",
            gris: "#808080",
            darkgray: "#A9A9A9",
            "gris oscuro": "#A9A9A9",
            lightgray: "#D3D3D3",
            "gris claro": "#D3D3D3",
            dimgray: "#696969",
            "gris tenue": "#696969",
            slategray: "#708090",
            "gris pizarra": "#708090",
            cornflowerblue: "#6495ED",
            "azul aciano": "#6495ED",
            darkred: "#8B0000",
            "rojo oscuro": "#8B0000",
            lightgreen: "#90EE90",
            "verde claro": "#90EE90",
            darkblue: "#00008B",
            "azul oscuro": "#00008B",
            gold: "#FFD700",
            oro: "#FFD700",
            silver: "#C0C0C0",
            plata: "#C0C0C0",
            pink: "#FFC0CB",
            rosa: "#FFC0CB",
            orange: "#FFA500",
            naranja: "#FFA500",
            purple: "#800080",
            morado: "#800080",
            brown: "#A52A2A",
            marrón: "#A52A2A",
            violet: "#EE82EE",
            violeta: "#EE82EE",
            turquoise: "#40E0D0",
            turquesa: "#40E0D0",
            indigo: "#4B0082",
            índigo: "#4B0082",
            khaki: "#F0E68C",
            caqui: "#F0E68C",
            maroon: "#800000",
            granate: "#800000",
            olive: "#808000",
            oliva: "#808000",
            navy: "#000080",
            "azul marino": "#000080",
            teal: "#008080",
            "verde azulado": "#008080",
            salmon: "#FA8072",
            salmón: "#FA8072",
            goldenrod: "#DAA520",
            "vara de oro": "#DAA520",
            chocolate: "#D2691E",
            chocolate: "#D2691E",
            coral: "#FF7F50",
            coral: "#FF7F50",
            aquamarine: "#7FFFD4",
            aguamarina: "#7FFFD4",
            fuchsia: "#FF00FF",
            fucsia: "#FF00FF",
            lavender: "#E6E6FA",
            lavanda: "#E6E6FA",
            beige: "#F5F5DC",
            beis: "#F5F5DC",
            azure: "#F0FFFF",
            "cian claro": "#F0FFFF",
            ivory: "#FFFFF0",
            marfil: "#FFFFF0",
            linen: "#FAF0E6",
            lino: "#FAF0E6",
            plum: "#DDA0DD",
            ciruela: "#DDA0DD",
            orchid: "#DA70D6",
            orquídea: "#DA70D6",
            mintcream: "#F5FFFA",
            "crema de menta": "#F5FFFA",
            seashell: "#FFF5EE",
            concha: "#FFF5EE",
            honeydew: "#F0FFF0",
            "rocío de miel": "#F0FFF0",
            snow: "#FFFAFA",
            nieve: "#FFFAFA",
            blanchedalmond: "#FFEBCD",
            "almendra blanqueada": "#FFEBCD",
            antiquewhite: "#FAEBD7",
            "blanco antiguo": "#FAEBD7",
            skyblue: "#87CEEB",
            "cielo azul": "#87CEEB",
            peachpuff: "#FFDAB9",
            durazno: "#FFDAB9",
            navajowhite: "#FFDEAD",
            "blanco navajo": "#FFDEAD",
            wheat: "#F5DEB3",
            trigo: "#F5DEB3",
            peru: "#CD853F",
            perú: "#CD853F",
            tomato: "#FF6347",
            tomate: "#FF6347",
            lightblue: "#ADD8E6",
            "azul claro": "#ADD8E6",
            lime: "#00FF00",
            lima: "#00FF00",
        };
        const colorsList = $("#colorsList");
        for (let colorName in colorMap) {
            colorsList.append(`<option value="${colorName}">`);
        }
        function getHexColor(colorName) {
            return colorMap[colorName.toLowerCase()] || colorName;
        }
        function setColorInput() {
            const colorName = $("[data-colorName]").val();
            const hexColor = getHexColor(colorName);
            $("#colorHex").val(hexColor);
            $("[data-colorPicker]").val(hexColor);
        }
        $("[data-colorName]").on("input", setColorInput);
        $("[data-colorPicker]").on("input", function () {
            const colorPicker = $("[data-colorPicker]").val();
            $("[data-colorName]").addClass("active").val(colorPicker);
            $("#colorHex").val(colorPicker);
        });
        // Hacer visible los campos de las esquinas
        $("#btnPoligon").on("click", function () {
            $("#esquinasPoligono").slideDown("slow");
        });

        // Dibujar poligono
        const drawPolygonButton = document.getElementById("btnPoligon");
        const drawPolygonCancel = document.getElementById("btnPoligonCancel");
        const coordInputs = ["esquina1", "esquina2", "esquina3", "esquina4"];
        const colors = ["tomato", "#3b71ca", "lime", "#d29c15"];
        let rightClicks = 4;
        let markers = [];
        let coords = [];
        let polygonLayer = null;
        let createNew = false;

        drawPolygonButton.addEventListener("click", () => {
            createNew = true;
            formChanges = false;
            initPolygonDrawing();
            $("#controlsIndic .card-header h6").html('<i class="fa-solid fa-draw-polygon me-1"></i>Dibujar Poligono:');
            $("#controlsIndic .card-body p").html(
                'Da <strong id="poligonClicks">4</strong> cliks derechos en el mapa... <br> Dibuja el poligono en sentido <u>Horario</u> <i class="fa-solid fa-arrow-rotate-right ms-1"></i>'
            );
            $("#controlsIndic").addClass("show");
            mapMapbox.on("contextmenu", countClicks);

            mapMapbox.on("contextmenu", addMarker);
            $("#btnPoligonCancel").slideDown();
            if (window.innerWidth <= 800) {
                setTimeout(() => {
                    if (offcanvasElement.classList.contains("show")) {
                        offcanvasInstance.hide();
                    }
                }, 1000);
            }
        });
        drawPolygonCancel.addEventListener("click", () => {
            createNew = "";
            initPolygonDrawing();
            mapMapbox.off("contextmenu", addMarker);
            mapMapbox.off("contextmenu", countClicks);
            $("#controlsIndic").removeClass("show");
            $("#btnPoligonCancel").slideUp();
            $("#esquinasPoligono").slideUp("fast");
        });
        function addMarker(e) {
            if (coords.length < 4) {
                const color = colors[coords.length];
                const marker = new mapboxgl.Marker({ color: color, draggable: true })
                    .setLngLat(e.lngLat)
                    .addTo(mapMapbox)
                    .on("dragend", updatePolygon);
                markers.push(marker);
                coords.push(e.lngLat);

                document.getElementById(coordInputs[coords.length - 1]).classList.add("active");
                document.getElementById(coordInputs[coords.length - 1]).value = `${e.lngLat.lng}, ${e.lngLat.lat}`;
            }

            if (coords.length === 4) {
                mapMapbox.off("contextmenu", addMarker);
                drawPolygon();
                drawPolygonButton.classList.add("bg_red-blue");
                drawPolygonButton.classList.remove("bg_purple-blue");
                drawPolygonButton.innerHTML = 'Dibujar de nuevo <i class="fa-solid fa-trash-can ms-1"></i>';
                createNew = true;
                $("#btnPoligonCancel").slideUp();
            }
        }
        function initPolygonDrawing() {
            markers.forEach((marker) => marker.remove());
            markers = [];
            coords = [];
            if (createNew) {
                drawPolygonButton.classList.remove("btn_detail", "bg_red-blue");
                drawPolygonButton.classList.add("bg_purple-blue");
                drawPolygonButton.innerHTML = 'Borrar marcadores <i class="fa-solid fa-trash-can ms-1"></i>';
            } else if (createNew === "") {
                drawPolygonButton.classList.remove("bg_purple-blue", "bg_red-blue");
                drawPolygonButton.classList.add("btn_detail");
                drawPolygonButton.innerHTML = 'Dibujar Poligono <i class="fa-solid fa-draw-polygon ms-1"></i>';
            }

            if (polygonLayer) {
                if (mapMapbox.getLayer(polygonLayer.id + "_label")) {
                    mapMapbox.removeLayer(polygonLayer.id + "_label");
                }
                if (mapMapbox.getLayer(polygonLayer.id)) {
                    mapMapbox.removeLayer(polygonLayer.id);
                }
                if (mapMapbox.getSource(polygonLayer.id)) {
                    mapMapbox.removeSource(polygonLayer.id);
                }
            }

            createNew = false;
        }
        function drawPolygon() {
            const polygonText = document.getElementById("nombreEdificio").value || "Nuevo Lugar";
            const polygonColor = document.getElementById("colorHex").value || "#808080";

            const coordinates = [
                coords[0].toArray(),
                coords[1].toArray(),
                coords[2].toArray(),
                coords[3].toArray(),
                coords[0].toArray(),
            ];

            if (mapMapbox.getLayer("polygon_label")) {
                mapMapbox.removeLayer("polygon_label");
            }
            if (mapMapbox.getLayer("polygon")) {
                mapMapbox.removeLayer("polygon");
            }
            if (mapMapbox.getSource("polygon")) {
                mapMapbox.removeSource("polygon");
            }

            const polygonId = "polygon";

            mapMapbox.addSource(polygonId, {
                type: "geojson",
                data: {
                    type: "Feature",
                    geometry: {
                        type: "Polygon",
                        coordinates: [coordinates],
                    },
                },
            });

            mapMapbox.addLayer({
                id: polygonId,
                type: "fill",
                source: polygonId,
                layout: {},
                paint: {
                    "fill-color": polygonColor,
                    "fill-opacity": 0.5,
                },
            });

            mapMapbox.addLayer({
                id: polygonId + "_label",
                type: "symbol",
                source: polygonId,
                layout: {
                    "text-field": polygonText,
                    "text-size": 14,
                    "text-anchor": "center",
                },
                paint: {
                    "text-color": colorlabels,
                },
            });

            polygonLayer = { id: polygonId };
        }
        function updatePolygon() {
            coords = markers.map((marker) => marker.getLngLat());
            coordInputs.forEach((id, index) => {
                document.getElementById(id).value = `${coords[index].lng}, ${coords[index].lat}`;
            });

            drawPolygon();
        }
        function countClicks() {
            rightClicks--;
            if (rightClicks > 0) {
                document.getElementById("poligonClicks").textContent = rightClicks;
            } else {
                mapMapbox.off("contextmenu", countClicks);
                setTimeout(() => {
                    $("#controlsIndic").removeClass("show");
                    rightClicks = 4;
                    document.getElementById("poligonClicks").textContent = rightClicks;
                }, 2000);
            }
        }

        // Colocar puerta
        const btnDoor = document.getElementById("inputBtnDoor");
        const puertaCordsEdificio = document.getElementById("puertaCordsEdificio");
        var doorMarker;
        let addDoorMarker = true;
        btnDoor.addEventListener("click", () => {
            formChanges = false;
            if (addDoorMarker) {
                if (coords.length > 4) {
                    drawPolygonCancel.click();
                }
                btnDoor.classList.add("bg_purple-blue");
                btnDoor.classList.remove("btn_detail");
                mapMapbox.on("contextmenu", addMarkerDoor);

                $("#controlsIndic .card-header h6").html(
                    '<i class="fa-solid fa-location-dot me-1"></i>Punto de Entrada:'
                );
                $("#controlsIndic .card-body p").html(
                    "Da <strong>1</strong> clik derecho en el mapa... <br> Debe esta ubicada en el <strong>borde</strong>  del poligono y conectada con algun <strong>camino</strong>"
                );
                $("#controlsIndic").addClass("show");
            }
            addDoorMarker = false;
            if (window.innerWidth <= 800) {
                setTimeout(() => {
                    if (offcanvasElement.classList.contains("show")) {
                        offcanvasInstance.hide();
                    }
                }, 1000);
            }
        });
        function addMarkerDoor(e) {
            if (doorMarker) {
                doorMarker.remove();
            }
            doorMarker = new mapboxgl.Marker({ color: "purple", draggable: true })
                .setLngLat(e.lngLat)
                .addTo(mapMapbox)
                .on("dragend", updateDoorCords);

            puertaCordsEdificio.classList.add("active");
            puertaCordsEdificio.value = `${e.lngLat.lng}, ${e.lngLat.lat}`;
            btnDoor.classList.remove("bg_purple-blue");
            btnDoor.classList.add("btn_detail");
            addDoorMarker = true;

            mapMapbox.off("contextmenu", addMarkerDoor);
            setTimeout(() => {
                $("#controlsIndic").removeClass("show");
            }, 2000);
        }
        function updateDoorCords(e) {
            const lngLat = doorMarker.getLngLat();
            puertaCordsEdificio.value = `${lngLat.lng}, ${lngLat.lat}`;
        }

        // Detectar si es marcador
        $("#ismarker").change(function () {
            if ($(this).is(":checked")) {
                $("#sizemarkerdiv").slideDown("fast");
                $("[data-notmarker]").slideUp();
                $('[for="puertaCordsEdificio"]').text("Ubicacion:");
            } else {
                $("#sizemarkerdiv").slideUp();
                $("[data-notmarker]").slideDown();
                $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
            }
        });
        $("#sizemarker").blur(function () {
            const maxval = parseFloat($("#sizemarker").attr("max"));
            const minval = parseFloat($("#sizemarker").attr("min"));
            let defval = parseFloat($("#sizemarker").val());

            if (defval > maxval) {
                defval = maxval;
            } else if (defval < minval) {
                defval = minval;
            }

            $("#sizemarker").val(defval);
        });
    }

    // Detectar cuando un offcanvas se cierra
    offcanvasElement.addEventListener("hidden.bs.offcanvas", function () {
        offcanvasOpen = false;
    });
    // Cuando se cierra el modal de eliminar
    $("#deletePleace").on("hidden.bs.modal", function (e) {
        $("#btnDeletedPleace").hide();
        $("[data-namePleace]").text("");
    });

    // Crear nuevo menu de botones personalizados ########################################
    mapMapbox.addControl(new mapboxgl.NavigationControl());
    class CustomControl {
        constructor() {
            this._container = null;
        }

        onAdd(mapMapbox) {
            this._container = document.createElement("div");
            this._container.className = "mapboxgl-ctrl mapboxgl-ctrl-group";

            const createButton = (className, innerHTML, title, onClick) => {
                const button = document.createElement("button");
                button.className = "mapboxgl-ctrl-" + className;
                button.innerHTML = innerHTML;
                button.title = title;
                button.type = "button";
                button.onclick = onClick;
                return button;
            };
            const linkmaps = createButton(
                "gmaps",
                `<div class="mapboxgl-ctrl-icon"><i class="fa-solid fa-map-location-dot"></i></div>`,
                "Google Maps",
                () => {
                    document.querySelectorAll(".offcanvas.show").forEach((openOffcanvasElement) => {
                        const openOffcanvasInstance = bootstrap.Offcanvas.getInstance(openOffcanvasElement);
                        if (openOffcanvasInstance) {
                            openOffcanvasInstance.hide();
                        }
                    });
                    var myModal = new mdb.Modal(document.getElementById("beforeSend"));
                    myModal.show();
                }
            );
            const layers = createButton("styles", '<i class="fa-solid fa-layer-group"></i>', "Cambiar Aspecto", () => {
                document.querySelectorAll(".offcanvas.show").forEach((openOffcanvasElement) => {
                    const openOffcanvasInstance = bootstrap.Offcanvas.getInstance(openOffcanvasElement);
                    if (openOffcanvasInstance) {
                        openOffcanvasInstance.hide();
                    }
                });
                const offcanvasElement = new bootstrap.Offcanvas(document.querySelector("#offcanvasBottom"));
                offcanvasElement.show();
            });
            const btnroute = createButton(
                "route",
                '<div class="mapboxgl-ctrl-icon" data-btn_closed="controlsRoute"><i class="fa-solid fa-route"></i></div>',
                "Como ir a..."
            );

            // Agregar botones al contenedor personalizado
            this._container.appendChild(linkmaps);
            this._container.appendChild(layers);
            this._container.appendChild(btnroute);

            if (mapElement.classList.contains("map_editing")) {
                const newBuild = createButton(
                    "newBuild",
                    `<i class="fa-solid fa-building-flag"></i>`,
                    "Crear Nuevo Edificio",
                    () => {
                        $("#btnDeletedPleace").hide();
                        $("[data-namePleace]").text("");

                        const offcanvasContent = document.getElementById("offcanvasContent");
                        if (formChanges) {
                            document.getElementById("imagen_actual").src = "/static/img/default_image.webp";
                            offcanvasContent.querySelector("#isNewEdif").value = "new";

                            const newUID = $("#uuid").data("new-uid");
                            $("#uuid").removeClass("active").val(newUID);
                            $("#namecolor").addClass("active").val("gray");
                            $("#colorPicker").addClass("active").val("#808080");
                            initPolygonDrawing();
                            $("#nombreEdificio").removeClass("active").val("");
                            $("#puertaCordsEdificio").removeClass("active").val("");

                            $("#esquina1").removeClass("active").val("");
                            $("#esquina2").removeClass("active").val("");
                            $("#esquina3").removeClass("active").val("");
                            $("#esquina4").removeClass("active").val("");

                            $('[for="fotoEdificio"]').html('Subir foto <i class="fa-regular fa-image ms-1"></i>');
                            $("#fotoEdificio").attr("required", true);
                            tinymce.get("textTiny").setContent("");

                            $("#ismarker").removeAttr("checked");
                            $("#sizemarkerdiv").slideUp();
                            $("[data-notmarker]").slideDown();
                            $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
                            $("#hidename").slideDown();
                            $("#btnOpenGalery").slideUp();
                        }

                        if (!offcanvasOpen) {
                            if (offcanvasElement.classList.contains("show")) {
                                offcanvasInstance.hide();
                            } else {
                                offcanvasInstance.show();
                            }
                        }
                    }
                );
                const OSMgo = createButton(
                    "OSMgo",
                    `<i class="fa-solid fa-book-atlas"></i>`,
                    "Editar en OpenStreetMaps",
                    () => {
                        const url = "https://www.openstreetmap.org/edit#map=17/25.55684/-100.93548";
                        window.open(url, "_blank", "noopener,noreferrer");
                    }
                );
                const importMap = createButton(
                    "importmap",
                    `<div class="mapboxgl-ctrl-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>`,
                    "Importar y Exportar",
                    () => {
                        var myModal = new mdb.Modal(document.getElementById("importInMap"));
                        myModal.show();
                    }
                );

                this._container.appendChild(importMap);
                this._container.appendChild(OSMgo);
                this._container.appendChild(newBuild);
            }

            return this._container;
        }
    }

    // Estilo guardado ########################################
    function updateLabelsAndInputs(varLayer) {
        if (varLayer) {
            labelsLayer.forEach((label) => label.classList.remove("btn_detail", "text-white", "cursor-not"));
            inputsLayer.forEach((input) => input.removeAttribute("disabled"));

            const label = document.querySelector(`label[for='${varLayer}']`);
            label.classList.add("btn_detail", "text-white", "cursor-not");

            const input = document.querySelector(`input#${varLayer}`);
            input.setAttribute("disabled", "disabled");

            colorlabels = "#000";
            if (varLayer === "dark-v11") {
                colorlabels = "#fff";
            }
            localStorage.setItem("mapbox-last_layer", varLayer);
        }
    }
    function setMapStyle(style) {
        mapMapbox.setStyle("mapbox://styles/mapbox/" + style);
    }
    if (savedLastLayerMap) {
        updateLabelsAndInputs(savedLastLayerMap);
        setMapStyle(savedLastLayerMap);
    }

    // Controles de Ruta
    const directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        unit: "metric",
        profile: "mapbox/walking",
        controls: {
            inputs: false,
            instructions: false,
            profileSwitcher: false,
        },
        alternatives: true,
        interactive: false,
    });

    // Cargar datos de lugares ##################################################################
    const dataPleaces = document.querySelector("#map").getAttribute("data-mapa_edif");
    fetch(dataPleaces)
        .then((response) => response.json())
        .then((data) => {
            const geojsonEdificios = {
                type: "FeatureCollection",
                features: data.map((item) => ({
                    type: "Feature",
                    properties: {
                        uuid: item.uuid,
                        color: item.color,
                        label: item.hidename ? item.nombre : "",
                        nombre: item.nombre,
                        door: item.door_coords,
                        ismarker: item.ismarker,
                        imagen_url: item.imagen_url,
                        informacion: item.informacion,
                        galery_count: item.galery_count,
                        galery_items: item.galery_items,
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [
                            [item.polygons[0], item.polygons[1], item.polygons[2], item.polygons[3], item.polygons[0]],
                        ],
                    },
                })),
            };

            function createEdificios() {
                if (!mapMapbox.getSource("places")) {
                    mapMapbox.addSource("places", {
                        type: "geojson",
                        data: geojsonEdificios,
                    });
                }

                if (!mapMapbox.getLayer("places-layer")) {
                    mapMapbox.addLayer({
                        id: "places-layer",
                        type: "fill",
                        source: "places",
                        paint: {
                            "fill-color": ["get", "color"],
                            "fill-opacity": 0.4,
                        },
                    });
                }

                // Agregar capa para las etiquetas
                if (!mapMapbox.getLayer("places-label")) {
                    mapMapbox.addLayer({
                        id: "places-label",
                        type: "symbol",
                        source: "places",
                        layout: {
                            "text-field": ["get", "label"],
                            "text-size": 12,
                            "text-offset": [0, -0.6],
                            "text-anchor": "top",
                        },
                        paint: {
                            "text-color": colorlabels,
                        },
                    });
                    mapMapbox.moveLayer("places-label");
                }
            }
            function createMarker(lngLat) {
                if (currentMarker) {
                    currentMarker.remove();
                }
                let savedColor = localStorage.getItem("data-color_rgb");
                currentMarker = new mapboxgl.Marker({
                    color: savedColor || "#3b71ca",
                    draggable: false,
                })
                    .setLngLat(lngLat)
                    .addTo(mapMapbox);
            }
            function calcularRuta() {
                const origen = selectOrigin.value;
                const destino = selectDestiny.value;

                if (origen && destino && origen !== destino) {
                    const origenFeature = geojsonEdificios.features.find(
                        (feature) => feature.properties.nombre === origen
                    );
                    const destiFeature = geojsonEdificios.features.find(
                        (feature) => feature.properties.nombre === destino
                    );

                    if (origenFeature && destiFeature) {
                        const origenCoords = origenFeature.properties.door;
                        const destinoCoords = destiFeature.properties.door;

                        directions.setOrigin(origenCoords);
                        directions.setDestination(destinoCoords);
                        $("#buttons_route").slideDown("slow");

                        directions.on("route", (e) => {
                            const routeGeoJSON = {
                                type: "FeatureCollection",
                                features: e.route.map((r) => ({
                                    type: "Feature",
                                    geometry: r.geometry,
                                    properties: {},
                                })),
                            };
                            currentRoute = routeGeoJSON;

                            const distance = e.route[0].distance / 1000;
                            const duration = e.route[0].duration / 60;
                            $("#route-info").html(
                                `<div class="row mb-2"><div class="col-1"><i class="fa-solid fa-shoe-prints me-1"></i></div><div class="col">Distancia: <strong>${distance.toFixed(
                                    2
                                )} km</strong></div></div><div class="row"><div class="col-1"><i class="fa-solid fa-hourglass-half me-1"></i></div><div class="col">Duración: <strong>${duration.toFixed(
                                    2
                                )} minutos aprox.</strong></div></div>`
                            );
                            $("#route-info").slideDown();
                        });

                        if (window.innerWidth <= 800) {
                            setTimeout(() => {
                                $("#controls_route").removeClass("show");
                            }, 4000);
                        }

                        mapMapbox.addControl(directions, "top-left");
                        mapMapbox.moveLayer("places-label");
                        addRouteLayer();
                    }
                } else {
                    alertSToast("center", 5000, "warning", "Por favor, selecciona tanto origen como destino.");
                }
            }
            function addRouteLayer() {
                if (currentRoute && currentRoute.features && currentRoute.features.length > 0) {
                    if (!mapMapbox.getSource("directions")) {
                        mapMapbox.addSource("directions", {
                            type: "geojson",
                            data: currentRoute,
                        });
                    }

                    const originFeature = currentRoute.features.find((feature) => feature.properties.id === "origin");
                    const destFeature = currentRoute.features.find(
                        (feature) => feature.properties.id === "destination"
                    );

                    // Agregar capa de línea de ruta
                    if (!mapMapbox.getLayer("directions-route-line")) {
                        mapMapbox.addLayer({
                            id: "directions-route-line",
                            type: "line",
                            source: "directions",
                            layout: {
                                "line-cap": "round",
                                "line-join": "round",
                            },
                            paint: {
                                "line-color": "#2d5f99",
                                "line-width": 12,
                            },
                            filter: ["==", "$type", "LineString"],
                        });
                    }

                    // Agregar capa de línea de ruta
                    if (!mapMapbox.getLayer("directions-route-line-alt")) {
                        mapMapbox.addLayer({
                            id: "directions-route-line-alt",
                            type: "line",
                            source: "directions",
                            layout: {
                                "line-cap": "round",
                                "line-join": "round",
                            },
                            paint: {
                                "line-color": "#4882c5",
                                "line-width": 6,
                            },
                            filter: ["==", "$type", "LineString"],
                        });
                    }

                    // Agregar capa de punto de origen
                    if (!mapMapbox.getLayer("directions-origin-point")) {
                        mapMapbox.addLayer({
                            id: "directions-origin-point",
                            type: "circle",
                            source: "directions",
                            paint: {
                                "circle-color": "#3bb2d0",
                                "circle-radius": 20,
                            },
                            filter: ["==", ["get", "id"], "origin"],
                        });
                    }

                    // Agregar capa de punto de destino
                    if (!mapMapbox.getLayer("directions-destination-point")) {
                        mapMapbox.addLayer({
                            id: "directions-destination-point",
                            type: "circle",
                            source: "directions",
                            paint: {
                                "circle-color": "#8a8bc9",
                                "circle-radius": 20,
                            },
                            filter: ["==", ["get", "id"], "destination"],
                        });
                    }

                    // Agregar etiqueta de punto de origen
                    if (!mapMapbox.getLayer("directions-origin-label")) {
                        console.log(originFeature.properties["marker-symbol"]);
                        mapMapbox.addLayer({
                            id: "directions-origin-label",
                            type: "symbol",
                            source: "directions",
                            layout: {
                                "text-field": originFeature.properties["marker-symbol"],
                                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                                "text-size": 18,
                            },
                            paint: {
                                "text-color": "#fff",
                            },
                            filter: ["==", ["get", "id"], "origin"],
                        });
                    }

                    // Agregar etiqueta de punto de destino
                    if (!mapMapbox.getLayer("directions-destination-label")) {
                        mapMapbox.addLayer({
                            id: "directions-destination-label",
                            type: "symbol",
                            source: "directions",
                            layout: {
                                "text-field": destFeature.properties["marker-symbol"],
                                "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
                                "text-size": 18,
                            },
                            paint: {
                                "text-color": "#fff",
                            },
                            filter: ["==", ["get", "id"], "destination"],
                        });
                    }

                    mapMapbox.moveLayer("places-label");
                }
            }
            function saveRouteLayers() {
                if (mapMapbox.getSource("directions")) {
                    currentRoute = mapMapbox.getSource("directions")._data;
                }
            }

            mapMapbox.on("load", function () {
                createEdificios();
            });
            mapMapbox.on("style.load", function () {
                createEdificios();
                addRouteLayer();
            });

            if (mapElement.classList.contains("map_user")) {
                mapMapbox.on("click", function (e) {
                    const lngLat = e.lngLat;
                    createMarker(lngLat);
                });
            }

            // Abrir offcanvas: Informacion del edificio
            mapMapbox.on("click", "places-layer", (e) => {
                const feature = e.features[0];
                const { nombre, informacion, imagen_url, galery_count, galery_items } = feature.properties;
                const { coordinates } = feature.geometry;
                let galeryObj = JSON.parse(galery_items);

                const offcanvasContent = document.getElementById("offcanvasContent");
                document.getElementById("imagen_actual").src = `/media/${imagen_url}`;

                if (mapElement.classList.contains("map_user")) {
                    document.getElementById("lateralTitle").innerText = nombre;
                    offcanvasContent.innerHTML = `<div class="feature-info"><p>${informacion}</p></div>`;

                    
                    const imageGaleryCont = document.getElementById("offcanvasGalery");
                    imageGaleryCont.innerHTML = '';

                    galeryObj.forEach((item) => {
                        const imageGalery = `<img loading="lazy" src="${item.imagen}" id="img_${item.id}" class="img-fluid img-rounded unfocus-4 none">`;
                        imageGaleryCont.insertAdjacentHTML("beforeend", imageGalery);
                        const thisItem = $(`#img_${item.id}`)

                        setTimeout(() => {
                            thisItem.slideDown();
                            setTimeout(() => {
                                thisItem.removeClass('unfocus-4');
                            }, (item.id)*40);
                        }, (item.id)*20);
                    });

                } else if (mapElement.classList.contains("map_editing")) {
                    const { color, door, uuid, ismarker, label } = feature.properties;

                    if ($("#ismarker").is(":checked")) {
                        $("#sizemarkerdiv").slideUp();
                        $("[data-notmarker]").slideDown();
                        $('[for="puertaCordsEdificio"]').text("Punto de entrada:");
                    }
                    $("#btnDeletedPleace").show();
                    $("#btnOpenGalery").slideDown();
                    $("[data-namePleace]").text(nombre);
                    $("#galeryCount").text(galery_count);
                    $("#isNewEdif").val("notnew");

                    if (ismarker) {
                        $("#ismarker").attr("checked", "checked");
                    } else {
                        $("#ismarker").removeAttr("checked");
                    }

                    $("#hidename").slideDown();
                    if (label != "") {
                        $("#hidename").attr("checked", "checked");
                    } else {
                        $("#hidename").removeAttr("checked");
                    }

                    $("[data-uuid]").addClass("active").val(uuid);
                    $("#nombreEdificio").addClass("active").val(nombre);
                    $(".name_pleace").text(nombre);
                    $("#namecolor").addClass("active").val(color);

                    const numeros = door.slice(1, -1).split(",");
                    $("#puertaCordsEdificio").addClass("active").val(`${numeros[0]},${numeros[1]}`);

                    $("#esquina1").addClass("active").val(coordinates[0][0]);
                    $("#esquina2").addClass("active").val(coordinates[0][1]);
                    $("#esquina3").addClass("active").val(coordinates[0][2]);
                    $("#esquina4").addClass("active").val(coordinates[0][3]);

                    $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
                    $("#fotoEdificio").attr("required", false);
                    tinymce.get("textTiny").setContent(informacion);
                    setColorInput();

                    // Galeria #############################################
                    if (window.innerWidth <= 800) {
                        setTimeout(() => {
                            var canvasGalery = document.getElementById("pleaceGalery");
                            var bsOffcanvasGalery = bootstrap.Offcanvas.getInstance(canvasGalery);
                            if (bsOffcanvasGalery) {
                                bsOffcanvasGalery.hide();
                            }
                        }, 100);
                    }

                    const imageListGalery = document.getElementById("image-list-galery");
                    const deleteImgUrl = imageListGalery.getAttribute('data-galery-del');
                    document.getElementById("image-list").innerHTML = '';
                    imageListGalery.innerHTML = '';

                    galeryObj.forEach((item) => {
                        const imgFile = item.imagen;
                        let imgName = imgFile.replace("/media/imagenes/", "");
                        imgName = imgName.split(".");

                        const imageItemGalery = `<div id="img_galery_${item.id}" class="image-item"><img loading="lazy" src="${imgFile}" class="img-rounded unfocus-5"><div class="fs-8"><p class="name-file m-0">${imgName[0]}</p><p class="size-file m-0">(${imgName[1]}) ${formatBytes(item.img_size)}</p></div><form action="${deleteImgUrl}" method="post" autocomplete="off" data-submit-galery><input type="hidden" name="id" value="${item.id}"><input type="hidden" name="uuid" value="${uuid}"><button type="submit" id="btnDelImg_${item.id}" class="btn btn-danger btn-floating"><i class="fa-regular fa-trash-can tscale-1-4"></i></button></form></div>`;
                        imageListGalery.insertAdjacentHTML("beforeend", imageItemGalery);
                        
                        const thisItem = document.querySelector(`#img_galery_${item.id}`)
                        const thisItemImg = document.querySelector(`#img_galery_${item.id} img`)
                        const delGaleryButton = document.querySelector(`#btnDelImg_${item.id}`);

                        setTimeout(() => {
                            thisItem.classList.add('visible')
                            setTimeout(() => {
                                thisItemImg.classList.remove('unfocus-5')
                            }, (item.id)*40);
                        }, (item.id)*20);

                        delGaleryButton.addEventListener('click', ()=>{
                            thisItem.classList.remove('visible');
                            setTimeout(() => {
                                thisItem.remove();
                            }, 1000);
                        })
                    });
                    $("[data-submit-galery]").submit(jsonSubmit);
                }

                offcanvasInstance.show();
                offcanvasOpen = true;
            });

            inputsLayer.forEach((input) => {
                input.addEventListener("click", function (layer) {
                    const layerId = layer.target.id;
                    updateLabelsAndInputs(layerId);
                    saveRouteLayers();

                    setMapStyle(layerId);
                });
            });
            const nombresEdificios = geojsonEdificios.features.map((feature) => feature.properties.nombre).sort();
            nombresEdificios.forEach((nombre) => {
                const option = new Option(nombre, nombre);
                document.getElementById("origen").add(option);
                document.getElementById("destino").add(option.cloneNode(true));
            });

            selectOrigin.addEventListener("change", function () {
                const seleccionOrigen = this.value;
                selectDestiny.querySelectorAll("option").forEach((option) => {
                    if (option.value === seleccionOrigen) {
                        option.disabled = true;
                    } else {
                        option.disabled = false;
                    }
                });

                if (document.getElementById("destino").value) {
                    calcularRuta();
                }
            });
            selectDestiny.addEventListener("change", function () {
                const seleccionDestino = this.value;
                selectOrigin.querySelectorAll("option").forEach((option) => {
                    if (option.value === seleccionDestino) {
                        option.disabled = true;
                    } else {
                        option.disabled = false;
                    }
                });

                if (document.getElementById("origen").value) {
                    calcularRuta();
                }
            });

            document.querySelector("[data-reset_form]").addEventListener("click", function () {
                formRoute.querySelectorAll("option").forEach((option) => {
                    option.disabled = false;
                });

                // Verificar si las capas de la ruta existen y removerlas
                const routeLayers = [
                    "directions-route-line",
                    "directions-route-line-alt",
                    "directions-route-line-casing",
                    "directions-hover-point-casing",
                    "directions-hover-point",
                    "directions-waypoint-point-casing",
                    "directions-waypoint-point",
                    "directions-origin-point",
                    "directions-origin-label",
                    "directions-destination-point",
                    "directions-destination-label",
                ];
                routeLayers.forEach((layer) => {
                    if (mapMapbox.getLayer(layer)) {
                        mapMapbox.removeLayer(layer);
                    }
                });

                // Verificar si la fuente de la ruta existe y removerla
                if (mapMapbox.getSource("directions")) {
                    mapMapbox.removeSource("directions");
                }

                $("#buttons_route").slideUp("slow");
                $("#route-info").slideUp("slow", () => {
                    $("#route-info").empty();
                });
            });
        })
        .catch((error) => {
            console.error("Error al obtener lugares del mapa:");
            console.error(error);
            alertSToast("top", 5000, "error", "Ocurrio un error inesperado. #403");
        });

    // Cargar datos de Marcadores ####################
    const dataMarkers = document.querySelector("#map").getAttribute("data-mapa_markers");
    fetch(dataMarkers)
        .then((response) => response.json())
        .then((data) => {
            function createMarkers() {
                data.forEach((item) => {
                    const nameImage = item.nombre.replace(" ", "");

                    if (!mapMapbox.getSource(item.uuid)) {
                        mapMapbox.addSource(item.uuid, {
                            type: "geojson",
                            data: {
                                type: "FeatureCollection",
                                features: [
                                    {
                                        type: "Feature",
                                        properties: {
                                            uuid: item.uuid,
                                            nombre: item.nombre,
                                            imagen: item.imagen,
                                            ismarker: item.ismarker,
                                            icon_size: item.icon_size,
                                            sizemarker: item.sizemarker,
                                            edges: [[item.edges[0], item.edges[1], item.edges[2], item.edges[3]]],
                                        },
                                        geometry: {
                                            type: "Point",
                                            coordinates: item.door_coords,
                                        },
                                    },
                                ],
                            },
                        });
                    }

                    if (!mapMapbox.hasImage(nameImage)) {
                        mapMapbox.loadImage(item.imagen, (error, image) => {
                            if (error) throw error;
                            mapMapbox.addImage(nameImage, image);
                        });
                    }

                    if (!mapMapbox.getLayer(`points${nameImage}`)) {
                        mapMapbox.addLayer({
                            id: `points${nameImage}`,
                            type: "symbol",
                            source: item.uuid,
                            layout: {
                                "icon-image": nameImage,
                                "icon-size": item.icon_size,
                                "icon-allow-overlap": true,
                            },
                        });
                        // mapMapbox.moveLayer("places-label", `points${nameImage}`);
                    }
                });
            }
            mapMapbox.on("load", () => {
                createMarkers();
            });
            mapMapbox.on("style.load", () => {
                createMarkers();
            });
            mapMapbox.on("click", (e) => {
                if (mapElement.classList.contains("map_editing")) {
                    const features = mapMapbox.queryRenderedFeatures(e.point, {
                        layers: data.map((item) => `points${item.nombre.replace(" ", "")}`),
                    });

                    if (features.length) {
                        const feature = features[0];
                        const { nombre, imagen, uuid, ismarker, icon_size, edges } = feature.properties;
                        const coordinates = feature.geometry.coordinates.slice();

                        if (mapElement.classList.contains("map_editing")) {
                            const offcanvasContent = document.getElementById("offcanvasContent");
                            document.getElementById("imagen_actual").src = imagen;

                            $("#btnDeletedPleace").show();
                            $("[data-namePleace]").text(nombre);

                            offcanvasContent.querySelector("#isNewEdif").value = "notnew";

                            if (ismarker) {
                                $("#ismarker").attr("checked", "checked");
                                $("#sizemarkerdiv").slideDown("fast");
                                $("[data-notmarker]").slideUp();
                                $('[for="puertaCordsEdificio"]').text("Ubicacion:");
                            } else {
                                $("#ismarker").removeAttr("checked");
                            }

                            $("#hidename").slideUp();
                            $("[data-uuid]").addClass("active").val(uuid);
                            $("#nombreEdificio").addClass("active").val(nombre);
                            $("#sizemarker").addClass("active").val(icon_size);
                            $("#puertaCordsEdificio").addClass("active").val(`${coordinates}`);

                            $('[for="fotoEdificio"]').html('Cambiar foto <i class="fa-regular fa-image ms-1"></i>');
                            $("#fotoEdificio").attr("required", false);

                            $("#esquina1").addClass("active").val(edges[0]);
                            $("#esquina2").addClass("active").val(edges[1]);
                            $("#esquina3").addClass("active").val(edges[2]);
                            $("#esquina4").addClass("active").val(edges[3]);

                            var canvasGalery = document.getElementById("pleaceGalery");
                            var bsOffcanvasGalery = bootstrap.Offcanvas.getInstance(canvasGalery);
                            if (bsOffcanvasGalery) {
                                bsOffcanvasGalery.hide();
                            }
                        }

                        offcanvasInstance.show();
                        offcanvasOpen = true;
                    }
                }
            });
        })
        .catch((error) => {
            console.error("Error al obtener Marcadores del mapa:");
            console.error(error);
            alertSToast("top", 5000, "error", "Ocurrio un error inesperado. #403");
        });

    // Agregar nuevo menu
    mapMapbox.addControl(new CustomControl(), "top-right");

    // Cursor segun el evento ###########################################
    mapMapbox.getCanvas().style.cursor = "default";
    function setCursor(cursorStyle) {
        mapMapbox.getCanvas().style.cursor = cursorStyle;
    }

    mapMapbox.on("dragstart", () => setCursor("move"));
    mapMapbox.on("dragend", () => setCursor("default"));
    mapMapbox.on("mousedown", () => setCursor("pointer"));
    mapMapbox.on("mouseup", () => setCursor("default"));
    mapMapbox.on("mouseover", () => setCursor("default"));
});

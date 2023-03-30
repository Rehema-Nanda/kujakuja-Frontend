import React from "react";
import ReactGA from "react-ga";
import ReactMapboxGl, {
    Layer, Feature, Popup, ZoomControl, Marker,
} from "react-mapbox-gl";
import i18n from "i18next";
import axios from "axios";
import bbox from "@turf/bbox";
import { multiPolygon } from "@turf/helpers";
import _ from "lodash";
import PropTypes from "prop-types";
import moment from "moment";
import data from "./tempdata.json";
import GlobalFilter from "../globalfilter/GlobalFilter";
import MapDataPanel from "./MapDataPanel";
import MarkerSpiderify from "./MarkerSpiderify";
import "./MapPage.css";
import { AuthContext } from "../../AuthContext";
import { getDefinedParams, getQueryParamsFromUrl } from "../../helpers";

const Map = ReactMapboxGl({
    accessToken: "pk.eyJ1IjoiYmFycnlsYWNoYXBlbGxlIiwiYSI6ImNrd2R3ZmR4aTUxZmoyb3BhOTM3anQ5ZTYifQ.0tpdg1loc-d1eHewHdL-CQ",
});

const fillPaint = {
    "fill-color": "#171D21",
    "fill-opacity": 0.1,
};

const { CancelToken } = axios;
let source = CancelToken.source();

export default class MapPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            // data panel state
            dataPanelSatisfaction: "100",
            dataPanelDelta: "0.0",
            dataPanelSelectedLocations: ["-"],
            dataPanelDailyBreakdowns: [],
            dataPanelThemeBubbles: data,

            // map state
            mapCenter: [37.46337, 3.05275],
            mapZoom: [3],
            mapBounds: [[20.91796875, 15.45368022], [15.45368022, -5.747174]],
            mapFenceIsShowing: false,
            mapDrawFence: [],
            mapMarkers: [],
            popupIsShowing: false,
            popupCoords: [0.0, 0.0],
            popupText: "",
        };

        this.initializeReactGA();

        this.getServicePoint = this.getServicePoint.bind(this);
        this.getServicePointsForLocation = this.getServicePointsForLocation.bind(this);
        this.getAggregatesData = this.getAggregatesData.bind(this);
        this.getThemeBubblesData = this.getThemeBubblesData.bind(this);
        this.setSearchResult = this.setSearchResult.bind(this);
        this.newSelectedCountryOrLocation = this.newSelectedCountryOrLocation.bind(this);
        this.zoomMapToSelected = this.zoomMapToSelected.bind(this);
        this.changeMarkersForSelected = this.changeMarkersForSelected.bind(this);
        this.setZoom = this.setZoom.bind(this);
    }

    ////////////////////////////////////////
    // lifecycle methods
    ////////////////////////////////////////

    async componentDidMount() {
        const queryParams = getQueryParamsFromUrl();
        const { updateFilterState } = this.props;

        if (Object.entries(queryParams).length > 0) {
            const updateFilterStateRes = updateFilterState(queryParams); // update global filter state

            // if state was NOT updated, this is a user visiting the page containing default query params
            // in this case, retrieve map data
            if (!updateFilterStateRes) {
                await this.refreshData();
            }
        }
        else {
            await this.refreshData();
            this.pushHistoryIfRequired();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        const {
            refreshData, dateStart, dateEnd, selectedCountries, selectedServicePoints,
            selectedLocations, selectedServiceTypes, location, updateFilterState,
        } = this.props;
        const { mapMarkers } = this.state;

        if (
            refreshData && (
                dateStart !== prevProps.dateStart
                || dateEnd !== prevProps.dateEnd
                || selectedCountries !== prevProps.selectedCountries
                || selectedLocations !== prevProps.selectedLocations
                || selectedServicePoints !== prevProps.selectedServicePoints
                || selectedServiceTypes !== prevProps.selectedServiceTypes
                || location.search !== prevProps.location.search
            )
        ) {
            if (location.search !== prevProps.location.search) {
                const queryParams = getQueryParamsFromUrl();
                if (Object.entries(queryParams).length > 0) {
                    updateFilterState(queryParams); // update global filter state
                }
            }
            else {
                await this.refreshData();
                this.pushHistoryIfRequired();
            }
        }
        else if (prevState.mapMarkers !== mapMarkers && selectedServicePoints.length !== 0) {
            this.spiderifyPoints(selectedServicePoints[0], "ServicePoints");
        }
    }

    ////////////////////////////////////////
    // component methods
    ////////////////////////////////////////

    getMapMarkerClassForCountryOrLocation = (satisfaction) => {
        if (typeof satisfaction !== "number" || satisfaction === 0) {
            return "marker-country-nodata";
        }

        if (satisfaction < 50) {
            return "marker-country-red";
        }

        return "marker-country-green";
    };

    getMapMarkerClassForServiceType = (serviceType, satisfaction) => {
        const noSpaceLowerCaseServiceType = (serviceType).replace(/ /g, "").toLowerCase();
        const icons = [
            "groupactivities", "healthcare", "nutrition", "protection", "communitypulse", "shelter", "water",
        ];
        const icon = icons.includes(noSpaceLowerCaseServiceType) ? noSpaceLowerCaseServiceType : "generic";

        if (typeof satisfaction !== "number" || satisfaction === 0) {
            return `marker-${icon}-nodata`;
        }

        if (satisfaction < 50) {
            return `marker-${icon}-red`;
        }

        return `marker-${icon}-green`;
    };

    changeMarkersForSelected = async (type, selectedIds) => {
        let mapMarkers = [];
        const { allCountries, allLocations } = this.props;

        if (type === "World") {
            const allCountriesSatisfactionPromises = allCountries.map((country) => {
                return this.getSatisfaction(country.id, "Country");
            });
            const allCountriesSatisfactionResults = await Promise.all(allCountriesSatisfactionPromises);

            for (let i = 0; i < allCountries.length; i++) {
                const tmpCountry = { ...allCountries[i] };
                tmpCountry.type = "Countries";

                const satisfaction = allCountriesSatisfactionResults[i];
                tmpCountry.marker_class = this.getMapMarkerClassForCountryOrLocation(satisfaction);
                mapMarkers.push(tmpCountry);
            }

            this.setState({
                mapMarkers: mapMarkers,
                mapFenceIsShowing: false,
            });
        }
        else if (type === "Country") {
            const selectedCountriesLocationsSatisfactionPromises = allLocations.filter((location) => {
                return selectedIds.includes(location.country_id);
            }).map(async (location) => {
                const satisfaction = await this.getSatisfaction(location.id, "Locations");
                return {
                    [location.id]: satisfaction,
                };
            });
            const selectedCountriesLocationsSatisfactionResults = await Promise.all(
                selectedCountriesLocationsSatisfactionPromises,
            );
            // merge the array of objects into a single object
            const selectedCountriesLocationsSatisfactionMap = Object.assign(
                {}, ...selectedCountriesLocationsSatisfactionResults,
            );

            allLocations.forEach((location) => {
                const tmpLocation = { ...location };
                tmpLocation.marker_class = "marker-country-unselected";
                tmpLocation.type = "Locations";

                if (selectedIds.includes(tmpLocation.country_id)) {
                    const satisfaction = selectedCountriesLocationsSatisfactionMap[tmpLocation.id];
                    tmpLocation.marker_class = this.getMapMarkerClassForCountryOrLocation(satisfaction);
                }

                mapMarkers.push(tmpLocation);
            });

            mapMarkers.sort((a, b) => {
                return parseFloat(b.lat) - parseFloat(a.lat);
            });

            this.setState({
                mapMarkers: mapMarkers,
            });
        }
        else if (type === "Locations") {
            if (selectedIds.length !== 1) {
                mapMarkers = allLocations.map((location) => {
                    return { ...location, marker_class: "marker-country-unselected", type: "Locations" };
                });
            }
            else {
                const servicePoints = await this.getServicePointsForLocation(selectedIds[0]);
                const servicePointsSatisfactionPromises = servicePoints.data.map((servicePoint) => {
                    return this.getSatisfaction(servicePoint.id, "ServicePoints");
                });
                const servicePointsSatisfactionResults = await Promise.all(servicePointsSatisfactionPromises);

                for (let i = 0; i < servicePoints.data.length; i++) {
                    const tmpServicePoint = { ...servicePoints.data[i] };
                    tmpServicePoint.type = "ServicePoints";

                    const satisfaction = servicePointsSatisfactionResults[i];
                    tmpServicePoint.marker_class = this.getMapMarkerClassForServiceType(
                        tmpServicePoint.service_type_name, satisfaction,
                    );
                    mapMarkers.push(tmpServicePoint);
                }
            }

            mapMarkers.sort((a, b) => {
                return parseFloat(b.lat) - parseFloat(a.lat);
            });

            this.setState({
                mapMarkers: mapMarkers,
            });
        }
    };

    // TODO: remove magic strings for the types - this is a big exercise as these are used across multiple components
    newSelectedCountryOrLocation = async () => {
        const {
            selectedCountries, selectedLocations, selectedServicePoints, allLocations, allCountries,
        } = this.props;

        if (selectedCountries.length === 0 && selectedLocations.length === 0 && selectedServicePoints.length === 0) {
            // no country, location or service point selected
            const geoJsonArray = allCountries.map((country) => {
                return country.geojson;
            }).filter((geojson) => {
                return !_.isEmpty(geojson);
            });
            this.zoomMapToSelected(geoJsonArray, false);
            this.changeMarkersForSelected("World");
            return;
        }

        if (selectedCountries.length !== 0) {
            // one or more countries selected
            const geoJsonArray = selectedCountries.map((selectedCountryId) => {
                const selectedCountry = allCountries.filter((country) => {
                    return country.id === selectedCountryId;
                });
                return selectedCountry[0].geojson;
            }).filter((geojson) => {
                return !_.isEmpty(geojson);
            });
            this.zoomMapToSelected(geoJsonArray);
            this.changeMarkersForSelected("Country", selectedCountries);
            return;
        }

        if (selectedLocations.length !== 0) {
            // one or more locations selected
            const geoJsonArray = selectedLocations.map((selectedLocationId) => {
                const selectedLocation = allLocations.filter((location) => {
                    return location.id === selectedLocationId;
                });
                return selectedLocation[0].geojson;
            }).filter((geojson) => {
                return !_.isEmpty(geojson);
            });
            this.zoomMapToSelected(geoJsonArray);
            this.changeMarkersForSelected("Locations", selectedLocations);
            return;
        }

        if (selectedServicePoints.length !== 0) {
            // service point selected (currently you can't select more than one)
            // find the associated location, then proceed with the same logic (see above) as if the location was
            // selected directly
            const selectedServicePoint = await this.getServicePoint(selectedServicePoints[0]);
            const selectedLocationId = selectedServicePoint.data[0].settlement_id;
            const selectedLocation = allLocations.filter((location) => {
                return location.id === selectedLocationId;
            });
            const geoJsonArray = [selectedLocation[0].geojson].filter((geojson) => {
                return !_.isEmpty(geojson);
            });
            this.zoomMapToSelected(geoJsonArray);
            this.changeMarkersForSelected("Locations", [selectedLocationId]);
        }
    };

    hideMarkerPopup = () => {
        this.setState({
            popupIsShowing: false,
        });
    };

    showMarkerPopup = (coords, text) => {
        this.setState({
            popupIsShowing: true,
            popupCoords: coords,
            popupText: text,
        });
    };

    initializeReactGA = () => {
        ReactGA.initialize("UA-108978484-3");
        ReactGA.pageview(window.location.pathname);
    };

    // pushes a new entry onto the history stack if the current URL is not already in sync
    pushHistoryIfRequired = () => {
        const {
            dateStart, dateEnd, selectedCountries, selectedLocations,
            selectedServicePoints, selectedServiceTypes, location, history,
        } = this.props;

        const historyParams = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEnd.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            points: selectedServicePoints,
            types: selectedServiceTypes,
        };

        const definedParams = getDefinedParams(historyParams);
        const query = new URLSearchParams(definedParams);
        if (query.toString() !== location.search.substr(1)) {
            history.push({ search: `?${query}` });
        }
    };

    refreshData = async () => {
        source.cancel("Operation canceled by the user.");
        source = CancelToken.source(); // create a new signal so that we don't also abort the request we're about to start

        await this.getThemeBubblesData();
        await this.newSelectedCountryOrLocation();
        await this.getAggregatesData();
    };

    zoomMapToSelected = (geoJsonArray, showFence = true) => {
        if (geoJsonArray.length === 0) {
            return;
        }

        const allPolygons = [];

        geoJsonArray.forEach((geoJson) => {
            if (_.isEmpty(geoJson.geometry)) {
                console.warn("geojson does not define geometry, skipping"); // eslint-disable-line no-console
            }
            else {
                switch (geoJson.geometry.type) {
                    case "Polygon":
                        allPolygons.push(geoJson.geometry.coordinates);
                        break;
                    case "MultiPolygon":
                        // add each polygon of the multi-polygon to the array individually
                        geoJson.geometry.coordinates.forEach((polygon) => {
                            allPolygons.push(polygon);
                        });
                        break;
                    default:
                        // eslint-disable-next-line no-console
                        console.warn(`unhandled geometry type '${geoJson.geometry.type}', skipping`);
                        break;
                }
            }
        });

        const multiPolygons = multiPolygon(allPolygons);

        // get bounding box
        const multiplePolygonBbox = bbox(multiPolygons);

        // zoom
        this.setState({
            mapFenceIsShowing: showFence,
            mapBounds: [
                [
                    multiplePolygonBbox[0], multiplePolygonBbox[1],
                ],
                [
                    multiplePolygonBbox[2], multiplePolygonBbox[3],
                ],
            ],
            mapDrawFence: allPolygons,
        });
    };

    zoomMapToPoint = (lng, lat) => {
        const { mapZoom } = this.state;
        let currentZoom = mapZoom;
        if (currentZoom < 13) {
            currentZoom = [13];
        }

        this.setState({
            mapCenter: [lng, lat],
            mapZoom: currentZoom,
            mapFenceIsShowing: false,
        });
    };

    setZoom = (evt) => {
        const { mapZoom } = this.state;
        if (Math.abs(mapZoom[0] - evt.style.z) > 0.5) {
            this.setState({
                mapZoom: [evt.style.z],
            });
        }
    };

    getServicePoint = async (id) => {
        const { makeHttpCall } = this.context;
        const response = await makeHttpCall(`service_points/${id}`, undefined, { cancelToken: source.token });
        return response.data;
    };

    getServicePointsForLocation = async (id) => {
        const { makeHttpCall } = this.context;
        const response = await makeHttpCall(`service_points/location/${id}`, undefined, { cancelToken: source.token });
        return response.data;
    };

    getAggregatesData = async () => {
        const {
            dateStart, dateEndForExclusiveQuery, selectedCountries,
            selectedLocations, allCountries, allLocations, selectedServicePoints, selectedServiceTypes,
        } = this.props;
        const { makeHttpCall } = this.context;

        const params = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEndForExclusiveQuery.format("YYYY-MM-DD"),
        };

        const dataPanelSelectedLocations = [];

        if (selectedCountries.length !== 0) {
            params.countries = selectedCountries;
            selectedCountries.forEach((selectedCountryId) => {
                const obj = this.filterIt(allCountries, selectedCountryId);
                dataPanelSelectedLocations.push(obj[0].name);
            });
        }

        if (selectedLocations.length !== 0) {
            params.settlements = selectedLocations;
            selectedLocations.forEach((selectedLocationId) => {
                const obj = this.filterIt(allLocations, selectedLocationId);
                dataPanelSelectedLocations.push(obj[0].name);
            });
        }

        if (selectedServicePoints.length !== 0) {
            params.points = selectedServicePoints;

            const servicePointPromises = selectedServicePoints.map((selectedServicePointId) => {
                return this.getServicePoint(selectedServicePointId);
            });
            const servicePointResults = await Promise.all(servicePointPromises);

            selectedServicePoints.forEach((selectedServicePointId, index) => {
                const servicePoint = servicePointResults[index];
                dataPanelSelectedLocations.push(servicePoint.data[0].name);
            });
        }

        if (selectedServiceTypes.length !== 0) {
            params.types = selectedServiceTypes;
        }

        if (dataPanelSelectedLocations.length === 0) {
            dataPanelSelectedLocations.push(i18n.t("datamap.dataMapPanelName"));
        }

        const responsesPromises = [
            makeHttpCall("aggregate/responses", "post", { cancelToken: source.token, data: params }),
            makeHttpCall("aggregate/responses/details", "post", { cancelToken: source.token, data: params }),
        ];
        const responsesResults = await Promise.all(responsesPromises);
        const responses = responsesResults[0];
        const responseDetails = responsesResults[1];

        const dataPanelDailyBreakdowns = Object.keys(responseDetails.data.data).map((key) => {
            const dateSplit = responseDetails.data.data[key].date.split("-");
            return {
                pourcent: responseDetails.data.data[key].pourcent.toFixed(1),
                delta: responseDetails.data.data[key].delta.toFixed(1),
                date: `${dateSplit[1]}/${dateSplit[2]}`,
            };
        });
        const satisfaction = responses.data.pourcent1 !== null
            ? responses.data.pourcent1.toFixed(1) : null;

        this.setState({
            dataPanelSelectedLocations: dataPanelSelectedLocations,
            dataPanelSatisfaction: satisfaction,
            dataPanelDelta: responses.data.delta.toFixed(1),
            dataPanelDailyBreakdowns: dataPanelDailyBreakdowns,
        });
    };

    getSatisfaction = async (id, type) => {
        const { dateStart, dateEndForExclusiveQuery, selectedServiceTypes } = this.props;
        const { makeHttpCall } = this.context;

        const params = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            countries: [],
            settlements: [],
            points: [],
            types: selectedServiceTypes,
        };

        if (type === "Country") {
            params.countries.push(id);
        }
        else if (type === "Locations") {
            params.settlements.push(id);
        }
        else if (type === "ServicePoints") {
            params.points.push(id);
        }

        const response = await makeHttpCall("aggregate/responses", "post", { cancelToken: source.token, data: params });
        const { pourcent1 } = response.data;
        const satisfaction = pourcent1 === null ? null : parseFloat(pourcent1.toFixed(1));
        return satisfaction;
    };

    getThemeBubblesData = async () => {
        const {
            dateStart, dateEndForExclusiveQuery, selectedServiceTypes, selectedCountries,
            selectedLocations, selectedServicePoints,
        } = this.props;
        const { makeHttpCall } = this.context;

        const params = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            points: selectedServicePoints,
            types: selectedServiceTypes,
        };

        const response = await makeHttpCall("themes", "post", { cancelToken: source.token, data: params });
        const respData = response.data.themes;

        if (respData.children.length > 0) {
            this.setState({
                dataPanelThemeBubbles: respData,
            });
        }
    };

    filterIt = (arr, searchKey) => {
        return arr.filter((obj) => {
            return obj.id === searchKey;
        });
    };

    setSearchResult = async (id, type) => {
        const selectedType = `all${type}`;
        const { selectLocation } = this.props;

        if (type === "ServicePoints") {
            const servicePoint = await this.getServicePoint(id);
            selectLocation(servicePoint.data[0].id, type, true);
        }
        else {
            // eslint-disable-next-line react/destructuring-assignment
            const obj = this.filterIt(this.props[selectedType], id);
            selectLocation(obj[0].id, type, true);
        }
    };

    onMarkerClick = async (marker) => {
        const { selectLocation } = this.props;

        this.hideMarkerPopup();
        ReactGA.event({
            category: window.location.pathname,
            action: "Clicked on Marker",
        });
        selectLocation(marker.id, marker.type, true);
    };

    spiderifyPoints(markerId, markerType) {
        const { mapZoom, mapMarkers } = this.state;

        // only applicable for service point markers
        if (markerType !== "ServicePoints") {
            return;
        }

        // instantiate spiderify JS logic
        const markerSpiderify = new MarkerSpiderify(mapZoom[0]);

        // get selected marker object from state
        const selectedMarker = mapMarkers.find((marker) => {
            return parseInt(marker.id, 10) === parseInt(markerId, 10);
        });

        // retrieve array of markers that are 10 metres or less from the selected marker
        const nearbyMarkers = mapMarkers
            .filter((marker) => {
                return marker.type === "ServicePoints"
                    && parseInt(marker.id, 10) !== parseInt(markerId, 10);
            })
            .map((marker) => {
                // eslint-disable-next-line no-param-reassign
                marker.distance = markerSpiderify.distanceBetweenCoordinatesInKm(
                    marker.lat, marker.lng, selectedMarker.lat, selectedMarker.lng,
                );
                return marker;
            })
            .filter((marker) => {
                return marker.distance <= 0.01;
            });
        // return if nothing found
        if (!nearbyMarkers.length) {
            return;
        }

        // fan out nearby markers concentrically around selected marker
        const latLngConstellation = markerSpiderify.findCoordinates(
            parseFloat(selectedMarker.lat),
            parseFloat(selectedMarker.lng),
            markerSpiderify.setPointDistanceBasedOnZoom(),
            nearbyMarkers.length,
        );

        // update the positions of the markers to be moved
        nearbyMarkers.forEach((marker, index) => {
            /* eslint-disable no-param-reassign */
            marker.lat = latLngConstellation[index].lat.toString();
            marker.lng = latLngConstellation[index].lng.toString();
            /* eslint-enable no-param-reassign */
        });

        this.forceUpdate();
    }

    render() {
        const {
            allCountries, serviceTypes, selectedCountries, allLocations, dateStart, dateEnd,
            selectedLocations, selectLocation, setDateStartEnd, toggleServiceType,
            selectedServiceTypes, selectedServicePoints, servicePoints,
        } = this.props;

        const {
            dataPanelSatisfaction, dataPanelDelta, dataPanelSelectedLocations,
            dataPanelThemeBubbles, dataPanelDailyBreakdowns, mapCenter, mapZoom,
            mapBounds, mapFenceIsShowing, mapDrawFence, mapMarkers, popupIsShowing, popupText, popupCoords,
        } = this.state;

        return (
            <div>
                <GlobalFilter
                    setSearchResult={this.setSearchResult}
                    allCountries={allCountries}
                    serviceTypes={serviceTypes}
                    servicePoints={servicePoints}
                    selectedCountries={selectedCountries}
                    allLocations={allLocations}
                    selectedLocations={selectedLocations}
                    selectLocation={selectLocation}
                    selectedServicePoints={selectedServicePoints}
                    displayFilterSearchCountries
                    displayFilterSearchLocations
                    displayFilterSearchServicePoints
                    dateStart={dateStart}
                    dateEnd={dateEnd}
                    setDateStartEnd={setDateStartEnd}
                    toggleServiceType={toggleServiceType}
                    selectedServiceTypes={selectedServiceTypes}
                    searchPlaceholder={i18n.t("globalHeader.placeSearch")}
                    allowMultipleServicePointSelect={false}
                />

                <MapDataPanel
                    dataPanelSatisfaction={dataPanelSatisfaction}
                    dataPanelDelta={dataPanelDelta}
                    dataPanelSelectedLocations={dataPanelSelectedLocations}
                    dataPanelDailyBreakdowns={dataPanelDailyBreakdowns}
                    dataPanelThemeBubbles={dataPanelThemeBubbles}
                    selectedLocations={selectedLocations}
                    selectedServicePoints={selectedServicePoints}
                />

                <Map
                    // eslint-disable-next-line react/style-prop-object
                    style="mapbox://styles/barrylachapelle/cjlwoyk4e3skr2smu4fl2xrjv"
                    className="mapboxMap"
                    center={mapCenter}
                    zoom={mapZoom}
                    fitBounds={mapBounds}
                    fitBoundsOptions={{ padding: 110 }}
                    onZoomEnd={(evt) => {
                        this.setZoom(evt);
                    }}
                >
                    {mapFenceIsShowing && mapDrawFence
                        .map((fence, index) => {
                            return (
                                <Layer key={index} type="fill" paint={fillPaint}>
                                    <Feature coordinates={fence} />
                                </Layer>
                            );
                        })}

                    {mapMarkers
                        .map((marker) => {
                            return (
                                <Marker
                                    key={`${marker.type}${marker.id}`}
                                    coordinates={[marker.lng, marker.lat]}
                                    anchor="bottom"
                                    onMouseEnter={() => {
                                        return this.showMarkerPopup([marker.lng, marker.lat], marker.name);
                                    }}
                                    onMouseLeave={() => {
                                        return this.hideMarkerPopup();
                                    }}
                                    onClick={() => {
                                        this.onMarkerClick(marker);
                                    }}
                                    className={marker.marker_class}
                                />
                            );
                        })}

                    {popupIsShowing
                    && (
                        <Popup key={1} offset={[0, -42]} className="marker-popup" coordinates={popupCoords}>
                            <div>{popupText}</div>
                        </Popup>
                    )}

                    <ZoomControl position="bottom-left" />
                </Map>

            </div>
        );
    }
}

MapPage.contextType = AuthContext;

MapPage.propTypes = {
    updateFilterState: PropTypes.func.isRequired,
    setDateStartEnd: PropTypes.func.isRequired,
    toggleServiceType: PropTypes.func.isRequired,
    refreshData: PropTypes.bool.isRequired,
    selectLocation: PropTypes.func.isRequired,
    dateStart: PropTypes.instanceOf(moment).isRequired,
    dateEnd: PropTypes.instanceOf(moment).isRequired,
    dateEndForExclusiveQuery: PropTypes.instanceOf(moment).isRequired,
    selectedCountries: PropTypes.arrayOf(PropTypes.string),
    selectedLocations: PropTypes.arrayOf(PropTypes.string),
    selectedServiceTypes: PropTypes.arrayOf(PropTypes.string),
    selectedServicePoints: PropTypes.arrayOf(PropTypes.string),
    allCountries: PropTypes.arrayOf(PropTypes.object),
    allLocations: PropTypes.arrayOf(PropTypes.object),
    serviceTypes: PropTypes.arrayOf(PropTypes.object),
    servicePoints: PropTypes.arrayOf(PropTypes.object),
    /* eslint-disable react/forbid-prop-types */
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    /* eslint-enable react/forbid-prop-types */
};

MapPage.defaultProps = {
    selectedCountries: [],
    selectedLocations: [],
    selectedServiceTypes: [],
    selectedServicePoints: [],
    allCountries: [],
    serviceTypes: [],
    allLocations: [],
    servicePoints: [],
};

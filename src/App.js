import React from "react";
import {
    BrowserRouter, Redirect, Route, Switch,
} from "react-router-dom";
import ReactGA from "react-ga";
import circle from "@turf/circle";
import _ from "lodash";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
    faAppleAlt, faArrowDown, faArrowLeft, faArrowRight, faArrowUp, faCaretDown, faCaretRight, faChartLine,
    faFilter, faHeart, faHome, faSearch, faShieldAlt, faThumbsUp, faTint, faCaretUp,
} from "@fortawesome/free-solid-svg-icons";
import * as moment from "moment";
import "moment/locale/es";
import "moment/locale/sw";
import "moment/locale/ru";
import "moment/locale/uk";
import "moment/locale/ar";
import i18n from "i18next";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es, enGB } from "date-fns/esm/locale";

import GlobalHeader from "./components/GlobalHeader";
import MapPage from "./components/datamap/MapPage";
import IdeaFeedPage from "./components/ideafeed/IdeaFeedPage";
import SnapshotsPage from "./components/snapshots/SnapshotsPage";
import GoldStarStoriesPage from "./components/goldstarstories/GoldStarStoriesPage";
import AboutUsPage from "./components/aboutus/AboutUsPage";
import PrivacyPolicyPage from "./components/privacypolicy/PrivacyPolicyPage";
import NoPage from "./components/no_page/NoPage";
import Login from "./components/login/Login";
import { AuthContext } from "./AuthContext";
import Loading from "./components/Loading";
import AppConfig from "./AppConfig";
import { remapQueryParamsToGlobalFilterStateVariableNames, getGlobalFilterParams } from "./helpers";
import DataStudioGraphPage from "./components/datastudio_graphs/DataStudioGraphPage";
import ActionFeedPage from "./components/actionfeed/ActionFeedPage";
import ActionForm from "./components/actionfeed/ActionForm";

library.add(
    faArrowRight, faArrowLeft, faArrowUp, faArrowDown, faCaretDown, faCaretRight, faSearch, faFilter,
    faTint, faHeart, faAppleAlt, faHome, faShieldAlt, faChartLine, faThumbsUp, faCaretUp,
);
registerLocale("es", es);
registerLocale("en", enGB);

class App extends React.Component {
    constructor(props) {
        super(props);

        const today = moment.utc().startOf("day");

        this.state = {
            allCountries: [],
            allLocations: [],
            serviceTypes: [],
            servicePoints: [],
            selectedToggle: false,
            selectedCountries: [],
            selectedLocations: [],
            selectedServiceTypes: [],
            selectedServicePoints: [],
            dateStart: today.clone().subtract(7, "days"),
            dateEnd: today,
            refreshData: false, // TODO: refactor GlobalFilter refreshData pattern
            language: i18n.language,
        };

        this.selectLocation = this.selectLocation.bind(this);
        this.toggleServiceType = this.toggleServiceType.bind(this);
        this.setDateStartEnd = this.setDateStartEnd.bind(this);
        this.getDateEndForExclusiveQuery = this.getDateEndForExclusiveQuery.bind(this);
        this.getCountriesAndLocationsAndServiceTypes = this.getCountriesAndLocationsAndServiceTypes.bind(this);
    }

    ////////////////////////////////////////
    // lifecycle methods
    ////////////////////////////////////////

    async componentDidMount() {
        // this flag ensures that we don't fetch countries and locations when login is required
        // see componentDidUpdate, where we toggle this flag based on the value from the context
        this.isAuthenticated = false;
        const { language } = this.state;
        const newUrl = this.generateUrlWhenLanguageChanges(language);
        moment.locale(language);
        setDefaultLocale(language);
        const { location: { href } } = window;
        if (!href.match(/\/en\//g) && !href.match(/\/es\//g) && !href.match(/\/sw\//g) && !href.match(/\/ru\//g)  && !href.match(/\/uk\//g) && !href.match(/\/ar\//g) && !href.match(/\/login\?/g)) {
            window.location.assign(newUrl);
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        const { refreshData } = this.state;
        const { getToken, isAuthenticated } = this.context;
        if (refreshData && prevState.refreshData !== refreshData) {
            await this.getCountriesAndLocationsAndServiceTypes();
        }
        if (isAuthenticated && this.isAuthenticated !== isAuthenticated) {
            this.isAuthenticated = true;
            await this.getCountriesAndLocationsAndServiceTypes();
        }
        else if (AppConfig.LOGIN_REQUIRED && !window.location.href.includes("login")) {
            await getToken(false); // getToken will redirect to the login page if necessary
        }
    }

    ////////////////////////////////////////
    // fetch methods
    ////////////////////////////////////////

    upperCaseNameSort = (a, b) => {
        if (a.name.toUpperCase() < b.name.toUpperCase()) {
            return -1;
        }
        else if (a.name.toUpperCase() > b.name.toUpperCase()) {
            return 1;
        }
        return 0;
    };

    getCountriesAndLocationsAndServiceTypes = async () => {
        const { makeHttpCall } = this.context;

        // retrieve countries
        const enabledCountriesResponse = await makeHttpCall("countries/enabled");
        const countries = enabledCountriesResponse.data.data.map((country) => {
            if (country.geojson && country.geojson.geometry.type === "LineString") {
                const tmpArr = [];
                tmpArr[0] = country.geojson.geometry.coordinates;
                country.geojson.geometry.coordinates = tmpArr; // eslint-disable-line no-param-reassign
                country.geojson.geometry.type = "Polygon"; // eslint-disable-line no-param-reassign
            }
            return country;
        });
        countries.sort(this.upperCaseNameSort);

        // retrieve locations
        const enabledLocationsResponse = await makeHttpCall("locations/enabled");
        const locationData = enabledLocationsResponse.data.data.map((location) => {
            if (typeof location.geojson === "string") {
                location.geojson = JSON.parse(location.geojson); // eslint-disable-line no-param-reassign
            }
            // if no geodata draw a 40k circle around geocoords
            if (_.isEmpty(location.geojson)
                || location.geojson.geometry.coordinates === undefined
                || location.geojson.geometry.coordinates.length === 0
            ) {
                const locationCenter = [parseFloat(location.lng), parseFloat(location.lat)];
                const locationRadius = 5;
                const locationOptions = { steps: 40, units: "kilometers" };
                location.geojson = circle(locationCenter, locationRadius, locationOptions); // eslint-disable-line no-param-reassign
            }
            return location;
        });
        locationData.sort(this.upperCaseNameSort);

        // retrieve service types
        const serviceTypeData = await makeHttpCall("service_types");
        const serviceTypes = [...serviceTypeData.data.data];

        // retrieve service points
        const servicePointsData = await makeHttpCall("service_points");
        const servicePoints = [...servicePointsData.data.data];

        this.setState({
            allCountries: countries,
            allLocations: locationData,
            serviceTypes: serviceTypes,
            servicePoints: servicePoints,
            refreshData: true,
        });
    };


    ////////////////////////////////////////
    //  set state methods
    ////////////////////////////////////////

    // called by child components (MapPage, IdeaFeedPage, SnapshotsPage)
    // to update the filter state based on URL query params
    updateFilterState = (queryParams) => {
        const {
            selectedCountries, selectedLocations, selectedServiceTypes, selectedServicePoints, dateStart, dateEnd,
        } = this.state;

        const mappedParams = remapQueryParamsToGlobalFilterStateVariableNames(queryParams);
        const globalFilterParams = getGlobalFilterParams(mappedParams);

        // merge the default state with whatever state variables are present in the URL query params
        // this ensures that any state not present in the URL query params is reset
        // dateStart & dateEnd should always be present
        const defaultFilterState = {
            selectedCountries: [],
            selectedLocations: [],
            selectedServiceTypes: [],
            selectedServicePoints: [],
            refreshData: true,
        };
        const finalState = { ...defaultFilterState, ...globalFilterParams };

        // only update state if we need to
        if (!_.isEqual(selectedCountries, finalState.selectedCountries)
            || !_.isEqual(selectedLocations, finalState.selectedLocations)
            || !_.isEqual(selectedServiceTypes, finalState.selectedServiceTypes)
            || !_.isEqual(selectedServicePoints, finalState.selectedServicePoints)
            || !dateStart.isSame(finalState.dateStart)
            || !dateEnd.isSame(finalState.dateEnd)
        ) {
            this.setState(finalState);
            return true;
        }
        return false;
    };

    selectLocation = (id, type, clear = false, refreshData = true, allowMultipleServicePointSelect = true) => {
        ReactGA.event({ category: window.location.pathname, action: `${type} - ${id}` });

        const selectedType = `selected${type}`;
        let previousState = [];

        if (clear) {
            this.setState({
                selectedCountries: [],
                selectedLocations: [],
                selectedServicePoints: [],
            });
            previousState.push(id);
        }
        else if (!allowMultipleServicePointSelect && type === "ServicePoints") {
            // empty the previous state
            previousState.splice(0, previousState.length);
            previousState.push(id);
        }
        else {
            previousState = [].concat(this.state[selectedType]); // eslint-disable-line react/destructuring-assignment
            if (previousState.indexOf(id) === -1) {
                // push id
                previousState.push(id);
            }
            else {
                // remove id
                const index = previousState.indexOf(id);
                previousState.splice(index, 1);
            }
        }

        if (type === "Countries") {
            this.setState({
                selectedCountries: previousState,
                selectedLocations: [],
                selectedServicePoints: [],
                refreshData: refreshData,
            });
        }
        else if (type === "Locations") {
            this.setState({
                selectedCountries: [],
                selectedLocations: previousState,
                selectedServicePoints: [],
                refreshData: refreshData,
            });
        }
        else if (type === "ServicePoints") {
            this.setState({
                selectedCountries: [],
                selectedLocations: [],
                selectedServicePoints: previousState,
                refreshData: refreshData,
            });
        }
    };

    toggleServiceType = (serviceTypeId) => {
        const { selectedServiceTypes } = this.state;

        ReactGA.event({ category: window.location.pathname, action: `Toggle Service - ${serviceTypeId}` });

        if (selectedServiceTypes.indexOf(serviceTypeId) === -1) {
            // push id
            this.setState((prevState) => {
                return {
                    selectedServiceTypes: [...prevState.selectedServiceTypes, serviceTypeId],
                    refreshData: true,
                };
            });
        }
        else {
            // remove id
            const array = [...selectedServiceTypes];
            const index = array.indexOf(serviceTypeId);
            array.splice(index, 1);
            this.setState({
                selectedServiceTypes: array,
                refreshData: true,
            });
        }
    };

    setDateStartEnd = (startDate, endDate, refreshData = true) => {
        const { dateEnd, dateStart } = this.state;
        let startDateToSet = startDate.clone();
        let endDateToSet = endDate.clone();

        ReactGA.event({ category: window.location.pathname, action: "New Start/End selected" });

        // TODO: Review this in light of the changes that were made to the date picker since this was added in 383cd8.
        //       We should be able to remove this block entirely, but may want to replace it with something similar
        //       to handle end < start, especially for the mobile date picker (see how custom date ranges are handled
        //       in GlobalFilterCalendarContainer).
        if (endDateToSet.isSameOrBefore(startDateToSet, "day")) {
            if (endDateToSet !== dateEnd) {
                // the end date is being changed, set the start date appropriately
                startDateToSet = endDateToSet.clone();
            }
            else if (startDateToSet !== dateStart) {
                // the start date is being changed, set the end date appropriately
                endDateToSet = startDateToSet.clone();
            }
        }

        if (refreshData === null) {
            this.setState({
                dateStart: startDateToSet,
                dateEnd: endDateToSet,
            });
        }
        else {
            this.setState({
                dateStart: startDateToSet,
                dateEnd: endDateToSet,
                refreshData: refreshData,
            });
        }
    };

    ////////////////////////////////////////
    //  render methods
    ////////////////////////////////////////

    getDateEndForExclusiveQuery = (dateEnd) => dateEnd.clone().add(1, "days").startOf("day");

    changeLanguage = (event) => {
        const { value } = event.target;
        this.setState({ language: value });
        const newUrl = this.generateUrlWhenLanguageChanges(value);
        moment.locale(value);
        setDefaultLocale(value);
        window.location.assign(newUrl);
        i18n.changeLanguage(value);
    }

    generateUrlWhenLanguageChanges = (lang) => {
        const urlPath = window.location.pathname;
        const pathsArray = urlPath.split("/");
        // eslint-disable-next-line no-unused-vars
        const [firstIndex, secondIndex, ...requiredPathNames] = pathsArray;
        const newUrl = `/${lang}/${requiredPathNames}${window.location.search}`;
        return newUrl;
    }

    render() {
        const {
            allCountries, allLocations, serviceTypes, selectedCountries, selectedLocations, selectedServiceTypes,
            selectedServicePoints, dateEnd, dateStart, mapCenter, locationGeoCoords, polygonBorder, mapZoom,
            refreshData, language, servicePoints,
        } = this.state;
        const { isLoading } = this.context;

        return (
            <div className="app">
                <BrowserRouter basename={`/${language}`}>
                    <div>
                        <GlobalHeader changeLanguage={this.changeLanguage} selectedLanguage={language} />
                        <Switch>
                            <Route
                                exact
                                path="/login"
                                render={() => <Login />}
                            />
                            <Route
                                exact
                                path="/actionfeed"
                                render={({ location, history }) => (
                                    allCountries.length && allLocations.length
                                    && (
                                        <ActionFeedPage
                                            location={location}
                                            history={history}
                                            allCountries={allCountries}
                                            allLocations={allLocations}
                                            serviceTypes={serviceTypes}
                                            servicePoints={servicePoints}
                                            selectedCountries={selectedCountries}
                                            selectedLocations={selectedLocations}
                                            selectedServiceTypes={selectedServiceTypes}
                                            selectedServicePoints={selectedServicePoints}
                                            selectLocation={this.selectLocation}
                                            toggleServiceType={this.toggleServiceType}
                                            setDateStartEnd={this.setDateStartEnd}
                                            dateStart={dateStart}
                                            dateEnd={dateEnd}
                                            dateEndForExclusiveQuery={this.getDateEndForExclusiveQuery(dateEnd)}
                                            refreshData={refreshData}
                                            updateFilterState={this.updateFilterState}
                                        />
                                    ))}
                            />

                            <Route
                                exact
                                path="/"
                                render={() => <Redirect to={AppConfig.DATA_STUDIO_GRAPH_URL ? "/graph" : "/ideafeed"} />}
                            />

                            <Route
                                exact
                                path="/datamap"
                                render={({ location, history }) => (
                                    allCountries.length && allLocations.length && serviceTypes.length
                                        && (
                                            <MapPage
                                                location={location}
                                                history={history}
                                                allCountries={allCountries}
                                                allLocations={allLocations}
                                                serviceTypes={serviceTypes}
                                                servicePoints={servicePoints}
                                                selectedCountries={selectedCountries}
                                                selectedLocations={selectedLocations}
                                                selectedServiceTypes={selectedServiceTypes}
                                                selectedServicePoints={selectedServicePoints}
                                                selectLocation={this.selectLocation}
                                                toggleServiceType={this.toggleServiceType}
                                                setDateStartEnd={this.setDateStartEnd}
                                                dateStart={dateStart}
                                                dateEnd={dateEnd}
                                                dateEndForExclusiveQuery={this.getDateEndForExclusiveQuery(dateEnd)}
                                                mapCenter={mapCenter}
                                                locationGeoCoords={locationGeoCoords}
                                                polygonBorder={polygonBorder}
                                                mapZoom={mapZoom}
                                                refreshData={refreshData}
                                                updateFilterState={this.updateFilterState}
                                            />
                                        )
                                )}
                            />

                            <Route
                                exact
                                path="/ideafeed"
                                render={({ location, history }) => (
                                    allCountries.length && allLocations.length
                                    && (
                                        <IdeaFeedPage
                                            location={location}
                                            history={history}
                                            allCountries={allCountries}
                                            allLocations={allLocations}
                                            serviceTypes={serviceTypes}
                                            servicePoints={servicePoints}
                                            selectedCountries={selectedCountries}
                                            selectedLocations={selectedLocations}
                                            selectedServiceTypes={selectedServiceTypes}
                                            selectedServicePoints={selectedServicePoints}
                                            selectLocation={this.selectLocation}
                                            toggleServiceType={this.toggleServiceType}
                                            setDateStartEnd={this.setDateStartEnd}
                                            dateStart={dateStart}
                                            dateEnd={dateEnd}
                                            dateEndForExclusiveQuery={this.getDateEndForExclusiveQuery(dateEnd)}
                                            refreshData={refreshData}
                                            updateFilterState={this.updateFilterState}
                                        />
                                    ))}
                            />

                            <Route
                                exact
                                path="/snapshots"
                                render={({ location, history }) => (
                                    <SnapshotsPage
                                        location={location}
                                        history={history}
                                        allCountries={allCountries}
                                        allLocations={allLocations}
                                        serviceTypes={serviceTypes}
                                        selectedCountries={selectedCountries}
                                        selectedLocations={selectedLocations}
                                        selectedServiceTypes={selectedServiceTypes}
                                        selectedServicePoints={selectedServicePoints}
                                        selectLocation={this.selectLocation}
                                        toggleServiceType={this.toggleServiceType}
                                        setDateStartEnd={this.setDateStartEnd}
                                        dateStart={dateStart}
                                        dateEnd={dateEnd}
                                        dateEndForExclusiveQuery={this.getDateEndForExclusiveQuery(dateEnd)}
                                        refreshData={refreshData}
                                        updateFilterState={this.updateFilterState}
                                    />
                                )}
                            />

                            <Route
                                exact
                                path="/actionform"
                                render={({ location, history }) => (
                                    <ActionForm
                                        location={location}
                                        history={history}
                                        allCountries={allCountries}
                                        allLocations={allLocations}
                                        serviceTypes={serviceTypes}
                                    />
                                )}
                            />

                            <Route exact path="/goldstarstories" component={GoldStarStoriesPage} />

                            <Route exact path="/aboutus" component={AboutUsPage} />

                            <Route exact path="/graph" component={DataStudioGraphPage} />

                            <Route exact path="/privacypolicy" component={PrivacyPolicyPage} />
                            
                            {/* <Route exact path="/actionform" component={ActionForm} /> */}

                            <Route render={({ history }) => (<NoPage history={history} />)} />
                        </Switch>
                    </div>
                </BrowserRouter>

                {isLoading && <Loading />}

            </div>
        );
    }
}
App.contextType = AuthContext;

export default App;

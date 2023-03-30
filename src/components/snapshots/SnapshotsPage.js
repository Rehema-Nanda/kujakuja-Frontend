import React from "react";
import ReactGA from "react-ga";
import { Col, Container, Row } from "reactstrap";
import i18n from "i18next";

import axios from "axios";
import { debounce } from "lodash";
import domtoimage from "dom-to-image";
import moment from "moment";
import GlobalFilter from "../globalfilter/GlobalFilter";

import GlobalFooter from "../GlobalFooter";
import SnapshotCard from "./SnapshotCard";
import "./Snapshots.css";
import "./pie-wrapper.css";

import { AuthContext } from "../../AuthContext";
import { getDefinedParams, getQueryParamsFromUrl } from "../../helpers";

const { CancelToken } = axios;
let source = CancelToken.source();

export default class SnapshotsPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            snapshots: null,
        };

        ReactGA.initialize("UA-108978484-3");
        ReactGA.pageview(window.location.pathname);
    }

    componentDidMount = async () => {
        const queryParams = getQueryParamsFromUrl();
        this.setMomentLocale();

        if (Object.entries(queryParams).length > 0) {
            const updateFilterStateRes = this.props.updateFilterState(queryParams); // update global filter state

            // if state was NOT updated, this is a user visiting the page containing default query params
            // in this case, retrieve snapshots
            if (!updateFilterStateRes) {
                await this.getSnapshotsDebounced();
            }
        }
        else {
            // if no query params, default snapshot dates to **yesterday**
            const yesterday = moment.utc().startOf("day").subtract(1, "days");
            this.props.setDateStartEnd(yesterday, yesterday);
        }
    };

    componentDidUpdate = async (prevProps) => {
        if (
            this.props.refreshData && (
                this.props.dateStart !== prevProps.dateStart
                || this.props.dateEnd !== prevProps.dateEnd
                || this.props.selectedCountries !== prevProps.selectedCountries
                || this.props.selectedLocations !== prevProps.selectedLocations
                || this.props.selectedServiceTypes !== prevProps.selectedServiceTypes
                || this.props.location.search !== prevProps.location.search
            )
        ) {
            if (this.props.location.search !== prevProps.location.search) {
                const queryParams = getQueryParamsFromUrl();
                if (Object.entries(queryParams).length > 0) {
                    this.props.updateFilterState(queryParams); // update global filter state
                }
            }
            else {
                await this.getSnapshotsDebounced();
            }
        }
    };

    componentWillUnmount() {
        this.getSnapshotsDebounced.cancel();
        source.cancel("Operation canceled by the user.");
    }

    setMomentLocale() {
        const { location: { href } } = window;

        if (href.match(/\/en\//g)) {
            moment.locale('en');
        }
        else if (href.match(/\/es\//g)) {
            moment.locale('es');
        }
        else if (href.match(/\/sw\//g)) {
            moment.locale('sw');
        }
        else {
            moment.locale('en');
        }
    }

    // pushes a new entry onto the history stack if the current URL is not already in sync
    pushHistoryIfRequired = () => {
        const historyParams = {
            start: this.props.dateStart.format("YYYY-MM-DD"),
            end: this.props.dateEnd.format("YYYY-MM-DD"),
            countries: this.props.selectedCountries,
            settlements: this.props.selectedLocations,
            service_types: this.props.selectedServiceTypes,
        };

        const definedParams = getDefinedParams(historyParams);
        const query = new URLSearchParams(definedParams);
        if (query.toString() !== this.props.location.search.substr(1)) {
            this.props.history.push({ search: `?${query}` });
        }
    };

    getSnapshotsDebounced = debounce(async () => {
        await this.getSnapshots();
        this.pushHistoryIfRequired();
    }, 600);

    getSnapshots = async () => {
        source.cancel("Operation canceled by the user.");
        source = CancelToken.source(); // create a new signal so that we don't also abort the request we're about to start

        // clear snapshots
        this.setState({
            snapshots: null,
        });

        // prepare params for POST
        const params = {
            start: this.props.dateStart.format("YYYY-MM-DD"),
            end: this.props.dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            countries: this.props.selectedCountries,
            settlements: this.props.selectedLocations,
            service_types: this.props.selectedServiceTypes,
        };

        // retrieve snapshots data from API
        const settlementStats = await this.context.makeHttpCall(`snapshots`, "post", { cancelToken: source.token, data: params });
        const snapshots = settlementStats.data.data;

        // retrieve service-types for all settlements
        params.settlements = snapshots.map((snapshot) => {
            return parseInt(snapshot.region.id, 10);
        });
        const serviceTypeStats = await this.context.makeHttpCall("snapshots/service_types", "post", { cancelToken: source.token, data: params });
        const serviceTypes = serviceTypeStats.data.data;

        for (const settlementId in serviceTypes) {
            serviceTypes[settlementId] = serviceTypes[settlementId].sort((a, b) => (b.responses - a.responses));
        }

        // loop through payload and assign service-type array to each snapshot
        for (const settlementId in serviceTypes) {
            const snapshot = snapshots.find((ss) => {
                return parseInt(ss.region.id, 10) === parseInt(settlementId, 10);
            });
            if (snapshot) {
                snapshot.serviceTypes = serviceTypes[settlementId] || [];
            }
        }

        this.setState({
            snapshots: snapshots,
        });
    };

    isSingleDaySnapshot() {
        return this.props.dateStart.diff(this.props.dateEnd, "days") === 0;
    }

    setSearchResult = async (dataSetId, dataSetType) => {
        this.props.selectLocation(dataSetId, dataSetType, false);
    };

    async downloadSnapshotCard(id, name) {
        try {
            const dataUrl = await domtoimage.toPng(document.getElementById(id));
            const link = document.createElement("a");
            link.download = `${name}.png`;
            link.href = dataUrl;
            link.dispatchEvent(new MouseEvent("click"));
        }
        catch (e) {
            console.error("Something went wrong!", e);
        }
    }

    getServicePoints = async (snapshot) => {
        // prepare params for POST
        const params = {
            start: this.props.dateStart.format("YYYY-MM-DD"),
            end: this.props.dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            service_types: this.props.selectedServiceTypes || null,
            countries: this.props.selectedCountries || null,
            settlements: [snapshot.region.id],
        };

        const servicePointStats = await this.context.makeHttpCall("snapshots/service_points", "post", { cancelToken: source.token, data: params });
        snapshot.servicePoints = servicePointStats.data.data[snapshot.region.id];

        return snapshot;
    };

    render() {
        const { snapshots } = this.state;
        const {
            allCountries, serviceTypes, selectedCountries, allLocations, selectedLocations,
            selectLocation, dateStart, dateEnd, setDateStartEnd, toggleServiceType, selectedServiceTypes,
        } = this.props;

        return (
            <div className="snapshots-page">
                <div className="title-background-parent">
                    <div className="title-background-shape" />
                </div>

                <Container>
                    <Row>
                        <Col sm={{ size: 8 }}>
                            <div className="snapshots-page-title">
                                <h1 className="left">{i18n.t("snapshots.title")}</h1>
                                <p>{i18n.t("snapshots.description")}</p>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <Row>
                        <Col>
                            <GlobalFilter
                                setSearchResult={this.setSearchResult}
                                allCountries={allCountries}
                                serviceTypes={serviceTypes}
                                selectedCountries={selectedCountries}
                                allLocations={allLocations}
                                selectedLocations={selectedLocations}
                                selectLocation={selectLocation}
                                dateStart={dateStart}
                                dateEnd={dateEnd}
                                setDateStartEnd={setDateStartEnd}
                                toggleServiceType={toggleServiceType}
                                selectedServiceTypes={selectedServiceTypes}
                                displayFilterSearchCountries
                                displayFilterSearchLocations
                                displayFilterSearchServicePoints={false}
                                searchPlaceholder={i18n.t("globalHeader.placeSearch")}
                            />
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <div className="snapshots-page-bg">
                        <div className="container">
                            <div className="row d-flex justify-content-start cards-parent">
                                {snapshots && snapshots.length ? snapshots.map((snapshot) => {
                                    return (
                                        <SnapshotCard
                                            key={snapshot.region.id.toString()}
                                            snapshot={snapshot}
                                            singleDay={this.isSingleDaySnapshot()}
                                            dateStart={dateStart}
                                            dateEnd={dateEnd}
                                            downloadSnapshotCard={this.downloadSnapshotCard}
                                            getServicePoints={this.getServicePoints}
                                        />
                                    );
                                }) : snapshots !== null && (
                                    <h3 className="snapshots-header-title">
                                        {i18n.t("snapshots.snapshotHeaderTitle")}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>
                </Container>

                <GlobalFooter />
            </div>
        );
    }
}
SnapshotsPage.contextType = AuthContext;

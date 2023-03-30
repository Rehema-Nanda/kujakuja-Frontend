import React from "react";
import ReactGA from "react-ga";
import {
    Col, Container, Pagination, PaginationItem, PaginationLink, Row,
} from "reactstrap";

import axios from "axios";
import i18n from "i18next";
import PropTypes from "prop-types";
import moment from "moment";

import GlobalFooter from "../GlobalFooter";
import GlobalFilter from "../globalfilter/GlobalFilter";
import IdeaCard from "./IdeaCard";
import TopKeywordsCard from "./TopKeywordsCard";
import SatisfactionStatsCard from "./SatisfactionStatsCard";

import "./IdeaFeed.css";
import "../snapshots/pie-wrapper.css";
import { AuthContext } from "../../AuthContext";
import { getDefinedParams, getQueryParamsFromUrl } from "../../helpers";
import AppConfig from "../../AppConfig";

const { CancelToken } = axios;
let source = CancelToken.source();

export default class IdeaFeedPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ideas: [],
            ideasCount: 0,
            ideasLimit: 50,
            ideasPage: 1,
            ideaSearchString: "",
            satisfiedIdeaCount: 0,
        };

        this.changePage = this.changePage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.nextPage = this.nextPage.bind(this);
        this.getResultsString = this.getResultsString.bind(this);
        this.getPaginationContent = this.getPaginationContent.bind(this);

        this.initializeReactGA();
    }

    async componentDidMount() {
        const { updateFilterState } = this.props;

        const queryParams = getQueryParamsFromUrl();

        if (Object.entries(queryParams).length > 0) {
            const updateFilterStateRes = updateFilterState(queryParams); // update global filter state
            const updateLocalStateRes = this.updateLocalStateFromQueryParams(queryParams); // update local state

            // if state was NOT updated, this is a user visiting the page containing default query params
            // in this case, retrieve ideas
            if (!updateFilterStateRes && !updateLocalStateRes) {
                await this.getIdeas();
            }
        }
        else {
            await this.getIdeas();
            this.pushHistoryIfRequired();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        const {
            refreshData, dateStart, dateEnd, selectedCountries, selectedLocations, selectedServiceTypes, location,
            updateFilterState,
        } = this.props;

        const { ideasPage, ideaSearchString } = this.state;

        if (
            (refreshData && (
                dateStart !== prevProps.dateStart
                || dateEnd !== prevProps.dateEnd
                || selectedCountries !== prevProps.selectedCountries
                || selectedLocations !== prevProps.selectedLocations
                || selectedServiceTypes !== prevProps.selectedServiceTypes
                || location.search !== prevProps.location.search
            ))
            || ideasPage !== prevState.ideasPage
            || ideaSearchString !== prevState.ideaSearchString
        ) {
            if (location.search !== prevProps.location.search) {
                // the URL query string will change when:
                // 1. the user navigates using the back/forward buttons in the browser
                //    - in this case we update the global filter state as well as local state and then rely on the fact
                //      that this function will be called again (because updateLocalStateFromQueryParams calls setState)
                //      and take the 'else' path
                // 2. a new entry is pushed onto the history stack
                //    - in this case state should already be up to date and the update functions won't do anything
                const queryParams = getQueryParamsFromUrl();
                if (Object.entries(queryParams).length > 0) {
                    updateFilterState(queryParams); // update global filter state
                    this.updateLocalStateFromQueryParams(queryParams); // update local state
                }
            }
            else {
                // if something has changed *other* than the page number, we are not paginating
                // therefore reset page number to 1
                if (ideasPage === prevState.ideasPage) {
                    this.setState({
                        ideasPage: 1,
                    });
                }

                await this.getIdeas();
                this.pushHistoryIfRequired();
            }
        }
    }

    componentWillUnmount() {
        source.cancel("Operation canceled by the user.");
    }

    initializeReactGA = () => {
        ReactGA.initialize("UA-108978484-3");
        ReactGA.pageview(window.location.pathname);
    };

    updateLocalStateFromQueryParams = (queryParams) => {
        const mappedParams = this.remapQueryParamsToLocalStateVariableNamesAndTypes(queryParams);
        const ideaFeedParams = this.getIdeaFeedParams(mappedParams);
        const { ideasPage, ideasLimit, ideaSearchString } = this.state;

        // merge the default state with whatever state variables are present in the URL query params
        // this ensures that any state not present in the URL query params is reset
        const defaultState = {
            ideasPage: 1,
            ideasLimit: 50,
            ideaSearchString: "",
        };
        const finalState = { ...defaultState, ...ideaFeedParams };

        // only update state if we need to
        if (ideasPage !== finalState.ideasPage
            || ideasLimit !== finalState.ideasLimit
            || ideaSearchString !== finalState.ideaSearchString
        ) {
            this.setState(finalState);
            return true;
        }

        return false;
    };

    // returns a new object, which excludes any params that are not relevant to this component
    getIdeaFeedParams = (params) => {
        const ideaFeedParamsKeys = ["ideasPage", "ideasLimit", "ideaSearchString"];

        return Object.fromEntries(
            Object.entries(params).filter((p) => {
                return ideaFeedParamsKeys.includes(p[0]);
            }),
        );
    };

    remapQueryParamsToLocalStateVariableNamesAndTypes = (queryParams) => {
        // this function renames query param names, the top-level keys, to the equivalent state variable names, the "name" properties
        // also casts the query param values to the given type
        const map = {
            page: {
                name: "ideasPage",
                type: Number,
            },
            limit: {
                name: "ideasLimit",
                type: Number,
            },
            keyword: {
                name: "ideaSearchString",
                type: String,
            },
        };

        // avoid mutating queryParams, create a copy
        const mappedParams = { ...queryParams };

        for (const entry of Object.entries(map)) {
            if (mappedParams.hasOwnProperty(entry[0])) {
                if (Array.isArray(mappedParams[entry[0]])) {
                    // getQueryParamsFromUrl always returns digit params as an array, but the 'ideasPage' and
                    // 'ideasLimit' params are expected to be scalar values, so we convert them here
                    mappedParams[entry[1].name] = entry[1].type(mappedParams[entry[0]][0]);
                }
                else {
                    mappedParams[entry[1].name] = entry[1].type(mappedParams[entry[0]]);
                }
                delete mappedParams[entry[0]];
            }
        }

        return mappedParams;
    };

    // pushes a new entry onto the history stack if the current URL is not already in sync
    pushHistoryIfRequired = () => {
        const { ideaSearchString, ideasLimit, ideasPage } = this.state;
        const {
            dateStart, dateEnd, selectedCountries, selectedLocations, selectedServiceTypes, history, location,
        } = this.props;
        const historyParams = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEnd.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            types: selectedServiceTypes,
            keyword: ideaSearchString,
            limit: ideasLimit,
            page: ideasPage,
        };

        const definedParams = getDefinedParams(historyParams);
        const query = new URLSearchParams(definedParams);
        if (query.toString() !== location.search.substr(1)) {
            history.push({ search: `?${query}` });
        }
    };

    ideaSearch = (searchString) => {
        this.setState({
            ideasPage: 1,
            ideaSearchString: searchString,
        });
    };

    getIdeas = async () => {
        source.cancel("Operation canceled by the user.");
        source = CancelToken.source(); // create a new signal so that we don't also abort the request we're about to start
        const {
            dateStart, dateEndForExclusiveQuery, selectedCountries, selectedLocations, selectedServiceTypes, selectedServicePoints,
        } = this.props;
        const { ideaSearchString, ideasLimit, ideasPage } = this.state;
        const { makeHttpCall } = this.context;

        const params = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            types: selectedServiceTypes,
            keyword: ideaSearchString,
            limit: ideasLimit,
            page: ideasPage,
            points: selectedServicePoints,
        };

        const response = await makeHttpCall("responses/ideas", "post", { cancelToken: source.token, data: params });

        this.setState({
            ideas: response.data.data,
            ideasCount: response.data.count,
            satisfiedIdeaCount: response.data.satisfied,
        });
    };

    handleKeywordSelect = (e) => {
        const { ideaSearchString } = this.state;
        const selectedKeyword = e.target.value;
        let searchString;

        if (ideaSearchString.includes(selectedKeyword)) {
            return;
        }

        if (selectedKeyword.split(" ").length > 1) {
            searchString = ideaSearchString.concat(" ", `"${selectedKeyword}"`).replace(/^\s/, "");
        }
        else {
            searchString = ideaSearchString.concat(" ", selectedKeyword).replace(/^\s/, "");
        }

        this.setState({ ideaSearchString: searchString, ideasPage: 1 });
    }

    clearIdeaSearchString = () => {
        this.setState({ ideaSearchString: "" });
    }

    changePage = (page) => {
        this.setState(
            {
                ideasPage: page,
            },
        );
    };

    previousPage = () => {
        const { ideasPage } = this.state;

        this.setState(
            {
                ideasPage: ideasPage - 1,
            },
        );
    };

    nextPage = () => {
        const { ideasPage } = this.state;

        this.setState(
            {
                ideasPage: ideasPage + 1,
            },
        );
    };

    getResultsString = () => {
        const { isLoading } = this.context;
        const { ideasCount, ideasPage, ideasLimit } = this.state;

        if (isLoading) {
            return i18n.t("ideafeed.loading");
        }
        else if (ideasCount === 0) {
            return i18n.t("ideafeed.noResults");
        }

        return `${i18n.t("ideafeed.results")}: ${(ideasPage - 1) * ideasLimit + 1} ${i18n.t("ideafeed.to")}
            ${Math.min(ideasPage * ideasLimit, ideasCount)} ${i18n.t("ideafeed.of")} ${ideasCount}`;
    };

    getPaginationContent = (pageCount) => {
        const { ideasPage } = this.state;
        const paginationContent = [];

        if (ideasPage <= 3) {
            // if we're on one of the FIRST 3 pages, display pagination links for the first 5 pages (or fewer if pageCount is < 5)
            for (let i = 1; i <= pageCount && i <= 5; i++) {
                paginationContent.push({ pageNumber: i });
            }
        }
        else if (ideasPage >= (pageCount - 3)) {
            // if we're on one of the LAST 3 pages, display pagination links for the last 5 pages (or fewer if pageCount is < 5)
            for (let i = 4; i >= 0; i--) {
                if (pageCount - i >= 1) {
                    paginationContent.push({ pageNumber: pageCount - i });
                }
            }
        }
        else {
            // otherwise, display pagination links for 5 pages, the current page being in the middle
            for (let i = -2; i <= 2; i++) {
                // logically this condition is not required, but leaving it in case conditions above change
                if (ideasPage + i >= 1 && ideasPage + i <= pageCount) {
                    paginationContent.push({ pageNumber: ideasPage + i });
                }
            }
        }

        return paginationContent;
    };

    render() {
        const {
            allCountries, serviceTypes, selectedCountries, allLocations, selectedLocations, selectLocation, dateStart,
            dateEnd, setDateStartEnd, toggleServiceType, selectedServiceTypes, dateEndForExclusiveQuery,
            selectedServicePoints, servicePoints,
        } = this.props;
        const {
            ideaSearchString, ideas, ideasPage, ideasCount, ideasLimit, satisfiedIdeaCount,
        } = this.state;
        const pageCount = Math.ceil(ideasCount / ideasLimit);
        return (

            <div className="ideafeed-page">

                <div className="title-background-parent">
                    <div className="title-background-shape" />
                </div>

                <Container>
                    <Row>
                        <Col sm={{ size: 8 }}>
                            <div className="ideafeed-page-title">
                                <h1 className="left">{i18n.t("ideafeed.ideaFeedTitle")}</h1>
                                <p>
                                    {i18n.t("ideafeed.ideaFeedDescription")}
                                </p>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <Row>
                        <Col>
                            <GlobalFilter
                                allCountries={allCountries}
                                serviceTypes={serviceTypes}
                                servicePoints={servicePoints}
                                selectedCountries={selectedCountries}
                                allLocations={allLocations}
                                selectedLocations={selectedLocations}
                                selectedServicePoints={selectedServicePoints}
                                selectLocation={selectLocation}
                                dateStart={dateStart}
                                dateEnd={dateEnd}
                                displayFilterSearchCountries={false}
                                displayFilterSearchLocations={false}
                                displayFilterSearchServicePoints
                                customFilterSearch={this.ideaSearch}
                                setDateStartEnd={setDateStartEnd}
                                toggleServiceType={toggleServiceType}
                                selectedServiceTypes={selectedServiceTypes}
                                searchPlaceholder={i18n.t("globalHeader.ideaSearch")}
                                defaultSearchValue={ideaSearchString}
                                allowMultipleServicePointSelect
                                showIdeaSearch
                            />
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <div className="ideafeed-page-bg">
                        <Row>
                            <Col>
                                <div>
                                    <div className="ideafeed-page-head">
                                        <div className="ideafeed-results">
                                            <p className="small">{this.getResultsString()}</p>
                                        </div>
                                        <div className="ideafeed-page-headspacer" />
                                        <div className="ideafeed-print">
                                            <p className="small" />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={{ size: 10, offset: 1 }}>
                                <div className="ideafeed-feed">
                                    {ideas.length > 0
                                        && (
                                            <Row className="satisfaction">
                                                <Col xs="3.6">
                                                    <SatisfactionStatsCard
                                                        satisfiedIdeaCount={satisfiedIdeaCount}
                                                        ideasCount={ideasCount}
                                                    />
                                                </Col>
                                                <Col xs="8.4" className="satisfaction-keyword-col">
                                                    {AppConfig.TOP_KEYWORDS_ENABLED
                                                && (
                                                    <TopKeywordsCard
                                                        allCountries={allCountries}
                                                        selectedCountries={selectedCountries}
                                                        allLocations={allLocations}
                                                        selectedLocations={selectedLocations}
                                                        serviceTypes={serviceTypes}
                                                        selectedServiceTypes={selectedServiceTypes}
                                                        dateStart={dateStart}
                                                        dateEnd={dateEnd}
                                                        dateEndForExclusiveQuery={dateEndForExclusiveQuery}
                                                        handleKeywordSelect={this.handleKeywordSelect}
                                                        ideaSearchString={ideaSearchString}
                                                        clearIdeaSearchString={this.clearIdeaSearchString}
                                                    />
                                                )}
                                                </Col>
                                            </Row>
                                        )}
                                    <div>
                                        {ideas.map((idea, index) => {
                                            return (
                                                <IdeaCard
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={index}
                                                    idea={idea}
                                                    searchTag={this.handleKeywordSelect}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {pageCount > 1
                    && (
                        <Pagination aria-label="Page navigation example">
                            <PaginationItem disabled={ideasPage === 1}>
                                <PaginationLink onClick={() => {
                                    return this.changePage(1);
                                }}
                                >
                                    {i18n.t("ideafeed.first")}
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem disabled={ideasPage === 1}>
                                <PaginationLink
                                    previous
                                    onClick={() => {
                                        return this.previousPage();
                                    }}
                                />
                            </PaginationItem>
                            {this.getPaginationContent(pageCount).map((row) => {
                                return (
                                    <PaginationItem key={row.pageNumber} active={row.pageNumber === ideasPage}>
                                        <PaginationLink onClick={() => this.changePage(row.pageNumber)}>
                                            {row.pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem disabled={ideasPage === pageCount}>
                                <PaginationLink
                                    next
                                    onClick={() => {
                                        return this.nextPage();
                                    }}
                                />
                            </PaginationItem>
                            <PaginationItem disabled={ideasPage === pageCount}>
                                <PaginationLink onClick={() => {
                                    return this.changePage(pageCount);
                                }}
                                >
                                    {i18n.t("ideafeed.last")}
                                </PaginationLink>
                            </PaginationItem>
                        </Pagination>
                    )}
                </Container>

                <GlobalFooter />

            </div>

        );
    }
}

IdeaFeedPage.contextType = AuthContext;

IdeaFeedPage.propTypes = {
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
    location: PropTypes.objectOf(PropTypes.any).isRequired,
    history: PropTypes.objectOf(PropTypes.any).isRequired,
};

IdeaFeedPage.defaultProps = {
    selectedCountries: [],
    selectedLocations: [],
    selectedServiceTypes: [],
    selectedServicePoints: [],
    allCountries: [],
    serviceTypes: [],
    allLocations: [],
    servicePoints: [],
};

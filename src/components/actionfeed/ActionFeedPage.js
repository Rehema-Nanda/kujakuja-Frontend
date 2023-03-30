import React from "react";
import axios from "axios";
import { Row, Col, Container, Pagination, PaginationItem, PaginationLink, Button } from "reactstrap";
import PropTypes from "prop-types";
import moment from "moment";
import i18n from "i18next";

import "./ActionFeedPage.css";
import GlobalFooter from "../GlobalFooter";
import { AuthContext } from "../../AuthContext";
import ActionFeedCard from "./ActionFeedCard";
import GlobalFilter from "../globalfilter/GlobalFilter";
import { getDefinedParams, getQueryParamsFromUrl } from "../../helpers";

const { CancelToken } = axios;
let source = CancelToken.source();
class ActionFeedPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            actionFeeds: [],
            actionFeedCount: 0,
            actionFeedLimit: 50,
            actionFeedPage: 1,
            actionFeedSearchString: "",
        };
    }

    async componentDidMount() {
        const { updateFilterState } = this.props;

        const queryParams = getQueryParamsFromUrl();

        if (Object.entries(queryParams).length > 0) {
            const updateFilterStateRes = updateFilterState(queryParams); // update global filter state
            const updateLocalStateRes = this.updateLocalStateFromQueryParams(queryParams); // update local state

            if (!updateFilterStateRes && !updateLocalStateRes) {
                await this.getActionFeeds();
            }
        }
        else {
            await this.getActionFeeds();
            this.pushHistoryIfRequired();
        }
    }

    async componentDidUpdate(prevProps, prevState) {
        const {
            refreshData, dateStart, dateEnd, selectedCountries, selectedLocations, selectedServiceTypes, location,
            updateFilterState,
        } = this.props;

        const { ActionFeedPage, actionFeedSearchString } = this.state;

        if (
            (refreshData && (
                dateStart !== prevProps.dateStart
                || dateEnd !== prevProps.dateEnd
                || selectedCountries !== prevProps.selectedCountries
                || selectedLocations !== prevProps.selectedLocations
                || selectedServiceTypes !== prevProps.selectedServiceTypes
                || location.search !== prevProps.location.search
            ))
            || ActionFeedPage !== prevState.ActionFeedPage
            || actionFeedSearchString !== prevState.actionFeedSearchString
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
                    updateFilterState(queryParams);
                    this.updateLocalStateFromQueryParams(queryParams);
                }
            }
            else {
                if (ActionFeedPage === prevState.ActionFeedPage) {
                    this.setState({
                        ActionFeedPage: 1,
                    });
                }

                await this.getActionFeeds();
                this.pushHistoryIfRequired();
            }
        }
    }

    // pushes a new entry onto the history stack if the current URL is not already in sync
    pushHistoryIfRequired = () => {
        const { actionFeedSearchString, actionFeedLimit, actionFeedPage } = this.state;
        const {
            dateStart, dateEnd, selectedCountries, selectedLocations, selectedServiceTypes, history, location,
        } = this.props;
        const historyParams = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEnd.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            types: selectedServiceTypes,
            keyword: actionFeedSearchString,
            limit: actionFeedLimit,
            page: actionFeedPage,
        };

        const definedParams = getDefinedParams(historyParams);
        const query = new URLSearchParams(definedParams);
        if (query.toString() !== location.search.substr(1)) {
            history.push({ search: `?${query}` });
        }
    };

    // returns a new object, which excludes any params that are not relevant to this component
    getActionFeedParams = (params) => {
        const actionFeedParamsKeys = ["actionFeedPage", "actionFeedLimit", "actionFeedSearchString"];

        return Object.fromEntries(
            Object.entries(params).filter((p) => {
                return actionFeedParamsKeys.includes(p[0]);
            }),
        );
    };

    remapQueryParamsToLocalStateVariableNamesAndTypes = (queryParams) => {
        // this function renames query param names, the top-level keys, to the equivalent state variable names, the "name" properties
        // also casts the query param values to the given type
        const map = {
            page: {
                name: "actionFeedPage",
                type: Number,
            },
            limit: {
                name: "actionFeedLimit",
                type: Number,
            },
            keyword: {
                name: "actionFeedSearchString",
                type: String,
            },
        };

        // avoid mutating queryParams, create a copy
        const mappedParams = { ...queryParams };

        for (const entry of Object.entries(map)) {
            if (mappedParams.hasOwnProperty(entry[0])) {
                if (Array.isArray(mappedParams[entry[0]])) {
                    // getQueryParamsFromUrl always returns digit params as an array, but the 'actionFeedPage' and
                    // 'actionFeedLimit' params are expected to be scalar values, so we convert them here
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

    updateLocalStateFromQueryParams = (queryParams) => {
        const mappedParams = this.remapQueryParamsToLocalStateVariableNamesAndTypes(queryParams);
        const actionFeedParams = this.getActionFeedParams(mappedParams);
        const { actionFeedPage, actionFeedLimit, actionFeedSearchString } = this.state;

        // merge the default state with whatever state variables are present in the URL query params
        // this ensures that any state not present in the URL query params is reset
        const defaultState = {
            actionFeedPage: 1,
            actionFeedLimit: 50,
            actionFeedSearchString: "",
        };
        const finalState = { ...defaultState, ...actionFeedParams };

        // only update state if we need to
        if (actionFeedPage !== finalState.actionFeedPage
            || actionFeedLimit !== finalState.actionFeedLimit
            || actionFeedSearchString !== finalState.actionFeedSearchString
        ) {
            this.setState(finalState);
            return true;
        }

        return false;
    };

    getActionFeeds = async () => {
        const { makeHttpCall } = this.context;
        source.cancel("Operation canceled by the user.");
        source = CancelToken.source();
        const {
            dateStart, dateEndForExclusiveQuery, selectedCountries, selectedLocations, selectedServiceTypes, selectedServicePoints,
        } = this.props;
        const { actionFeedSearchString, actionFeedLimit, actionFeedPage } = this.state;

        const params = {
            start: dateStart.format("YYYY-MM-DD"),
            end: dateEndForExclusiveQuery.format("YYYY-MM-DD"),
            countries: selectedCountries,
            settlements: selectedLocations,
            types: selectedServiceTypes,
            keyword: actionFeedSearchString,
            limit: actionFeedLimit,
            page: actionFeedPage,
            points: selectedServicePoints,
        };

        const response = await makeHttpCall("action_feeds", "post", { cancelToken: source.token, data: params });

        this.setState({
            actionFeeds: response.data.data,
            actionFeedCount: response.data.count,
        });
    }

    actionFeedSearch = (searchString) => {
        this.setState({
            actionFeedPage: 1,
            actionFeedSearchString: searchString,
        });
    };

    changePage = (page) => {
        this.setState(
            {
                actionFeedPage: page,
            },
        );
    };

    previousPage = () => {
        const { actionFeedPage } = this.state;

        this.setState(
            {
                actionFeedPage: actionFeedPage - 1,
            },
        );
    };

    nextPage = () => {
        const { actionFeedPage } = this.state;

        this.setState(
            {
                actionFeedPage: actionFeedPage + 1,
            },
        );
    };

    getPaginationContent = (pageCount) => {
        const { actionFeedPage } = this.state;
        const paginationContent = [];

        if (actionFeedPage <= 3) {
            // if we're on one of the FIRST 3 pages, display pagination links for the first 5 pages (or fewer if pageCount is < 5)
            for (let i = 1; i <= pageCount && i <= 5; i++) {
                paginationContent.push({ pageNumber: i });
            }
        }
        else if (actionFeedPage >= (pageCount - 3)) {
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
                if (actionFeedPage + i >= 1 && actionFeedPage + i <= pageCount) {
                    paginationContent.push({ pageNumber: actionFeedPage + i });
                }
            }
        }

        return paginationContent;
    };

    redirectToActionFeedForm = () => {
        this.props.history.push("/actionform");
    }

    render() {
        const { actionFeeds, actionFeedSearchString, actionFeedCount, actionFeedLimit, actionFeedPage } = this.state;
        const {
            allCountries, serviceTypes, selectedCountries, allLocations, selectedLocations, selectLocation, dateStart,
            dateEnd, setDateStartEnd, toggleServiceType, selectedServiceTypes, selectedServicePoints, servicePoints,
        } = this.props;
        const pageCount = Math.ceil(actionFeedCount / actionFeedLimit);

        return (
            <div className="ideafeed-page">

                <div className="title-background-parent">
                    <div className="title-background-shape" />
                </div>

                <Container>
                    <Row>
                        <Col sm={{ size: 8 }}>
                            <div className="ideafeed-page-title">
                                <h1 className="left">{i18n.t("actionFeed.title")}</h1>
                                <p>{i18n.t("actionFeed.subTitle")}</p>
                            </div>
                        </Col>

                       <Col sm={{ size: 5 }} md={{ size: 4 }}>
                            <div className="page-title">
                                <Button color="primary" className="primary" onClick={this.redirectToActionFeedForm}>
                                    {i18n.t("actionFeed.addAction")}
                                </Button>
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
                                customFilterSearch={this.actionFeedSearch}
                                setDateStartEnd={setDateStartEnd}
                                toggleServiceType={toggleServiceType}
                                selectedServiceTypes={selectedServiceTypes}
                                searchPlaceholder={i18n.t("actionFeed.actionSearch")}
                                defaultSearchValue={actionFeedSearchString}
                                allowMultipleServicePointSelect
                                showIdeaSearch
                            />
                        </Col>
                    </Row>
                </Container>


                <Container>
                    <div className="ideafeed-page-bg">
                        <Row>
                            <Col lg={{ size: 10, offset: 1 }}>
                                <div className="ideafeed-feed">
                                    <div className="action-card-parent">
                                        {actionFeeds.length > 0
                                        ? actionFeeds.map((action) => {
                                            return (
                                                <ActionFeedCard action={action} key={action.id} />
                                            );
                                        })
                                        : <span className="no-actions">{i18n.t("actionFeed.noAction")}</span>}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {pageCount > 1
                    && (
                        <Pagination aria-label="Page navigation example">
                            <PaginationItem disabled={actionFeedPage === 1}>
                                <PaginationLink onClick={() => {
                                    return this.changePage(1);
                                }}
                                >
                                    {i18n.t("ideafeed.first")}
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem disabled={actionFeedPage === 1}>
                                <PaginationLink
                                    previous
                                    onClick={() => {
                                        return this.previousPage();
                                    }}
                                />
                            </PaginationItem>
                            {this.getPaginationContent(pageCount).map((row) => {
                                return (
                                    <PaginationItem key={row.pageNumber} active={row.pageNumber === actionFeedPage}>
                                        <PaginationLink onClick={() => this.changePage(row.pageNumber)}>
                                            {row.pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                );
                            })}
                            <PaginationItem disabled={actionFeedPage === pageCount}>
                                <PaginationLink
                                    next
                                    onClick={() => {
                                        return this.nextPage();
                                    }}
                                />
                            </PaginationItem>
                            <PaginationItem disabled={actionFeedPage === pageCount}>
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

ActionFeedPage.contextType = AuthContext;

ActionFeedPage.propTypes = {
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

ActionFeedPage.defaultProps = {
    selectedCountries: [],
    selectedLocations: [],
    selectedServiceTypes: [],
    selectedServicePoints: [],
    allCountries: [],
    serviceTypes: [],
    allLocations: [],
    servicePoints: [],
};

export default ActionFeedPage;

import React from "react";
import {
    Badge, Input, Popover, PopoverBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactGA from "react-ga";
import i18n from "i18next";

import { debounce } from "lodash";
import { AuthContext } from "../../AuthContext";

export default class GlobalFilterSearch extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            inputValue: "",
            searchResults: {
                countries: [],
                locations: [],
                service_points: [],
            },
            popoverOpen: false,
        };

        this.onFocus = this.onFocus.bind(this);
        this.onChange = this.onChange.bind(this);
        this.togglePopover = this.togglePopover.bind(this);
        this.selectSearchResult = this.selectSearchResult.bind(this);
    }

    async componentDidUpdate(prevProps, prevState) {
        if (this.props.defaultValue !== prevProps.defaultValue) {
            this.setState({
                inputValue: this.props.defaultValue,
            });
            return;
        }

        if (this.state.inputValue !== prevState.inputValue) {
            if (this.props.customFilterSearch) {
                this.props.customFilterSearch(this.state.inputValue);
                return;
            }

            if (this.state.inputValue !== "") {
                return await this.getSearchResult();
            }

            this.setState(
                {
                    searchResults: {
                        countries: [],
                        locations: [],
                        service_points: []
                    },
                    popoverOpen: false
                }
            );
        }
    }

    componentWillUnmount() {
        this.handleSearchDebounced.cancel();
    }

    onFocus(event) {
        const { searchResults } = this.state;

        ReactGA.event(
            {
                category: window.location.pathname,
                action: "Search in Focus"
            }
        );

        if (searchResults.countries.length > 0 || searchResults.locations.length > 0 || this.state.searchResults.service_points.length > 0) {
            this.togglePopover();
        }
    }

    onChange(event) {
        // ref: https://stackoverflow.com/questions/23123138/perform-debounce-in-react-js
        // note that we are NOT passing the event object or using event.persist()
        // https://stackoverflow.com/questions/23123138/perform-debounce-in-react-js#comment83607053_24679479
        this.handleSearchDebounced(event.target.value);
    }

    getSearchResult = async () => {
        const { makeHttpCall } = this.context;
        const {
            displayFilterSearchCountries, displayFilterSearchLocations, displayFilterSearchServicePoints,
        } = this.props;
        const response = await makeHttpCall(`search/${this.state.inputValue}`);

        this.setState({
            searchResults: {
                countries: displayFilterSearchCountries ? response.data.countries : [],
                locations: displayFilterSearchLocations ? response.data.settlements : [],
                service_points: displayFilterSearchServicePoints ? response.data.service_points : [],
            },
            popoverOpen: true,
        });
    };

    handleSearchDebounced = debounce((value) => {
        this.setState(
            {
                inputValue: value
            }
        );
    }, 500);

    selectSearchResult = (event) => {
        const { setSearchResult } = this.props;

        setSearchResult(event.currentTarget.dataset.id, event.currentTarget.dataset.type);
        this.setState(
            {
                popoverOpen: false,
            },
        );
    };

    togglePopover() {
        const { popoverOpen } = this.state;

        this.setState(
            {
                popoverOpen: !popoverOpen,
            },
        );
    }

    render() {
        const {
            displayFilterSearchCountries, displayFilterSearchLocations,
            displayFilterSearchServicePoints, defaultValue, placeholder,
        } = this.props;
        const {
            popoverOpen, searchResults,
        } = this.state;

        return (
            <div>
                <div className="map-controls-search-icon"><FontAwesomeIcon icon="search"/></div>
                <Input key={defaultValue} type="" name="" onFocus={this.onFocus} onChange={this.onChange} id="search"
                       defaultValue={defaultValue} className="map-controls-search" placeholder={placeholder || "Search"}/>

                <Popover placement="bottom" isOpen={popoverOpen} target="search" toggle={this.togglePopover} className="map-controls-popover search-results">
                    <PopoverBody>
                        <p className={`${!displayFilterSearchCountries ? "globalfilter-search-hidden" : ""}`}>
                            <Badge color="secondary" pill>{searchResults.countries.length}</Badge>
                            {" "}
                            {i18n.t("globalHeader.countries")}
                        </p>
                        <ul className="map-controls-popover-list">
                            {searchResults.countries.map((country, index) =>
                                <li key={country.id} onClick={this.selectSearchResult} data-id={country.id} data-type="Countries">{country.name}</li>)}
                        </ul>

                        <p className={`${!displayFilterSearchLocations ? "globalfilter-search-hidden" : ""}`}>
                            <Badge color="secondary" pill>
                                {searchResults.locations.length}
                            </Badge>
                            {" "}
                            {i18n.t("globalHeader.locations")}
                        </p>
                        <ul className="map-controls-popover-list">
                            {searchResults.locations.map((location, index) =>
                                <li key={location.id} onClick={this.selectSearchResult} data-id={location.id} data-type="Locations">{location.name}</li>)}
                        </ul>

                        <p className={`${!displayFilterSearchServicePoints ? "globalfilter-search-hidden" : ""}`}>
                            <Badge color="secondary" pill>
                                {searchResults.service_points.length}
                            </Badge>
                            {" "}
                            {i18n.t("globalHeader.servicePoints")}
                        </p>
                        <ul className="map-controls-popover-list">
                            {searchResults.service_points.map((servicePoint, index) =>
                                <li key={servicePoint.id} onClick={this.selectSearchResult} data-id={servicePoint.id} data-type="ServicePoints">{servicePoint.name}</li>)}
                        </ul>
                    </PopoverBody>
                </Popover>
            </div>
        );
    }
}
GlobalFilterSearch.contextType = AuthContext;

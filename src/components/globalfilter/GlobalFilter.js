import React from "react";
import i18n from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    Navbar, NavbarBrand, NavbarToggler, Collapse,
} from "reactstrap";
import PropTypes from "prop-types";
import GlobalFilterSearch from "./GlobalFilterSearch";
import GlobalFilterDropdown from "./GlobalFilterDropdown";
import GlobalFilterCalendar from "./GlobalFilterCalendar";
import GlobalFilterCalendarMobileStart from "./GlobalFilterCalendarMobileStart";
import GlobalFilterCalendarMobileEnd from "./GlobalFilterCalendarMobileEnd";
import GlobalFilterServices from "./GlobalFilterServices";
import GlobalFilterMobileButton from "./GobalFilterMobileButton";
import GlobalFilterMobileList from "./GlobalFilterMobileList";
import "./GlobalFilter.css";
import { CalendarConfig } from "./CalendarConfig";

const arrowImgUp = require("../../img/mobile-controls-arrow-up.svg");
const arrowImg = require("../../img/mobile-controls-arrow.svg");

export default class GlobalFilter extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mobileControlsOpen: false,
            showMobileFilter: true,
            showMobileFilterCountries: false,
            showMobileFilterLocations: false,
            showMobileFilterStartDate: false,
            showMobileFilterEndDate: false,
            showMobileFilterServicePoints: false,
        };

        this.toggleMobileControls = this.toggleMobileControls.bind(this);
        this.toggleMobileControlsAndClose = this.toggleMobileControlsAndClose.bind(this);
        this.displayMobileFilter = this.displayMobileFilter.bind(this);
        this.displayMobileFilterCountries = this.displayMobileFilterCountries.bind(this);
        this.displayMobileFilterLocations = this.displayMobileFilterLocations.bind(this);
        this.displayMobileFilterStartDate = this.displayMobileFilterStartDate.bind(this);
        this.displayMobileFilterEndDate = this.displayMobileFilterEndDate.bind(this);
    }

    componentDidMount() {

    }

    toggleMobileControls = () => {
        const { mobileControlsOpen } = this.state;
        this.setState(
            {
                mobileControlsOpen: !mobileControlsOpen,
            },
        );
    };

    toggleMobileControlsAndClose = (e) => {
        const { mobileControlsOpen } = this.state;
        this.setState(
            {
                mobileControlsOpen: !mobileControlsOpen,
            },
        );

        // swap icons on navbar
        if (navigator.userAgent.indexOf("Chrome") !== -1 || navigator.userAgent.indexOf("Safari") !== -1) {
            // needs firefox fix
            if (mobileControlsOpen === false) {
                e.target.style.backgroundImage = `url(${arrowImgUp})`;
                e.target.style.backgroundSize = "24px 24px";
                e.target.style.backgroundRepeat = "no-repeat";
                e.target.style.backgroundPosition = "center right";
            }
            else {
                e.target.style.backgroundImage = `url(${arrowImg})`;
                e.target.style.backgroundSize = "24px 24px";
                e.target.style.backgroundRepeat = "no-repeat";
                e.target.style.backgroundPosition = "center center";
            }
        }
    };

    displayMobileFilter = () => {
        this.setState(
            {
                showMobileFilter: true,
                showMobileFilterCountries: false,
                showMobileFilterLocations: false,
                showMobileFilterStartDate: false,
                showMobileFilterEndDate: false,
                showMobileFilterServicePoints: false,
            },
        );
    };

    displayMobileFilterCountries = () => {
        this.setState(
            {
                showMobileFilter: false,
                showMobileFilterCountries: true,
                showMobileFilterLocations: false,
                showMobileFilterStartDate: false,
                showMobileFilterEndDate: false,
                showMobileFilterServicePoints: false,
            },
        );
    };

    displayMobileFilterLocations = () => {
        this.setState(
            {
                showMobileFilter: false,
                showMobileFilterCountries: false,
                showMobileFilterLocations: true,
                showMobileFilterStartDate: false,
                showMobileFilterEndDate: false,
                showMobileFilterServicePoints: false,
            },
        );
    };

    displayMobileFilterStartDate = () => {
        this.setState(
            {
                showMobileFilter: false,
                showMobileFilterCountries: false,
                showMobileFilterLocations: false,
                showMobileFilterStartDate: true,
                showMobileFilterEndDate: false,
                showMobileFilterServicePoints: false,
            },
        );
    };

    displayMobileFilterEndDate = () => {
        this.setState(
            {
                showMobileFilter: false,
                showMobileFilterCountries: false,
                showMobileFilterLocations: false,
                showMobileFilterStartDate: false,
                showMobileFilterEndDate: true,
                showMobileFilterServicePoints: false,
            },
        );
    };

    displayFilterSearchServicePoints = () => {
        this.setState({
            showMobileFilter: false,
            showMobileFilterCountries: false,
            showMobileFilterLocations: false,
            showMobileFilterStartDate: false,
            showMobileFilterEndDate: false,
            showMobileFilterServicePoints: true,
        });
    }

    render() {
        const {
            displayFilterSearchCountries, displayFilterSearchLocations, displayFilterSearchServicePoints,
            customFilterSearch, setSearchResult, searchPlaceholder, defaultSearchValue, allCountries, selectLocation,
            selectedLocations, selectedCountries, allLocations, setDateStartEnd, dateStart, dateEnd, serviceTypes,
            toggleServiceType, selectedServiceTypes, selectedServicePoints, servicePoints,
            allowMultipleServicePointSelect, showIdeaSearch,
        } = this.props;
        const {
            showMobileFilter, mobileControlsOpen, showMobileFilterStartDate, showMobileFilterEndDate,
            showMobileFilterCountries, showMobileFilterLocations, showMobileFilterServicePoints,
        } = this.state;
        return (

            <div>

                <div className="globalfilter-container">

                    <div className="globalfilter-desktop">

                        <div className="globalfilter-search-container">
                            <GlobalFilterSearch
                                displayFilterSearchCountries={displayFilterSearchCountries}
                                displayFilterSearchLocations={displayFilterSearchLocations}
                                displayFilterSearchServicePoints={displayFilterSearchServicePoints}
                                customFilterSearch={customFilterSearch}
                                setSearchResult={setSearchResult}
                                placeholder={searchPlaceholder}
                                defaultValue={defaultSearchValue}
                            />
                        </div>

                        <div className="globalfilter-locations-container">
                            <GlobalFilterDropdown
                                id="CountriesDropDown"
                                title={i18n.t("globalHeader.countries")}
                                items={allCountries}
                                itemLabelProperty="name"
                                selectItemHandler={selectLocation}
                                selectItemHandlerArgs={["Countries"]}
                                selectedItems={selectedCountries}
                                showSearch
                            />
                            <div className="globalfilter-locations-spacer" />
                            <GlobalFilterDropdown
                                id="LocationsDropDown"
                                className="location-dropdown"
                                title={i18n.t("globalHeader.locations")}
                                items={allLocations}
                                itemLabelProperty="name"
                                selectItemHandler={selectLocation}
                                selectItemHandlerArgs={["Locations"]}
                                selectedItems={selectedLocations}
                                showSearch
                            />
                        </div>

                        <div className="globalfilter-calendar-container">
                            <GlobalFilterCalendar
                                withPortal={false}
                                setDateStartEnd={setDateStartEnd}
                                type={CalendarConfig.CALENDAR_DATE}
                                dateStart={dateStart}
                                dateEnd={dateEnd}
                            />
                        </div>

                        <div className="globalfilter-service-container">
                            <GlobalFilterServices
                                serviceTypes={serviceTypes}
                                toggleServiceType={toggleServiceType}
                                selectedServiceTypes={selectedServiceTypes}
                            />
                        </div>

                    </div>


                    <div className="globalfilter-mobile">

                        <Navbar>
                            <NavbarBrand className="globalfilter-mobile-brand">
                                {showMobileFilter ? (
                                    <p>{i18n.t("globalHeader.filter")}</p>
                                ) : (
                                    <div className="globalfilter-back-button" onClick={this.displayMobileFilter} role="presentation">
                                        <FontAwesomeIcon icon="arrow-left" className="globalfilter-back-icon" />
                                        <p>{i18n.t("globalHeader.back")}</p>
                                    </div>
                                )}
                            </NavbarBrand>

                            <NavbarToggler onClick={this.toggleMobileControlsAndClose} />
                            <Collapse isOpen={mobileControlsOpen} navbar>

                                <div className="globalfilter-mobile-container">

                                    {showMobileFilter
                                    && (
                                        <div>
                                            <div className="globalfilter-label fadein">
                                                <p className="small">{i18n.t("globalHeader.startDate")}</p>
                                            </div>

                                            <div className="globalfilter-label fadein">
                                                <p className="small">{i18n.t("globalHeader.endDate")}</p>
                                            </div>

                                            <div className="globalfilter-calendar-container fadein">
                                                <GlobalFilterMobileButton
                                                    text={dateStart.format("L")}
                                                    onClick={this.displayMobileFilterStartDate}
                                                />
                                                <GlobalFilterMobileButton
                                                    text={dateEnd.format("L")}
                                                    onClick={this.displayMobileFilterEndDate}
                                                />

                                            </div>

                                            <div className="globalfilter-locations-container fadein">
                                                <GlobalFilterMobileButton
                                                    text={`Countries (${selectedCountries.length})`}
                                                    onClick={this.displayMobileFilterCountries}
                                                />
                                                <GlobalFilterMobileButton
                                                    text={`Locations (${selectedLocations.length})`}
                                                    onClick={this.displayMobileFilterLocations}
                                                />
                                            </div>


                                            <div className="globalfilter-locations-container fadein">
                                                {showIdeaSearch
                                                && (
                                                    <div className="globalfilter-search-container fadein">
                                                        <GlobalFilterSearch
                                                            displayFilterSearchCountries={displayFilterSearchCountries}
                                                            displayFilterSearchLocations={displayFilterSearchLocations}
                                                            displayFilterSearchServicePoints={displayFilterSearchServicePoints}
                                                            customFilterSearch={customFilterSearch}
                                                            setSearchResult={setSearchResult}
                                                            placeholder={searchPlaceholder}
                                                            defaultValue={defaultSearchValue}
                                                        />
                                                    </div>
                                                )}

                                                {displayFilterSearchServicePoints
                                                && (
                                                    <GlobalFilterMobileButton
                                                        text={`Service Points (${selectedServicePoints.length})`}
                                                        onClick={this.displayFilterSearchServicePoints}
                                                    />
                                                )}
                                            </div>

                                            <div className="globalfilter-service-container fadein">
                                                <GlobalFilterServices
                                                    serviceTypes={serviceTypes}
                                                    toggleServiceType={toggleServiceType}
                                                    selectedServiceTypes={selectedServiceTypes}
                                                />
                                            </div>

                                        </div>

                                    )}

                                    {showMobileFilterStartDate
                                    && (
                                        <GlobalFilterCalendarMobileStart
                                            withPortal={false}
                                            setDateStartEnd={setDateStartEnd}
                                            dateStart={dateStart}
                                            dateEnd={dateEnd}
                                            type={CalendarConfig.CALENDAR_DATE}
                                            displayMobileFilter={this.displayMobileFilter}
                                        />
                                    )}

                                    {showMobileFilterEndDate
                                    && (
                                        <GlobalFilterCalendarMobileEnd
                                            withPortal={false}
                                            setDateStartEnd={setDateStartEnd}
                                            dateStart={dateStart}
                                            dateEnd={dateEnd}
                                            type={CalendarConfig.CALENDAR_DATE}
                                            displayMobileFilter={this.displayMobileFilter}
                                        />
                                    )}

                                    {showMobileFilterCountries
                                    && (
                                        <GlobalFilterMobileList
                                            items={allCountries}
                                            itemLabelProperty="name"
                                            selectItemHandler={selectLocation}
                                            selectItemHandlerArgs={["Countries"]}
                                            selectedItems={selectedCountries}
                                            showSearch
                                        />

                                    )}

                                    {showMobileFilterLocations
                                    && (
                                        <GlobalFilterMobileList
                                            items={allLocations}
                                            itemLabelProperty="name"
                                            selectItemHandler={selectLocation}
                                            selectItemHandlerArgs={["Locations"]}
                                            selectedItems={selectedLocations}
                                            showSearch
                                        />
                                    )}

                                    {showMobileFilterServicePoints
                                    && (
                                        <GlobalFilterMobileList
                                            items={servicePoints}
                                            itemLabelProperty="name"
                                            selectItemHandler={selectLocation}
                                            selectItemHandlerArgs={["ServicePoints"]}
                                            selectedItems={selectedServicePoints}
                                            showSearch
                                            allowMultipleServicePointSelect={allowMultipleServicePointSelect}
                                        />
                                    )}

                                </div>
                            </Collapse>
                        </Navbar>
                    </div>
                </div>
            </div>
        );
    }
}
GlobalFilter.propTypes = {
    selectLocation: PropTypes.func.isRequired,
    selectedCountries: PropTypes.arrayOf(PropTypes.string),
    selectedLocations: PropTypes.arrayOf(PropTypes.string),
    selectedServicePoints: PropTypes.arrayOf(PropTypes.string),
    setDateStartEnd: PropTypes.func.isRequired,
    dateStart: PropTypes.objectOf(PropTypes.any).isRequired,
    dateEnd: PropTypes.objectOf(PropTypes.any).isRequired,
    toggleServiceType: PropTypes.func.isRequired,
    serviceTypes: PropTypes.arrayOf(PropTypes.object).isRequired,
    servicePoints: PropTypes.arrayOf(PropTypes.object),
    selectedServiceTypes: PropTypes.arrayOf(PropTypes.string),
    displayFilterSearchCountries: PropTypes.bool,
    displayFilterSearchLocations: PropTypes.bool,
    displayFilterSearchServicePoints: PropTypes.bool,
    customFilterSearch: PropTypes.func,
    setSearchResult: PropTypes.func,
    searchPlaceholder: PropTypes.string,
    defaultSearchValue: PropTypes.string,
    allCountries: PropTypes.arrayOf(PropTypes.object),
    allLocations: PropTypes.arrayOf(PropTypes.object),
    allowMultipleServicePointSelect: PropTypes.bool,
    showIdeaSearch: PropTypes.bool,

};

GlobalFilter.defaultProps = {
    selectedCountries: [],
    selectedLocations: [],
    selectedServiceTypes: [],
    selectedServicePoints: [],
    displayFilterSearchCountries: false,
    displayFilterSearchLocations: false,
    displayFilterSearchServicePoints: false,
    customFilterSearch: undefined,
    setSearchResult: () => {},
    searchPlaceholder: "",
    defaultSearchValue: "",
    allCountries: [],
    allLocations: [],
    servicePoints: [],
    allowMultipleServicePointSelect: true,
    showIdeaSearch: false,
};

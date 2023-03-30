import React, { Component } from "react";
import { Button, Row, Col } from "reactstrap";
import axios from "axios";
import PropTypes from "prop-types";
import i18n from "i18next";
import moment from "moment";
import AppConfig from "../../AppConfig";

const satisfiedFace = require("../../img/face_satisfied.svg");
const unsatisfiedFace = require("../../img/face_unsatisfied.svg");

class TopKeywordsCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            positiveKeywords: [],
            negativeKeywords: [],
            isFetchingKeywords: true,
        };
    }

    async componentDidMount() {
        await this.getKeywords();
    }

    async componentDidUpdate(prevProps) {
        const {
            ideaSearchString, dateStart, dateEndForExclusiveQuery,
            selectedCountries, selectedLocations, selectedServiceTypes,
        } = this.props;

        if (
            prevProps.ideaSearchString !== ideaSearchString
            || dateStart.valueOf() !== prevProps.dateStart.valueOf()
            || dateEndForExclusiveQuery.valueOf() !== prevProps.dateEndForExclusiveQuery.valueOf()
            || JSON.stringify(selectedCountries) !== JSON.stringify(prevProps.selectedCountries)
            || JSON.stringify(selectedLocations) !== JSON.stringify(prevProps.selectedLocations)
            || JSON.stringify(selectedServiceTypes) !== JSON.stringify(prevProps.selectedServiceTypes)
        ) {
            await this.getKeywords();
        }
    }

    async getAccessToken() {
        const data = {
            username: AppConfig.TOP_KEYWORDS_LOGIN_USERNAME,
            password: AppConfig.TOP_KEYWORDS_LOGIN_PASSWORD,
        };
        const res = await axios.post(AppConfig.TOP_KEYWORDS_LOGIN_URL, data);
        return res.data.access_token;
    }

    async getKeywords() {
        const {
            allCountries, selectedCountries, allLocations, selectedLocations,
            serviceTypes, selectedServiceTypes, dateStart, dateEndForExclusiveQuery, ideaSearchString,
        } = this.props;

        const token = await this.getAccessToken();
        const dateStartAsString = dateStart.format("YYYY-MM-DD");
        const dateEndAsString = dateEndForExclusiveQuery.format("YYYY-MM-DD");
        let selectedCountryNames = [];
        if (selectedCountries && selectedCountries.length) {
            selectedCountryNames = selectedCountries.map((country) => {
                const countryFound = allCountries.find((item) => item.id === country);
                return countryFound.name;
            });
        }
        let selectedSettlementNames = [];
        if (selectedLocations && selectedLocations.length) {
            selectedSettlementNames = selectedLocations.map((location) => {
                const settlementFound = allLocations.find((item) => item.id === location);
                return settlementFound.name;
            });
        }
        let selectedServiceTypeNames = [];
        if (selectedServiceTypes && selectedServiceTypes.length) {
            selectedServiceTypeNames = selectedServiceTypes.map((serviceType) => {
                const serviceTypeFound = serviceTypes.find((item) => item.id === serviceType);
                return serviceTypeFound.name;
            });
        }

        // Removes tags(words beginning with # e.g #covid-19) fom the keywords string
        const keywordsWithoutsTags = ideaSearchString && ideaSearchString.replace(/#[\w-]+/g, "");
        // creates an array of keywords without the tags
        let keywordsArray = keywordsWithoutsTags && keywordsWithoutsTags.match(/"[^"]+"|[^\s]+/g).map((e) => e.replace(/"(.+)"/, "$1"));
        // sets the array to empty if this is a tsvector query
        if (ideaSearchString.startsWith("textsearch:")) {
            keywordsArray = [];
        }

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            url: AppConfig.TOP_KEYWORDS_API_URL,
            data: {
                start: dateStartAsString,
                end: dateEndAsString,
                countries: selectedCountryNames,
                settlements: selectedSettlementNames,
                service_types: selectedServiceTypeNames,
                keywords: keywordsArray,
            },
        };

        try {
            this.setState({ isFetchingKeywords: true });
            const response = await axios(options);
            this.setState({
                positiveKeywords: response.data.positive,
                negativeKeywords: response.data.negative,
                isFetchingKeywords: false,
            });
        }
        catch {
            this.setState({
                positiveKeywords: [],
                negativeKeywords: [],
                isFetchingKeywords: false,
            });
        }
    }

    render() {
        const { handleKeywordSelect, ideaSearchString, clearIdeaSearchString } = this.props;
        const { negativeKeywords, positiveKeywords, isFetchingKeywords } = this.state;
        return (
            <div>
                <div className="satisfaction-keywords">
                    <div className="header">
                        <Row>
                            <Col xs="8" className="header-title">
                                {i18n.t("ideafeed.topKeywordCardTitle")}
                                :
                                {" "}
                                {ideaSearchString && !ideaSearchString.startsWith("regex:")
                                    ? <span className="selected-keywords">{ideaSearchString}</span>
                                    : (
                                        <span className="selected-keywords">
                                            (
                                            {i18n.t("ideafeed.topKeywordNoKeyword")}
                                            )
                                        </span>
                                    )}
                            </Col>

                            <Col xs="4" className="header-toggle">
                                <span className="options" onClick={clearIdeaSearchString} role="presentation">{i18n.t("ideafeed.clearSelectedKeywords")}</span>
                            </Col>
                        </Row>
                    </div>
                    <div className="keywords-container">
                        <div className="keywords">
                            <Row>
                                <Col xs="1">
                                    <div className="satisfaction-face"><img src={satisfiedFace} alt="" /></div>
                                </Col>
                                <Col className="keywords-column">
                                    {isFetchingKeywords ? <p className="no-results">{i18n.t("ideafeed.loading")}</p>
                                        : positiveKeywords.length
                                            ? positiveKeywords.map((word, index) => (
                                                <Button
                                                    className="keyword-option"
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={index}
                                                    value={word}
                                                    onClick={handleKeywordSelect}
                                                >
                                                    {word}
                                                </Button>
                                            ))
                                            : <p className="no-results">{i18n.t("ideafeed.noKeywordsReturned")}</p>}
                                </Col>
                            </Row>
                        </div>
                        <div className="keywords top-border">
                            <Row>
                                <Col xs="1">
                                    <div className="satisfaction-face"><img src={unsatisfiedFace} alt="" /></div>
                                </Col>
                                <Col className="keywords-column">
                                    {isFetchingKeywords ? <span className="no-results">{i18n.t("ideafeed.loading")}</span>
                                        : negativeKeywords.length
                                            ? negativeKeywords.map((word, index) => (
                                                <Button
                                                    className="keyword-option"
                                                    // eslint-disable-next-line react/no-array-index-key
                                                    key={index}
                                                    value={word}
                                                    onClick={handleKeywordSelect}
                                                >
                                                    {word}
                                                </Button>
                                            ))
                                            : <span className="no-results">{i18n.t("ideafeed.noKeywordsReturned")}</span>}
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

TopKeywordsCard.propTypes = {
    handleKeywordSelect: PropTypes.func.isRequired,
    ideaSearchString: PropTypes.string,
    clearIdeaSearchString: PropTypes.func,
    allCountries: PropTypes.array,
    selectedCountries: PropTypes.array,
    allLocations: PropTypes.array,
    selectedLocations: PropTypes.array,
    serviceTypes: PropTypes.array,
    selectedServiceTypes: PropTypes.array,
    dateStart: PropTypes.instanceOf(moment),
    dateEndForExclusiveQuery: PropTypes.instanceOf(moment),
    dateEnd: PropTypes.instanceOf(moment),

};

TopKeywordsCard.defaultProps = {
    ideaSearchString: "",
    clearIdeaSearchString: () => {},
};

export default TopKeywordsCard;

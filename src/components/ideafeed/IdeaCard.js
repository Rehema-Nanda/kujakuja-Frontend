import React, { Component } from "react";
import moment from "moment";
import { Row, Button } from "reactstrap";
import PropTypes from "prop-types";
import i18n from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import convert from "htmr";

import AppConfig from "../../AppConfig";
import lngOptions from "../../i18n/lngOptions";

const googleTranslateKey = AppConfig.GOOGLE_TRANSLATE_API_KEY;
const googleTranslate = require("google-translate")(googleTranslateKey);

const ideaFeedStarredIcon = require("../../img/ideafeed_starred.svg");
const googleTranslateBadge = require("../../img/google_translate_greyscale.svg");

class IdeaCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isDetailsAccordionOpen: false,
            translatedIdea: "",
            originalIdeaLang: "",
        };
    }

    componentDidMount() {
        const { idea } = this.props;
        if (i18n.language !== idea.idea_language) {
            this.translateIdea();
            this.getIdeaOriginalLanguage();
        }
    }

    toggleDetailsAccordion = () => {
        const { isDetailsAccordionOpen } = this.state;
        this.setState({ isDetailsAccordionOpen: !isDetailsAccordionOpen });
    };

    generateTranslationMarkUp = () => {
        const { idea } = this.props;
        return (
            `${i18n.language}-x-mtfrom-${idea.idea_language}`
        );
    };

    getIdeaOriginalLanguage = () => {
        const { idea: { idea_language } } = this.props; // eslint-disable-line camelcase
        const language = lngOptions.find((lng) => lng.value === idea_language); // eslint-disable-line camelcase
        const languageName = language ? language.name : idea_language;// eslint-disable-line camelcase
        this.setState({ originalIdeaLang: languageName });
    }

    translateIdea = () => {
        // eslint-disable-next-line camelcase
        const { idea: { idea, idea_language } } = this.props;
        const currentLang = i18n.language;
        googleTranslate.translate(idea, idea_language, currentLang, (err, translate) => {
            if (err) {
                return;
            }
            this.setState({ translatedIdea: translate.translatedText });
        });
    }

    render() {
        const { idea, searchTag } = this.props;
        const { isDetailsAccordionOpen, translatedIdea, originalIdeaLang } = this.state;

        return (
            <div className="ideafeed-item">
                <div className="ideafeed-item-idea">
                    <Row>
                        <p className="small">
                            {moment.utc(idea.created_at).format("LL")}
                            {" | "}
                            {idea.name}
                            {idea.tags && " |"}
                            {idea.tags && idea.tags.split(",").map((tag) => {
                                return (
                                    <Button
                                        key={tag}
                                        type="button"
                                        className="tag"
                                        value={`#${tag}`}
                                        onClick={searchTag}
                                    >
                                        {`#${tag}`}
                                    </Button>
                                );
                            })}
                        </p>
                        {idea.is_starred && (
                            <div className="ideafeed-item-starred">
                                <img alt="" src={ideaFeedStarredIcon} className="icon" />
                            </div>
                        )}
                    </Row>
                    <div className="idea" lang={this.generateTranslationMarkUp()}>
                        &quot;
                        {convert(translatedIdea || idea.idea)}
                        &quot;
                    </div>
                    {i18n.language !== idea.idea_language
                    && (
                        <div className="translation-container">
                            <div className="text">
                                <span
                                    className="show-original"
                                    role="presentation"
                                    onClick={() => {
                                        this.toggleDetailsAccordion();
                                    }}
                                >
                                    {isDetailsAccordionOpen ? i18n.t("ideafeed.hideOriginal") : i18n.t("ideafeed.showOriginal")}
                                    {" "}
                                    {originalIdeaLang}
                                    {" "}
                                    {i18n.t("ideafeed.idea")}
                                </span>
                            </div>
                            <div className="google-badge">
                                <a href="http://translate.google.com/" rel="noopener noreferrer" target="_blank">
                                    <img src={googleTranslateBadge} alt="" />
                                </a>
                            </div>
                        </div>
                    )}
                </div>

                {i18n.language !== idea.idea_language
                && (
                    <div className="ideafeed-item-details">
                        {isDetailsAccordionOpen
                        && (
                            <div className="ideafeed-item-details-idea">
                                <div className="header">
                                    <span className="header-text">{i18n.t("ideafeed.ideaAsCaptured")}</span>
                                </div>
                                <p className="idea show-original-idea">
                                    &quot;
                                    {convert(idea.idea)}
                                    &quot;
                                </p>
                            </div>
                        )}
                        <div
                            className="toggle"
                            role="presentation"
                            onClick={() => {
                                return this.toggleDetailsAccordion();
                            }}
                        >
                            {isDetailsAccordionOpen
                                ? (
                                    <span>
                                        {i18n.t("ideafeed.close")}
                                        {" "}
                                        <FontAwesomeIcon icon="caret-up" />
                                    </span>
                                ) : (
                                    <span>
                                        {i18n.t("ideafeed.details")}
                                        {" "}
                                        <FontAwesomeIcon icon="caret-down" />
                                    </span>
                                )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
IdeaCard.propTypes = {
    idea: PropTypes.objectOf(
        PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool]),
    ).isRequired,
    searchTag: PropTypes.func.isRequired,
};
export default IdeaCard;

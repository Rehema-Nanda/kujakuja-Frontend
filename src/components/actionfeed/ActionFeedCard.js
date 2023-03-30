import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Row, Col, Card, CardImg } from "reactstrap";
import moment from "moment";
import PropTypes from "prop-types";
import convert from "htmr";
import i18n from "i18next";

import AppConfig from "../../AppConfig";
import { getIdeafeedParamsFromUrl } from "../../helpers";

const googleTranslateKey = AppConfig.GOOGLE_TRANSLATE_API_KEY;
const googleTranslate = require("google-translate")(googleTranslateKey);
const googleTranslateBadge = require("../../img/google_translate_greyscale.svg");

class ActionFeedCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDetailsAccordionOpen: false,
            translatedDescription: "",
            translatedTitle: "",
            originalActionLang: "",
            startDate: "",
            endDate: ""
        };
        // this.formatStartEndIdeafeedDates();
    }

    componentDidMount() {
        const { action } = this.props;
        if (i18n.language !== action.action_feed_language) {
            this.translateAction();
        }
    }

    translateAction = () => {
        const { action} = this.props;
        const currentLang = i18n.language;

        googleTranslate.translate([action.title, action.description], action.action_feed_language, currentLang, (err, translate) => {
            if (err) {
                return;
            }

            this.setState({ 
                translatedTitle: translate[0].translatedText,
                translatedDescription: translate[1].translatedText
            });
        });
    }

    generateTranslationMarkUp = () => {
        const { action } = this.props;

        return (
            `${i18n.language}-x-mtfrom-${action.action_feed_language}`
        );
    };

    toggleDetailsAccordion = () => {
        const { isDetailsAccordionOpen } = this.state;
        this.setState({ isDetailsAccordionOpen: !isDetailsAccordionOpen });
    };

    formatStartEndIdeafeedDates = () => {
        const period = {};
        const { action } = this.props;
        const params = getIdeafeedParamsFromUrl(action.source);
        const startDate = moment(params.startDate);
        const endDate = moment(params.endDate);

        startDate.isValid() ? period.startDate = startDate.format("MMMM") : period.startDate = "";
        endDate.isValid() ? period.endDate = endDate.format("MMMM, YYYY") : period.endDate = "" ;
        return period;
    }

    render() {
        const { action } = this.props;
        const { translatedDescription, translatedTitle, isDetailsAccordionOpen, originalActionLang } = this.state;

        return (
            <div className="action-card">
                <div className="action-top-details">
                    <Row>
                        <Col md="4">
                            <Card className="action-img">
                                <CardImg top width="100%" src={action.image} alt="" />
                            </Card>
                        </Col>
                        <Col md="8">
                            <div className="action-card-body">
                                <div className="action-content">
                                    <p className="action-time">
                                        {moment(action.time).format("MMMM, YYYY")}
                                        {" "}
                                        <span>&#124;</span>
                                    </p>
                                    <p className="action-area">
                                        {" "}
                                        {`${action.location}, ${action.country}`}
                                        {" "}
                                        <span>&#124;</span>
                                    </p>
                                    <p className="action-sector">
                                        {" "}
                                        {`${action.service_type}`}
                                    </p>   
                                </div>

                                <div className="action-details" lang={this.generateTranslationMarkUp()}>
                                    <h3 className="action-title">{translatedTitle || action.title}</h3>
                                    <br />
                                    <p className="action-author">
                                        {i18n.t("actionFeed.by")}
                                        {" "}
                                        {action.implementor}
                                    </p>
                                    <p className="action-desc">{convert(translatedDescription || action.description)}</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                {i18n.language !== action.action_feed_language
                && (
                    <>
                        <div className="translation-container">
                            <div className="text">
                                <span
                                    className="show-original"
                                    role="presentation"
                                    onClick={() => {
                                        this.toggleDetailsAccordion();
                                    }}
                                >
                                    {isDetailsAccordionOpen ? i18n.t("actionFeed.hideOriginal") : i18n.t("actionFeed.showOriginal")}
                                    {" "}
                                    {originalActionLang}
                                    {" "}
                                    {i18n.t("actionFeed.action")}
                                </span>
                            </div>
                            <div className="google-badge">
                                <a href="https://translate.google.com/" rel="noopener noreferrer" target="_blank">
                                    <img src={googleTranslateBadge} alt="" />
                                </a>
                            </div>
                        </div>
                        {isDetailsAccordionOpen
                        && (
                            <div className="ideafeed-item-details">
                                <div className="ideafeed-item-details-idea">
                                    <div className="header">
                                        <span className="header-text">Action as captured</span>
                                    </div>
                                    <p className="show-original-idea title">
                                        {`${action.title}:`}
                                    </p>
                                    <p className="show-original-idea description">
                                        {convert(action.description)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}

                <div className="action-footer">
                    <Row>
                        <Col xs="8">
                            <div className="footer-desc">
                                <p>
                                    {i18n.t("actionFeed.actionTaken")}
                                    {" "}
                                    {`"${action.tag}"`}
                                    {" "}
                                    {i18n.t("actionFeed.during")}
                                    {" "}
                                    {`${this.formatStartEndIdeafeedDates().startDate} - ${this.formatStartEndIdeafeedDates().endDate}`}
                                </p>
                            </div>

                        </Col>
                        <Col xs="4">
                            <div className="action-links">
                                <a className="action-icon" href={action.source} target="_blank" rel="noopener noreferrer">
                                    <span className="footer-text">
                                        {i18n.t("actionFeed.view")}
                                        {" "}
                                        {action.ideas_count}
                                        {i18n.t("actionFeed.ideas")}
                                    </span>
                                    <FontAwesomeIcon icon="arrow-right" />
                                </a>
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
};

ActionFeedCard.propTypes = {
    action: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ActionFeedCard;

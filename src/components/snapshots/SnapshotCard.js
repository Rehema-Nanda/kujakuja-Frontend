import React from "react";
import PropTypes from "prop-types";
import i18n from "i18next";
import "./Snapshots.css";
import "./pie-wrapper.css";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ServiceTypeListItem from "./ServiceTypeListItem";
import SnapshotCardDates from "./SnapshotCardDates";

import AppConfig from "../../AppConfig";

const googleTranslateKey = AppConfig.GOOGLE_TRANSLATE_API_KEY;
const googleTranslate = require("google-translate")(googleTranslateKey);
const googleTranslateBadge = require("../../img/google_translate_greyscale.svg");

export default class SnapshotCard extends React.Component {
    defaultCloseButtonText = `${i18n.t("snapshots.snapshotCard.closeCard")}`;

    defaultSeeDetailsButtonText = `${i18n.t("snapshots.snapshotCard.seeDetails")}`;

    alternateButtonsTextForDownload = `${i18n.t("snapshots.snapshotCard.altBtnText")}`;

    constructor(props) {
        super(props);

        const { snapshot } = this.props;

        this.state = {
            pointsWithTenOrMoreResponses: null,
            allServicePoints: null,
            highestRatedServicePoint: null,
            lowestRatedServicePoint: null,
            cardHeight: "fixed",
            closeButtonText: this.defaultCloseButtonText,
            seeDetailsButtonText: this.defaultSeeDetailsButtonText,
            downloading: false,
            serviceTypesTopThree: [...snapshot.serviceTypes].slice(0, 3),
            isDetailsCardOpen: false,
            translatedFeaturedIdea: "",
            detectedLanguage: "",
            showOriginalFeaturedIdea: false,
        };
    }

    async componentDidMount() {
        await this.detectLanguageAndTranslateFeaturedIdeas();
    }

    componentDidUpdate(prevProps) {
        const { snapshot } = this.props;
        const { isDetailsCardOpen } = this.state;

        if (prevProps.snapshot !== snapshot) {
            if (isDetailsCardOpen) {
                this.closeCard();
            }
            else {
                this.setState({ serviceTypesTopThree:[...snapshot.serviceTypes].slice(0, 3) });
            }
        }
    }

    async getServicePoints() {
        const { snapshot, getServicePoints } = this.props;

        await getServicePoints(snapshot);
        const pointsWithTenOrMoreResponses = snapshot.servicePoints.filter((point) => point.responses >= 10);

        this.setState({
            pointsWithTenOrMoreResponses: [...pointsWithTenOrMoreResponses.sort((a, b) => b.average - a.average)],
            allServicePoints: [...snapshot.servicePoints.sort((a, b) => b.average - a.average).sort((a, b) => b.responses - a.responses)],
            highestRatedServicePoint: pointsWithTenOrMoreResponses.length ? pointsWithTenOrMoreResponses[0] : null,
            lowestRatedServicePoint: pointsWithTenOrMoreResponses.length ? pointsWithTenOrMoreResponses[pointsWithTenOrMoreResponses.length - 1] : null,
            cardHeight: "auto",
            serviceTypesTopThree: [...snapshot.serviceTypes],
            isDetailsCardOpen: true,
        });
    }

    static getSummaryColor(average, responses) {
        if (parseFloat(average) >= 50.0) {
            return responses >= 10 ? "#00BA54" : "#888A8E";
        }
        return responses >= 10 ? "#F8382B" : "#888A8E";
    }

    static getSummaryFontColor(responses) {
        return responses >= 10 ? "#000000" : "#808080";
    }

    static getSummaryTitle(serviceEntity) {
        if (serviceEntity.responses >= 10) {
            return `${serviceEntity.average.toFixed(serviceEntity.average === 100 ? 0 : 1)}% | 🙂 ${serviceEntity.satisfied} | 😐 ${serviceEntity.responses - serviceEntity.satisfied}`;
        }
        return `🙂 ${serviceEntity.satisfied} | 😐 ${serviceEntity.responses - serviceEntity.satisfied}`;
    }

    static getDeltaArrow(delta) {
        if (parseFloat(delta) >= 0.0) {
            return "arrow-up";
        }
        return "arrow-down";
    }

    detectLanguageAndTranslateFeaturedIdeas = async () => {
        const { snapshot: { featured_idea } } = this.props;
        const currentLang = i18n.language;

        if (featured_idea === null) {
            return;
        }

        googleTranslate.detectLanguage(featured_idea, (err, detection) => {
            if (err) {
                return;
            }
            this.setState({ detectedLanguage: detection.language });
        });

        googleTranslate.translate(featured_idea, currentLang, (err, translate) => {
            if (err) {
                return;
            }
            this.setState({ translatedFeaturedIdea: translate.translatedText });
        });
    }

    toggleOriginalFeaturedIdea = () => {
        const { showOriginalFeaturedIdea } = this.state;

        this.setState({ showOriginalFeaturedIdea: !showOriginalFeaturedIdea });
    }

    closeCard() {
        const { snapshot } = this.props;

        this.setState({
            pointsWithTenOrMoreResponses: null,
            allServicePoints: null,
            highestRatedServicePoint: null,
            lowestRatedServicePoint: null,
            cardHeight: "fixed",
            serviceTypesTopThree: [].concat(snapshot.serviceTypes || []).slice(0, 3),
            isDetailsCardOpen: false,
        });
    }

    async startDownloadSnapshotCard() {
        this.setState({
            downloading: true,
            closeButtonText: this.alternateButtonsTextForDownload,
            seeDetailsButtonText: this.alternateButtonsTextForDownload,
        }, async () => {
            // wait until call-stack empty before invoking 'domtoimage' in parent component,
            // to allow UI to refresh based on state changes
            setTimeout(async () => {
                const {
                    dateStart, dateEnd, snapshot: { region: { name, parent_name, id } },
                    downloadSnapshotCard,
                } = this.props;
                const startDate = dateStart.format("ddd MMM DD YYYY");
                const endDate = dateEnd.format("ddd MMM DD YYYY");
                const toDate = startDate !== endDate ? ` to ${endDate}` : "";
                const snapShotDownloadName = `${name}, ${parent_name || ""} - ${startDate}${toDate}`;
                await downloadSnapshotCard(id, snapShotDownloadName);
                this.setState({
                    downloading: false,
                    closeButtonText: this.defaultCloseButtonText,
                    seeDetailsButtonText: this.defaultSeeDetailsButtonText,
                });
            }, 0);
        });
    }

    render() {
        const {
            highestRatedServicePoint,
            lowestRatedServicePoint,
            cardHeight,
            downloading,
            pointsWithTenOrMoreResponses,
            allServicePoints,
            seeDetailsButtonText,
            serviceTypesTopThree,
            closeButtonText,
            translatedFeaturedIdea,
            detectedLanguage,
            showOriginalFeaturedIdea,
        } = this.state;

        const {
            snapshot,
            singleDay,
            dateStart,
            dateEnd,
        } = this.props;

        const currentLang = i18n.language;
        const previousVisibility = snapshot.previous.responses ? "visible" : "hidden";
        let intervalAverage = parseFloat(snapshot.interval.average) >= 50.0 ? "happy" : "unhappy";
        let previousAverage = parseFloat(snapshot.previous.average) >= 50.0 ? "happy" : "unhappy";
        let nextAverage = parseFloat(snapshot.next.average) >= 50.0 ? "happy" : "unhappy";

        if ((snapshot.previous.responses || 0) < 10) {
            previousAverage = "insignificant";
        }
        if ((snapshot.interval.responses || 0) < 10) {
            intervalAverage = "insignificant";
        }
        if ((snapshot.next.responses || 0) < 10) {
            nextAverage = "insignificant";
        }

        return (
            <div
                id={snapshot.region.id}
                className={`col-sm snapshots-card ${cardHeight === "fixed" ? "fixed-height" : "auto-height"}
                ${downloading && "downloading"}`}
            >
                <div className="title">
                    {snapshot.region.name}
                    ,
                    {" "}
                    {snapshot.region.parent_name || ""}
                    <p className="subtitle">
                        <span className={`${singleDay && "hidden"}`}>
                            {dateStart.format("ddd DD MMM YYYY")}
                            {" "}
                            ➝
                            {" "}
                            {dateEnd.format("ddd DD MMM YYYY")}
                        </span>
                        <span className={`${!singleDay && "hidden"}`}>{dateStart.format("ddd DD MMM YYYY")}</span>
                    </p>
                </div>

                <div className="featured-idea">
                    <h3>{i18n.t("snapshots.snapshotCard.title")}</h3>
                    <p className={`${!snapshot.featured_idea && "no-featured-idea"} `}>
                        {(!detectedLanguage || detectedLanguage === currentLang || showOriginalFeaturedIdea ? snapshot.featured_idea : translatedFeaturedIdea)
                        || `**${i18n.t("snapshots.snapshotCard.noIdead")} ${singleDay ? i18n.t("snapshots.snapshotCard.day") : i18n.t("snapshots.snapshotCard.period")}**`}
                    </p>
                </div>
                {detectedLanguage && detectedLanguage !== currentLang && snapshot.featured_idea !== null
                && (
                    <div className="google-badge">
                        <span className="text" onClick={this.toggleOriginalFeaturedIdea}>
                            {showOriginalFeaturedIdea ? i18n.t("snapshots.snapshotCard.showTranslation") : i18n.t("snapshots.snapshotCard.showOriginal")}
                        </span>

                        {!showOriginalFeaturedIdea
                        && (
                            <a href="http://translate.google.com/" rel="noopener noreferrer" target="_blank" className="badge">
                                <img src={googleTranslateBadge} alt="" />
                            </a>
                        )}
                    </div>
                )}

                <div className="d-flex justify-content-center">

                    <div
                        title={SnapshotCard.getSummaryTitle(snapshot.previous)}
                        className="previous-size right"
                        style={{ visibility: previousVisibility }}
                    >
                        <div className={`pie-wrapper progress-${(snapshot.previous.responses || 0) < 10 ? 100 : snapshot.previous.average.toFixed(0)} style-2`}>
                            <span className="label numbers_small numbers-small-card left-right-caption">

                                {(snapshot.previous.responses || 0) >= 10 && snapshot.previous.average.toFixed(snapshot.previous.average === 100 ? 0 : 1)}
                                {(snapshot.previous.responses || 0) < 10 && snapshot.previous.responses}

                                <span
                                    style={{ display: (snapshot.previous.responses || 0) >= 10 ? 'inline' : 'none'}}
                                    className="smaller"
                                >
                                    %
                                </span>
                                <span
                                    style={{ display: (snapshot.previous.responses || 0) < 10 ? 'block' : 'none'}}
                                    className="smaller-responses previous-next"
                                >
                                    response
                                    <span>{(snapshot.previous.responses || 0) !== 1 && 's'}</span>
                                </span>

                            </span>
                            <div className="pie">
                                <div className={`left-side half-circle ${previousAverage} left-right-pie`} />
                                <div className={`right-side half-circle ${previousAverage} left-right-pie`} />
                            </div>
                            <div className="pie-shadow left-right-pie" />
                        </div>
                        <SnapshotCardDates
                            singleDay={singleDay}
                            start={moment.utc(snapshot.previous.start)}
                            end={moment.utc(snapshot.previous.end).subtract(1, "days")} // subtracting a day because snapshot.previous.end is exclusive.
                        />
                    </div>

                    <div
                        title={SnapshotCard.getSummaryTitle(snapshot.interval)}
                        className="region-size"
                    >
                        <div className={`pie-wrapper large progress-${(snapshot.interval.responses || 0) < 10 ? 100 : snapshot.interval.average.toFixed(0)} style-2`}>
                            <span className="label numbers_small numbers-small-card">

                                {(snapshot.interval.responses || 0) >= 10 && snapshot.interval.average.toFixed(snapshot.interval.average === 100 ? 0 : 1)}
                                {(snapshot.interval.responses || 0) < 10 && snapshot.interval.responses}

                                <span
                                    style={{ display: (snapshot.interval.responses || 0) >= 10 ? "inline" : "none" }}
                                    className="smaller"
                                >
                                    %
                                </span>
                                <span
                                    style={{ display: (snapshot.interval.responses || 0) < 10 ? "block" : "none" }}
                                    className="smaller-responses"
                                >
                                    response
                                    <span>{(snapshot.interval.responses || 0) !== 1 && 's'}</span>
                                </span>
                            </span>
                            <div className="pie">
                                <div className={`left-side half-circle ${intervalAverage}`} />
                                <div className={`right-side half-circle ${intervalAverage}`} />
                            </div>
                            <div className="pie-shadow" />
                            <p
                                id={`current-delta${snapshot.region.id}`}
                                className={`current-delta ${parseFloat(snapshot.interval.delta) === 0 && "no-delta-difference"}`}
                            >
                                <FontAwesomeIcon
                                    style={{
                                        fontSize: "0.4rem",
                                        visibility: (snapshot.interval.responses || 0) < 10
                                        || parseFloat(snapshot.interval.delta) === 0
                                        || snapshot.interval.delta === null ? "hidden" : "visible",
                                    }}
                                    icon={SnapshotCard.getDeltaArrow(snapshot.interval.delta)}
                                />
                                <span
                                    style={{
                                        display: (snapshot.interval.responses || 0) < 10
                                        || parseFloat(snapshot.interval.delta) === 0
                                        || snapshot.interval.delta === null ? "none" : "inline",
                                    }}
                                >
                                    {Math.abs(snapshot.interval.delta || 0).toFixed(1)}
                                    %
                                </span>
                                <span style={{
                                    paddingLeft: "12px",
                                    display: (snapshot.interval.responses || 0) >= 10
                                    && (parseFloat(snapshot.interval.delta) === 0
                                        || snapshot.interval.delta === null) ? "inline" : "none",
                                }}
                                >
                                    -
                                </span>
                            </p>
                        </div>
                        <SnapshotCardDates
                            singleDay={singleDay}
                            start={dateStart}
                            end={dateEnd}
                        />
                    </div>

                    <div
                        title={SnapshotCard.getSummaryTitle(snapshot.next)}
                        className="previous-size left"
                        style={{ visibility: !snapshot.next.responses ? "hidden" : "visible" }}
                    >
                        <div className={`pie-wrapper progress-${(snapshot.next.responses || 0) < 10 ? 100 : snapshot.next.average.toFixed(0)} style-2`}>
                            <span className="label numbers_small numbers-small-card left-right-caption">

                                {(snapshot.next.responses || 0) >= 10 && snapshot.next.average.toFixed(snapshot.next.average === 100 ? 0 : 1)}
                                {(snapshot.next.responses || 0) < 10 && snapshot.next.responses}

                                <span
                                    style={{ display: (snapshot.next.responses || 0) >= 10 ? "inline" : "none" }}
                                    className="smaller"
                                >
                                    %
                                </span>
                                <span
                                    style={{ display: (snapshot.next.responses || 0) < 10 ? "block" : "none" }}
                                    className="smaller-responses previous-next"
                                >
                                    response
                                    <span>{(snapshot.next.responses || 0) !== 1 && 's'}</span>
                                </span>

                            </span>
                            <div className="pie">
                                <div className={`left-side half-circle ${nextAverage} left-right-pie`} />
                                <div className={`right-side half-circle ${nextAverage} left-right-pie`} />
                            </div>
                            <div className="pie-shadow left-right-pie" />
                        </div>
                        <SnapshotCardDates
                            singleDay={singleDay}
                            start={moment.utc(snapshot.next.start)}
                            end={moment.utc(snapshot.next.end).subtract(1, "days")} // subtracting a day because snapshot.next.end is exclusive.
                        />
                    </div>

                </div>

                <div className={`${pointsWithTenOrMoreResponses ? "service-types-all" : "service-types"}`}>
                    <h3>{i18n.t("snapshots.snapshotCard.servicesRated")}</h3>
                    {serviceTypesTopThree.map((serviceType) => (
                        <ServiceTypeListItem
                            key={serviceType.service_type_id.toString()}
                            serviceTypeName={serviceType.service_type_name}
                            responses={serviceType.responses}
                            average={serviceType.average}
                            satisfied={serviceType.satisfied}
                            delta={serviceType.delta}
                        />
                    ))}
                </div>

                <div style={{ display: !pointsWithTenOrMoreResponses ? "block" : "none" }}>
                    <button
                        type="button"
                        onClick={() => this.getServicePoints()}
                        className={`btn btn-dark show-details ${downloading && "no-text-transform"}`}
                    >
                        {seeDetailsButtonText}
                    </button>
                </div>

                {
                    highestRatedServicePoint
                    && (
                        <div className={`d-flex highest-lowest-service-point ${highestRatedServicePoint.average > 49 ? "highest-service-point" : "lowest-service-point"}`}>
                            <div className="p-2 average">
                                <span>
                                    {highestRatedServicePoint.average.toFixed(highestRatedServicePoint.average === 100 ? 0 : 1)}
                                    <span className="percent">%</span>
                                </span>
                            </div>
                            <div className="p-2 name">
                                <div className="service-point-highest-lowest">{highestRatedServicePoint.service_point_name}</div>
                                <div className="explanation">{i18n.t("snapshots.snapshotCard.highestRatedSp")}</div>
                            </div>
                        </div>
                    )
                }

                {
                    lowestRatedServicePoint
                    && (
                        <div className={`d-flex highest-lowest-service-point ${lowestRatedServicePoint.average < 50 ? "lowest-service-point" : "highest-service-point"}`}>
                            <div className="p-2 average">
                                {lowestRatedServicePoint.average.toFixed(lowestRatedServicePoint.average === 100 ? 0 : 1)}
                                <span className="percent">%</span>
                            </div>
                            <div className="p-2 name">
                                <div className="service-point-highest-lowest">{lowestRatedServicePoint.service_point_name}</div>
                                <div className="explanation">{i18n.t("snapshots.snapshotCard.lowestRatedSp")}</div>
                            </div>
                        </div>
                    )
                }

                {
                    allServicePoints
                    && (
                        <div className="service-points-parent">
                            <h3>{i18n.t("snapshots.snapshotCard.spCovered")}</h3>
                            <div className="service-points">
                                {allServicePoints.map((servicePoint) => (
                                    <div
                                        style={{ color: SnapshotCard.getSummaryFontColor(servicePoint.responses) }}
                                        title={SnapshotCard.getSummaryTitle(servicePoint)}
                                        key={servicePoint.service_point_id}
                                        className="service-point-list-item"
                                    >
                                        <div className="summary-circle" style={{ backgroundColor: SnapshotCard.getSummaryColor(servicePoint.average, servicePoint.responses) }} />
                                        <span>
                                            {servicePoint.service_point_name}
                                            {" "}
                                            ({servicePoint.responses})
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

                {
                    pointsWithTenOrMoreResponses
                    && (
                        <div>
                            <button
                                type="button"
                                onClick={() => this.closeCard()}
                                className={`btn btn-dark show-details ${downloading && "no-text-transform"}`}
                                style={{ marginBottom: "15px" }}
                            >
                                {closeButtonText}
                            </button>
                        </div>
                    )
                }

                <div>
                    <button
                        type="button"
                        onClick={() => this.startDownloadSnapshotCard()}
                        className={`btn btn-link download ${downloading && "hidden"}`}
                    >
                        {i18n.t("snapshots.snapshotCard.download")}
                        {" "}
                        .png
                    </button>
                </div>

            </div>
        );
    }
}

SnapshotCard.propTypes = {
    snapshot: PropTypes.objectOf(PropTypes.any),
    getServicePoints: PropTypes.func,
    dateStart: PropTypes.instanceOf(moment),
    dateEnd: PropTypes.instanceOf(moment),
    downloadSnapshotCard: PropTypes.func,
    singleDay: PropTypes.bool,
};

SnapshotCard.defaultProps = {
    snapshot: null,
    getServicePoints: null,
    dateStart: null,
    dateEnd: null,
    downloadSnapshotCard: null,
    singleDay: false,
};

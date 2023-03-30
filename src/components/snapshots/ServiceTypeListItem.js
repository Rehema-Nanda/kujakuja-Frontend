import React from "react";
import "./Snapshots.css";
import "./pie-wrapper.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import i18n from "i18next";
import SnapshotCard from "./SnapshotCard";

export default class ServiceTypeListItem extends React.Component {

    getSummaryColor(average, responses) {

        if (responses < 10) {
            return "#888A8E";
        }

        if (parseFloat(average) >= 50.0) {
            return "#00BA54";
        }
        return "#F8382B";
    }

    getDeltaArrow (delta) {
        if ( parseFloat(delta) >= 0.0 ) return "arrow-up";
        return "arrow-down";
    }

    getIconPath (serviceTypeName) {
        switch (serviceTypeName) {
            case "Community Pulse":
                return require("../../img/icons/community_off.svg");
            case "Group Activities":
                return require("../../img/icons/groupactivities_off.svg");
            case "Healthcare":
                return require("../../img/icons/health_off.svg");
            case "Livelihoods":
                return require("../../img/icons/livelihood_off.svg");
            case "Nutrition":
                return require("../../img/icons/nutrition_off.svg");
            case "Protection":
                return require("../../img/icons/protection_off.svg");
            case "Shelter":
                return require("../../img/icons/shelter_off.svg");
            case "Water":
                return require("../../img/icons/water_off.svg");
            case "Cash Transfer":
                return require("../../img/icons/cash_off.svg");
            case "Legal Advice":
                return require("../../img/icons/legal_off.svg");
            case "Waiting Room":
                return require("../../img/icons/health_off.svg");
            case "Pharmacy":
                return require("../../img/icons/health_off.svg");
            case "Education":
                return require("../../img/icons/education_off.svg");
            case "Energy":
                return require("../../img/icons/energy_off.svg");
            case "Food":
                return require("../../img/icons/food_off.svg");
            case "MHPSS":
                return require("../../img/icons/mhpss_off.svg");
            default:
                return require("../../img/icons/generic_off.svg");
        }
    }

    render() {
        const { serviceTypeName, average, delta, responses, satisfied } = this.props;

        return (
            <div title={SnapshotCard.getSummaryTitle({responses, average, satisfied})} className="row service-type-container">

                <div className="container">
                    <div className="row">
                        <div className="col-2 icon">
                            <img className="service-type-icon" alt={serviceTypeName} src={this.getIconPath(serviceTypeName.trim())} />
                        </div>
                        <div className="col-5 service-title">
                            {i18n.t(`serviceTypes.${serviceTypeName}`)}
                        </div>
                        <div className="col-5">
                            <div className="summary-circle" style={{ backgroundColor: this.getSummaryColor(average, responses) }} />
                            <span className={`average ${responses < 10 && 'insignificant'}`}>{responses >= 10 ? `${average.toFixed(average === 100 ? 0 : 1)}%` : `${responses} response${responses !== 1 ? 's' : ''}`}</span>
                            { responses >= 10
                            && (
                                    <span
                                    className={`${parseFloat(delta) === 0 || !delta ? "no-delta-difference" : ""}`}
                                    style={{ marginLeft: '13px', display: Number.isNaN(delta) ? "none" : "" }}
                                    >
                                    <FontAwesomeIcon
                                    style={{ fontSize: "0.4rem", visibility: parseFloat(delta) === 0 || !delta ? "hidden" : "visible" }}
                                    icon={this.getDeltaArrow(delta)}
                                    />
                                    <span style={{ visibility: parseFloat(delta) === 0 || !delta ? "hidden" : "visible" }}>{Math.abs(delta || 0).toFixed(0)}
                                    %
                                    </span>
                                    <span style={{ display: parseFloat(delta) === 0 || !delta ? "inline" : "none" }}>-</span>
                                    </span>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

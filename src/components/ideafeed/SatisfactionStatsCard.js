import React, { Component } from "react";
import i18n from "i18next";
import PropTypes from "prop-types";

const satisfiedFace = require("../../img/face_satisfied.svg");
const unsatisfiedFace = require("../../img/face_unsatisfied.svg");

class SatisfactionStatsCard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            unsatisfiedIdeaCount: 0,
            satisfiedPercentage: 0,
        };
    }

    componentDidMount() {
        this.getSatisfactionStats();
    }

    componentDidUpdate(prevProps) {
        const { ideasCount, satisfiedIdeaCount } = this.props;
        if (prevProps.ideasCount !== ideasCount || prevProps.satisfiedIdeaCount !== satisfiedIdeaCount) {
            this.getSatisfactionStats();
        }
    }

    getSatisfactionStats = () => {
        const { ideasCount, satisfiedIdeaCount } = this.props;
        const unsatisfiedCount = ideasCount - satisfiedIdeaCount;
        const satisfiedPercentage = ((satisfiedIdeaCount / ideasCount) * 100).toFixed(1);
        this.setState({
            satisfiedPercentage: satisfiedPercentage,
            unsatisfiedIdeaCount: unsatisfiedCount,
        });
    };

    render() {
        const { satisfiedPercentage, unsatisfiedIdeaCount } = this.state;
        const { satisfiedIdeaCount } = this.props;

        const roundedSatisfiedPercentage = Math.round(satisfiedPercentage);

        return (
            <div className="satisfaction-stats">
                <div className="header">{ i18n.t("ideafeed.statsCardHeader") }</div>
                <div className="stats">
                    <div className="stats-pie">
                        <div className={`pie-wrapper progress-${roundedSatisfiedPercentage} style-2`}>
                            <span className="label numbers_small numbers-small-card left-right-caption">
                                {satisfiedPercentage}
                                <span className="smaller">%</span>
                            </span>
                            <div className="pie">
                                <div
                                    className={`left-side half-circle ${roundedSatisfiedPercentage} left-right-pie`}
                                />
                                <div
                                    className={`right-side half-circle ${roundedSatisfiedPercentage} left-right-pie`}
                                />
                            </div>
                            <div className="pie-shadow left-right-pie" />
                        </div>
                    </div>
                    <div className="stats-numbers">
                        <div>
                            <img src={satisfiedFace} alt="" />
                            <span>{satisfiedIdeaCount}</span>
                        </div>
                        <div>
                            <img src={unsatisfiedFace} alt="" />
                            <span>{unsatisfiedIdeaCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

SatisfactionStatsCard.propTypes = {
    ideasCount: PropTypes.number.isRequired,
    satisfiedIdeaCount: PropTypes.number.isRequired,
};

export default SatisfactionStatsCard;

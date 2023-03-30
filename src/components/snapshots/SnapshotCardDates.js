import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

const SnapshotCardDates = (props) => {
    const { singleDay, start, end } = props;
    const sameMonth = start.month() === end.month();
    if (singleDay) {
        return <p className="previous-next">{start.format('ddd D')}</p>;
    } else {
        return (
            <p className="previous-next">
                {start.format(`ddd D${!sameMonth ? ' MMM' : ''}`)}
            <br />
            ➝
                &nbsp;
                {end.format(`ddd D${!sameMonth ? ' MMM' : ''}`)}
            </p>
        );
    }
};

SnapshotCardDates.propTypes = {
    start: PropTypes.instanceOf(moment),
    end: PropTypes.instanceOf(moment),
    singleDay: PropTypes.bool,
};

export default SnapshotCardDates;

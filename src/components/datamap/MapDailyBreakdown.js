
import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MapDailyBreakdown = ({satisfaction, delta, date}) => {

    let facePath;
    let faceAlt;
    // let flag;

    //display happy/nothappy face
    if(parseFloat(satisfaction) === 0){
        facePath = require('../../img/face_nodata.svg');
        faceAlt = "No Data";
    }else if(parseFloat(satisfaction) < 50){
        facePath = require('../../img/face_unsatisfied.png');
        faceAlt = "unsatisfied";
    }else if(parseFloat(satisfaction) >= 50){
        facePath = require('../../img/face_satisfied.png');
        faceAlt = "satisfied";
    }



    const deltaArrow = delta > 0 ? "arrow-up": "arrow-down";
    const showSatisfaction = parseFloat(satisfaction) > 0;
    const showDelta = parseFloat(delta) !== 0;
    return(
        <div className="daily-breakdown">
        <div className="daily-container">
        <div className="daily-face"><img className="daily-face-img" src={facePath} alt={faceAlt}/></div>
        <div className="daily-percent">
            {showSatisfaction ?
            <span>
                <span className="numbers_small">{satisfaction}</span><sup>%</sup>
            </span>: <span className="numbers_small">--</span>}
        </div>
        <div className="daily-delta">
            {showDelta?
            <span>
                <sup><FontAwesomeIcon icon={deltaArrow}/></sup>
                <span className="numbers_super_small">{delta}</span>
                <sup>%</sup>
            </span>: <span className="numbers_super_small">-</span>}
        </div>
        <div className="daily-date">{date}</div>
        </div>
        </div>
    );

}

export default MapDailyBreakdown;

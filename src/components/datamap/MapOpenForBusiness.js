
import React from 'react';

import { Progress } from 'reactstrap';

const MapOpenForBusiness = (props) => {

    const minsStop = props.minsStop;

    let minsStart = props.minsStart;
    let minsOn = minsStop - minsStart;
    //let minsOff = 1440 - minsStop;

    let startPercent = Math.floor(minsStart/1440*100); //9%
    let onPercent = Math.floor(minsOn/1440*100); //42%
    let offPercent = 100 - (startPercent + onPercent);

    let date = props.date.split('-');

    return(
        <div className="business-item">
        <div className="business-item-date"><p className="small_center">{date[1]}/{date[2]}</p></div>
        <div className="business-item-bar">
        <Progress multi className="business-bar">
        <Progress bar className="business-bar-bg" value={startPercent} />
        <Progress bar className="business-bar-color" value={onPercent} />
        <Progress bar className="business-bar-bg" value={offPercent} />
        </Progress>
        </div>
        </div>
    );

}

export default MapOpenForBusiness;

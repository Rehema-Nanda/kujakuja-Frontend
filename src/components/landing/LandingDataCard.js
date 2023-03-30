
import React from 'react';
import { Route } from 'react-router-dom';
import PropTypes from 'prop-types';

import FlagIconFactory from 'react-flag-icon-css';
import ReactMapboxGl from "react-mapbox-gl";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ReactGA from 'react-ga';

import './LandingDataCard.css';

const Map = ReactMapboxGl({
    accessToken: "pk.eyJ1IjoiYmFycnlsYWNoYXBlbGxlIiwiYSI6IkVkT1FZX2MifQ.sSg105ALmN6eQgutNxWTOA",
    doubleClickZoom: false,
    touchZoomRotate: false,
    dragPan: false,
    scrollZoom: false,
    interactive: false
});

const LandingDataCard = (props) => {

    const FlagIcon = FlagIconFactory(React, { useCssModules: false })
    let facePath;
    let faceAlt;
    let deltaArrow;
    let deltaNum;
    // let flag;

    //display happy/nothappy face
    if(props.satisfaction >= 50){
        facePath = require('../../img/face_satisfied.svg');
        faceAlt = "satisfied";
    }else if(props.satisfaction === 0){
        facePath = require('../../img/face_nodata.svg');
        faceAlt = "no data";
    }else{
        facePath = require('../../img/face_unsatisfied.svg');
        faceAlt = "unsatisfied";
    }

    //display delta arrow
    deltaNum = props.delta;

    if(Math.sign(deltaNum) === 1){
        deltaArrow = "arrow-up";
    }else{
        deltaArrow = "arrow-down";
        deltaNum = deltaNum *= -1;
    }

    return (


        <div className="data-card">
            <div className="data-card-face"><img src={facePath} alt={faceAlt}/></div>
            <div className="data-card-map">

                <Map
                    containerStyle={{
                        height: "100%",
                        width: "100%",
                    }}
                    // eslint-disable-next-line
                    style={"mapbox://styles/mapbox/streets-v9"}
                    center={props.mapCenter}
                    className={"data-card-map"}
                    zoom={[4]} />

                <div className="data-card-flag"><FlagIcon code={props.flag} size="2x" className="flag-icon"/></div>
            </div>
            <div className="data-card-details">

                <div className="data-container">
                <div className="data-container-value"><span className="numbers_small">{props.satisfaction}</span><sup>%</sup></div>
                <div className="data-container-label"><p className="small_center">satisfied</p></div>
                </div>

                <div className="data-container data-container-two">
                <div className="data-container-value"><sup><FontAwesomeIcon icon={deltaArrow}/></sup><span className="numbers_small">{deltaNum}</span><sup>%</sup></div>
                <div className="data-container-label"><p className="small_center">from last week</p></div>
                </div>

            </div>
            <div className="data-card-button-holder">
                <Route render={({ history}) => (
                    <button className="primary" onClick={() => { props.selectLocation(props.id, "Countries", true); history.push('/datamap'); ReactGA.event({ category: window.location.pathname, action: 'Clicked on Data Card' }) }}>See {props.country} Data</button>
                )} />
            </div>
        </div>



    );

}

export default LandingDataCard;

LandingDataCard.propTypes = {
    satisfaction: PropTypes.number.isRequired,
    delta: PropTypes.number.isRequired,
    country: PropTypes.string.isRequired,
    mapCenter: PropTypes.array.isRequired,
}

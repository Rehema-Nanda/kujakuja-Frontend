import React from 'react';

import AppConfig from '../../AppConfig';

const MapLocationImage = (props) => {
    let imageUrl = `https://storage.googleapis.com/${AppConfig.GCP_PROJECT_ID}-public/gallery/`;

    if (props.selectedLocation) {
        imageUrl += `settlements/${props.selectedLocation}/${props.imageSize}.jpg`;
    }
    else if (props.selectedPoint) {
        imageUrl += `service_points/${props.selectedPoint}/${props.imageSize}.jpg`;
    }
    else {
        imageUrl = '';
    }

    return (
        <div className={`gallery-image-container ${props.className ? props.className : ''}`}>
            <img src={imageUrl} alt="" />
        </div>
    )
};

export default MapLocationImage;

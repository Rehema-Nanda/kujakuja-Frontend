import React from 'react';
import GlobalFilterServiceButton from './GlobalFilterServiceButton';
import i18n from "i18next";
import './GlobalFilter.css';

export default class GlobalFilterServices extends React.Component {

    render() {

        const serviceTypeImages = new Map();

        serviceTypeImages.set('water', {
            on : require('../../img/icons/water_on.svg'),
            off : require('../../img/icons/water_off.svg')
        });
        serviceTypeImages.set('protection', {
            on : require('../../img/icons/protection_on.svg'),
            off : require('../../img/icons/protection_off.svg')
        });
        serviceTypeImages.set('livelihoods', {
            on : require('../../img/icons/livelihood_on.svg'),
            off : require('../../img/icons/livelihood_off.svg')
        });
        serviceTypeImages.set('shelter', {
            on : require('../../img/icons/shelter_on.svg'),
            off : require('../../img/icons/shelter_off.svg')
        });
        serviceTypeImages.set('nutrition', {
            on : require('../../img/icons/nutrition_on.svg'),
            off : require('../../img/icons/nutrition_off.svg')
        });
        serviceTypeImages.set('healthcare', {
            on : require('../../img/icons/health_on.svg'),
            off : require('../../img/icons/health_off.svg')
        });
        serviceTypeImages.set('community pulse', {
            on : require('../../img/icons/community_on.svg'),
            off : require('../../img/icons/community_off.svg')
        });
        serviceTypeImages.set('group activities', {
            on : require('../../img/icons/groupactivities_on.svg'),
            off : require('../../img/icons/groupactivities_off.svg')
        });
        serviceTypeImages.set('cash transfer', {
            on : require('../../img/icons/cash_on.svg'),
            off : require('../../img/icons/cash_off.svg')
        });
        serviceTypeImages.set('legal advice', {
            on : require('../../img/icons/legal_on.svg'),
            off : require('../../img/icons/legal_off.svg')
        });
        serviceTypeImages.set('waiting room', {
            on : require('../../img/icons/health_on.svg'),
            off : require('../../img/icons/health_off.svg')
        });
        serviceTypeImages.set('pharmacy', {
            on : require('../../img/icons/health_on.svg'),
            off : require('../../img/icons/health_off.svg')
        });
        serviceTypeImages.set('education', {
            on : require('../../img/icons/education_on.svg'),
            off : require('../../img/icons/education_off.svg')
        });
        serviceTypeImages.set('energy', {
            on : require('../../img/icons/energy_on.svg'),
            off : require('../../img/icons/energy_off.svg')
        });
        serviceTypeImages.set('food', {
            on : require('../../img/icons/food_on.svg'),
            off : require('../../img/icons/food_off.svg')
        });
        serviceTypeImages.set('mhpss', {
            on : require('../../img/icons/mhpss_on.svg'),
            off : require('../../img/icons/mhpss_off.svg')
        });
        serviceTypeImages.set("mental health", {
            on: require("../../img/icons/mhpss_on.svg"),
            off: require("../../img/icons/mhpss_off.svg"),
        });
        serviceTypeImages.set('other', {
            on : require('../../img/icons/generic_on.svg'),
            off : require('../../img/icons/generic_off.svg')
        });
        serviceTypeImages.set("nutrición", {
            on: require("../../img/icons/nutrition_on.svg"),
            off: require("../../img/icons/nutrition_off.svg"),
        });
        serviceTypeImages.set("sala de espera", {
            on: require("../../img/icons/waiting_rooms_on.svg"),
            off: require("../../img/icons/waiting_rooms_off.svg"),
        });
        serviceTypeImages.set("farmacia", {
            on: require("../../img/icons/pharmacy_on.svg"),
            off: require("../../img/icons/pharmacy_off.svg"),
        });
        serviceTypeImages.set("salud mental", {
            on: require("../../img/icons/mhpss_on.svg"),
            off: require("../../img/icons/mhpss_off.svg"),
        });
        serviceTypeImages.set("laboratorio", {
            on: require("../../img/icons/laboratory_on.svg"),
            off: require("../../img/icons/laboratory_off.svg"),
        });
        serviceTypeImages.set("consultorio medico", {
            on: require("../../img/icons/doctors_rooms_on.svg"),
            off: require("../../img/icons/doctors_rooms_off.svg"),
        });

        const serviceTypeButtons = (this.props.serviceTypes || []).map(serviceType => {

            const images = serviceTypeImages.get(serviceType.name.trim().toLowerCase()) || serviceTypeImages.get('other');

            return <GlobalFilterServiceButton
                key={serviceType.id}
                id={serviceType.id}
                tipId={`serviceType${serviceType.id}`}
                iconoff={images.off}
                iconon={images.on}
                name={ i18n.t(`serviceTypes.${serviceType.name}`) }
                toggleServiceType={this.props.toggleServiceType}
                selectedServiceTypes={this.props.selectedServiceTypes}
            />
        });

        return (
            <div>
                <div className="map-controls-service-container">
                    {serviceTypeButtons}
                </div>
            </div>
        );
    }

}

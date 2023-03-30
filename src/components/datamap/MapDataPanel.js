import React from "react";
import PropTypes from "prop-types";
import {
    Tooltip, Button, Collapse, Modal, ModalHeader, ModalBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import i18n from "i18next";
import ReactGA from "react-ga";
import MapDailyBreakdown from "./MapDailyBreakdown";
import MapThemeBubbles from "./MapThemeBubbles";
import MapLocationImage from "./MapLocationImage";
import { AuthContext } from "../../AuthContext";

const noDataFacePath = require("../../img/face_nodata.png");
const unsatisfiedFacePath = require("../../img/face_unsatisfied.png");
const satisfiedFacePath = require("../../img/face_satisfied.png");

export default class MapDataPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tooltipIsOpen: false,

            dailyBreakdownPanelIsOpen: true,
            themeBubblesPanelIsOpen: true,
            photoGalleryPanelIsOpen: true,

            themeBubblesModalShowing: false,
            photoGalleryModalShowing: false,
        };

        this.toggleTooltipState = this.toggleTooltipState.bind(this);
        this.toggleDailyBreakdownPanelState = this.toggleDailyBreakdownPanelState.bind(this);
        this.toggleThemeBubblesPanelState = this.toggleThemeBubblesPanelState.bind(this);
        this.togglePhotoGalleryPanelState = this.togglePhotoGalleryPanelState.bind(this);
        this.toggleThemeBubblesModal = this.toggleThemeBubblesModal.bind(this);
        this.togglePhotoGalleryModal = this.togglePhotoGalleryModal.bind(this);
    }

    ////////////////////////////////////////
    // component methods
    ////////////////////////////////////////

    toggleTooltipState = () => {
        const { tooltipIsOpen } = this.state;

        this.setState({
            tooltipIsOpen: !tooltipIsOpen,
        });
    };

    toggleDailyBreakdownPanelState = () => {
        const { dailyBreakdownPanelIsOpen } = this.state;

        this.setState({
            dailyBreakdownPanelIsOpen: !dailyBreakdownPanelIsOpen,
        });
    };

    toggleThemeBubblesPanelState = () => {
        const { themeBubblesPanelIsOpen } = this.state;

        this.setState({
            themeBubblesPanelIsOpen: !themeBubblesPanelIsOpen,
        });
    };

    togglePhotoGalleryPanelState = () => {
        const { photoGalleryPanelIsOpen } = this.state;

        this.setState({
            photoGalleryPanelIsOpen: !photoGalleryPanelIsOpen,
        });
    };

    toggleThemeBubblesModal = () => {
        const { themeBubblesModalShowing } = this.state;
        ReactGA.event({ category: window.location.pathname, action: "Theme Bubbles Toggle" });

        this.setState({
            themeBubblesModalShowing: !themeBubblesModalShowing,
        });
    };

    togglePhotoGalleryModal = () => {
        const { photoGalleryModalShowing } = this.state;
        ReactGA.event({ category: window.location.pathname, action: "Photo Gallery Toggle" });

        this.setState({
            photoGalleryModalShowing: !photoGalleryModalShowing,
        });
    };

    render() {
        const { isLoading } = this.context;

        const {
            dataPanelSatisfaction, dataPanelDelta, dataPanelThemeBubbles,
            selectedLocations, selectedServicePoints, dataPanelSelectedLocations,
            dataPanelDailyBreakdowns,
        } = this.props;

        const {
            themeBubblesModalShowing, photoGalleryModalShowing,
            tooltipIsOpen, dailyBreakdownPanelIsOpen, themeBubblesPanelIsOpen, photoGalleryPanelIsOpen,
        } = this.state;

        // hide/show data panel
        const dataPanelShowHide = isLoading ? "map-datapanel-hide" : "map-datapanel-show";

        // face icon
        let dataPanelFacePath;
        if (dataPanelSatisfaction === null) {
            dataPanelFacePath = noDataFacePath;
        }
        else if (parseFloat(dataPanelSatisfaction) < 50) {
            dataPanelFacePath = unsatisfiedFacePath;
        }
        else if (parseFloat(dataPanelSatisfaction) >= 50) {
            dataPanelFacePath = satisfiedFacePath;
        }

        // handle delta up/down arrow
        const dataPanelDeltaArrow = dataPanelDelta > 0 ? "arrow-up" : "arrow-down";
        const showDataPanelDelta = parseFloat(dataPanelDelta) !== 0;
        const showDataPanelSatisfaction = dataPanelSatisfaction !== null;

        return (

            <div>

                <div className="map-datapanel-desktop">
                    <Modal
                        isOpen={themeBubblesModalShowing}
                        toggle={this.toggleThemeBubblesModal}
                        className="themebubbles-modal"
                    >
                        <ModalHeader toggle={this.toggleThemeBubblesModal} charCode="&times;">
                            <p>{i18n.t("datamap.themes")}</p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="themebubbles-modal-container">
                                <MapThemeBubbles data={dataPanelThemeBubbles} interactive />
                            </div>
                        </ModalBody>
                    </Modal>

                    <Modal
                        isOpen={photoGalleryModalShowing}
                        toggle={this.togglePhotoGalleryModal}
                        className="photo-gallery-modal"
                    >
                        <ModalHeader toggle={this.togglePhotoGalleryModal} charCode="&times;">
                            <p>{i18n.t("datamap.photos")}</p>
                        </ModalHeader>
                        <ModalBody>
                            <div className="photo-gallery-modal-container">
                                <MapLocationImage
                                    selectedLocation={selectedLocations ? selectedLocations[0] : null}
                                    selectedPoint={selectedServicePoints ? selectedServicePoints[0] : null}
                                    imageSize="large"
                                />
                            </div>
                        </ModalBody>
                    </Modal>

                    <div className={dataPanelShowHide}>
                        <div className="map-datapanel-face">
                            <img src={dataPanelFacePath} alt="alt" />
                        </div>
                        <div className="map-datapanel-locations" id="datapanel-locations">
                            {dataPanelSelectedLocations.join(", ")}
                        </div>
                        <Tooltip
                            placement="top"
                            isOpen={tooltipIsOpen}
                            target="datapanel-locations"
                            toggle={this.toggleTooltipState}
                        >
                            {dataPanelSelectedLocations.join(", ")}
                        </Tooltip>

                        <div className="map-datapanel-datacontainer">
                            <div className="data-container">
                                <div className="data-container-value">
                                    {showDataPanelSatisfaction
                                        ? (
                                            <span>
                                                <span className="numbers_small">
                                                    {dataPanelSatisfaction}
                                                </span>
                                                <sup>%</sup>
                                            </span>
                                        )
                                        : <span className="numbers_small">-</span>}
                                </div>
                                <div className="data-container-label">
                                    <p className="small_center">{i18n.t("datamap.dataPanelSatisfactionLabel")}</p>
                                </div>
                            </div>

                            <div className="data-container data-container-two">
                                <div className="data-container-value">
                                    {showDataPanelDelta
                                        ? (
                                            <span>
                                                <sup><FontAwesomeIcon icon={dataPanelDeltaArrow} /></sup>
                                                <span className="numbers_small">{dataPanelDelta}</span>
                                                <sup>%</sup>
                                            </span>
                                        )
                                        : <span className="numbers_small">-</span>}
                                </div>
                                <div className="data-container-label">
                                    <p className="small_center">{i18n.t("datamap.dataPanelDeltaLabel")}</p>
                                </div>
                            </div>
                        </div>

                        <div className="map-datapanel-detailcontainer">
                            <div className="map-datapanel-collapse">
                                {/* Daily Satisfaction Ratings */}
                                <Button onClick={this.toggleDailyBreakdownPanelState} className="collapse-button">
                                    {i18n.t("datamap.dailyBreakdownPanelTitle")}
                                    <span>
                                        <FontAwesomeIcon icon="caret-down" />
                                    </span>
                                </Button>
                                <Collapse isOpen={dailyBreakdownPanelIsOpen}>
                                    <div className="daily-breakdown-container">
                                        {dataPanelDailyBreakdowns
                                            .map((panel) => {
                                                return (
                                                    <MapDailyBreakdown
                                                        key={panel.date}
                                                        satisfaction={panel.pourcent}
                                                        delta={panel.delta}
                                                        date={panel.date}
                                                    />
                                                );
                                            })}
                                    </div>
                                </Collapse>

                                {/* Theme Bubbles */}
                                <Button onClick={this.toggleThemeBubblesPanelState} className="collapse-button">
                                    {i18n.t("datamap.themes")}
                                    <span>
                                        <FontAwesomeIcon icon="caret-down" />
                                    </span>
                                </Button>
                                <Collapse onClick={this.toggleThemeBubblesModal} isOpen={themeBubblesPanelIsOpen}>
                                    <div className="themebubble-container">
                                        <MapThemeBubbles data={dataPanelThemeBubbles} interactive={false} />
                                    </div>
                                </Collapse>

                                {/* Photo Gallery */}
                                {(selectedLocations.length === 1 || selectedServicePoints.length === 1)
                                    && (
                                        <div>
                                            <Button
                                                onClick={this.togglePhotoGalleryPanelState}
                                                className="collapse-button"
                                            >
                                                {i18n.t("datamap.photos")}
                                                <span>
                                                    <FontAwesomeIcon icon="caret-down" />
                                                </span>
                                            </Button>
                                            <Collapse
                                                onClick={this.togglePhotoGalleryModal}
                                                isOpen={photoGalleryPanelIsOpen}
                                            >
                                                <div className="photo-gallery-container">
                                                    <MapLocationImage
                                                        selectedLocation={
                                                            selectedLocations ? selectedLocations[0] : null
                                                        }
                                                        selectedPoint={
                                                            selectedServicePoints ? selectedServicePoints[0] : null
                                                        }
                                                        imageSize="small"
                                                        className="interactive padded"
                                                    />
                                                </div>
                                            </Collapse>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="map-datapanel-mobile">
                    <div className="map-datapanel-face">
                        <img src={dataPanelFacePath} alt="alt" />
                    </div>

                    <div className="map-datapanel-locations">
                        {dataPanelSelectedLocations.join(", ")}
                    </div>

                    <div className="map-datapanel-datacontainer">
                        <div className="data-container data-container-mobile">
                            <div className="data-container-value">
                                <span className="numbers_small">{dataPanelSatisfaction}</span>
                                <sup>%</sup>
                            </div>
                            <div className="data-container-label">
                                <p className="small_center">{i18n.t("datamap.dataPanelSatisfactionLabel")}</p>
                            </div>
                        </div>

                        <div className="data-container data-container-two data-container-mobile">
                            <div className="data-container-value">
                                <sup><FontAwesomeIcon icon={dataPanelDeltaArrow} /></sup>
                                <span className="numbers_small">{dataPanelDelta}</span>
                                <sup>%</sup>
                            </div>
                            <div className="data-container-label">
                                <p className="small_center">{i18n.t("datamap.dataPanelDeltaLabel")}</p>
                            </div>
                        </div>
                    </div>

                    <div className="map-datapanel-detailcontainer-mobile">
                        <div className="map-datapanel-collapse">
                            {/* Daily Breakdown */}
                            <Button className="collapse-button">
                                {i18n.t("datamap.dailyBreakdownPanelTitle")}
                                <span>
                                    <FontAwesomeIcon icon="caret-down" />
                                </span>
                            </Button>
                            <Collapse isOpen>
                                <div className="daily-breakdown-container">
                                    {dataPanelDailyBreakdowns
                                        .map((panel) => {
                                            return (
                                                <MapDailyBreakdown
                                                    key={panel.date}
                                                    satisfaction={panel.pourcent}
                                                    delta={panel.delta}
                                                    date={panel.date}
                                                />
                                            );
                                        })}
                                </div>
                            </Collapse>

                            {/* Theme Bubbles */}
                            <Button className="collapse-button">
                                {i18n.t("datamap.themes")}
                                <span>
                                    <FontAwesomeIcon icon="caret-down" />
                                </span>
                            </Button>
                            <Collapse isOpen>
                                <div className="themebubble-container">
                                    <MapThemeBubbles data={dataPanelThemeBubbles} interactive />
                                </div>
                            </Collapse>

                            {/* Photo Gallery */}
                            {(selectedLocations.length === 1 || selectedServicePoints.length === 1)
                            && (
                                <div>
                                    <Button onClick={this.togglePhotoGalleryPanelState} className="collapse-button">
                                        {i18n.t("datamap.photos")}
                                        <span>
                                            <FontAwesomeIcon icon="caret-down" />
                                        </span>
                                    </Button>
                                    <Collapse isOpen={photoGalleryPanelIsOpen}>
                                        <div className="photo-gallery-container">
                                            <MapLocationImage
                                                selectedLocation={selectedLocations ? selectedLocations[0] : null}
                                                selectedPoint={selectedServicePoints ? selectedServicePoints[0] : null}
                                                imageSize="small"
                                                className="padded"
                                            />
                                        </div>
                                    </Collapse>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}

MapDataPanel.contextType = AuthContext;

MapDataPanel.propTypes = {
    dataPanelSatisfaction: PropTypes.string,
    dataPanelDelta: PropTypes.string.isRequired,
    dataPanelDailyBreakdowns: PropTypes.arrayOf(PropTypes.object).isRequired,
    dataPanelThemeBubbles: PropTypes.shape({
        children: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    dataPanelSelectedLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedLocations: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedServicePoints: PropTypes.arrayOf(PropTypes.string).isRequired,
};
MapDataPanel.defaultProps = {
    dataPanelSatisfaction: null,
};

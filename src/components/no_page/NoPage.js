
import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Row, Col, Container } from "reactstrap";
import i18n from "i18next";

import GlobalFooter from "../GlobalFooter";
import "./NoPage.css";

const facePath = require("../../img/face_unsatisfied.png");

const NoPage = ({ history }) => {
    return (
        <div>
            <div className="no-page">
                <div className="title-background-parent">
                    <div className="title-background-shape" />
                </div>
                <Container>
                    <Row>
                        <Col sm="12" md={{ size: 6, offset: 3 }}>
                            <div className="no-page-container">
                                <div className="no-page-icon"><img src={facePath} alt="alt" /></div>
                                <div className="no-page-content">
                                    <h2>{i18n.t("noPage.title")}</h2>
                                    <p>{i18n.t("noPage.description")}</p>
                                </div>
                                <div className="no-page-buttons">
                                    <Row>
                                        <Col xs="6" className="no-page-option">
                                            <span className="no-page-back" onClick={history.goBack}>
                                                <FontAwesomeIcon icon={faArrowLeft} />
                                                {" "}
                                                {i18n.t("noPage.goback")}
                                            </span>
                                        </Col>
                                        <Col xs="6" className="no-page-option">
                                            <Link to="/datamap">
                                                <span className="no-page-back">
                                                    {i18n.t("noPage.home")}
                                                    {" "}
                                                    <FontAwesomeIcon icon={faArrowRight} />
                                                </span>
                                            </Link>
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
            <GlobalFooter />
        </div>
    );
};

export default NoPage;

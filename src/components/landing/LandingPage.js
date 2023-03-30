import React from 'react';
import {Col, Container, Row} from 'reactstrap';
import ReactGA from 'react-ga';

import LandingDataCard from './LandingDataCard';
import GlobalFooter from './../GlobalFooter';

import './LandingPage.css';
import {AuthContext} from "../../AuthContext";

export default class LandingPage extends React.Component {

    constructor(props) {
        super(props);
        this.selectLocation = props.selectLocation;
        this.initializeReactGA();
    }

    initializeReactGA = () => {
        ReactGA.initialize('UA-108978484-3');
        ReactGA.pageview(window.location.pathname);
    };

    goToMap = () => {
        window.location = '/datamap/';
    };

    goToIdeas = () => {
        window.location = '/ideafeed/';
    };

    openStory = (url) => {
        window.open(url, "_blank");
    };

    submitContactForm = async () => {
        const emailFromForm = document.getElementById('email').value;
        const orgFromForm = document.getElementById('org').value;
        const msgFromForm = document.getElementById('message').value;

        if (emailFromForm === "" || orgFromForm === "" || msgFromForm === "") {
            alert("Please ensure the form is filled out correctly.");
            return false;
        }

        await this.context.makeHttpCall(
            'email/contact_form',
            'post',
            {
                data: {
                    'email_address': emailFromForm,
                    'organization': orgFromForm,
                    'message': msgFromForm
                }
            }
        );

        document.getElementById('email').value = "";
        document.getElementById('org').value = "";
        document.getElementById('message').value = "";
        alert("Thank you. We will be in touch shortly.");
    };

    render() {
        const headerImg = require('../../img/hero.jpg');
        const systemRing = require('../../img/system_ring.svg');
        const logoFastCo = require('../../img/logo_fastcompany.svg');
        const logocore77 = require('../../img/logo_core77.svg');
        const logogates = require('../../img/logo_gates.svg');
        const logocooper = require('../../img/logo_cooper.svg');

        const gss1 = require('../../img/gss1.jpg');
        const gss2 = require('../../img/gss2.jpg');
        const gss3 = require('../../img/gss3.jpg');
        
        return (

            <div>

                <section className="top-section">
                    <Container>
                        <Row>
                            <Col sm={{ size: 5}}>
                                <img src={headerImg} className="img-fluid" alt="Kuja Kuja Hero"/>
                            </Col>

                            <Col sm={{ size: 7}}>
                                <div className="copy">
                                    <h2>
                                        <span className="headline-break">Business Intelligence for</span>
                                        <span className="headline-break">Humanitarian Decision Makers</span>
                                    </h2>
                                    <p>
                                        Kuja Kuja collects, analyzes, and supports clients to take action on real-time customer feedback, helping organizations to design and
                                        deliver better services.
                                    </p>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="mission-section">
                    <Container>
                        <Row>
                            <h2>
                                <span className="headline-break">Kuja Kuja helps your organization put</span>
                                <span className="headline-break">customer voices at the center of decision making</span>
                            </h2>
                        </Row>
                    </Container>
                </section>

                <section className="two-questions-section">
                    <Container>
                        <Row>
                            <Col sm={{ size: 8, offset: 2 }}>
                                <h2>Kuja Kuja gathers authentic customer feedback by asking two simple questions, daily</h2>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 8, offset: 2 }}>
                                <p>
                                    By asking these questions at various points of the customer journey, Kuja Kuja has been able to build the most unique customer insight data set
                                    in the world.
                                </p>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 12 }}>
                                <div className="two-questions-bubbles">
                                    <button className="primary satisfaction-button" onClick={() => this.goToMap()}>View Satisfaction Ratings</button>
                                    <button className="primary ideas-button" onClick={() => this.goToIdeas()}>View Customer Ideas</button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="geolocated-section">
                    <Container>
                        <Row>
                            <Col sm={{ size: 12 }}>
                                <h2>Kuja Kuja gives your organization a real-time view of customer satisfaction with your services</h2>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 8, offset: 2 }}>
                                <p>
                                    Kuja Kuja maps your services, allowing your teams to have a window into customer satisfaction ratings - from country to region to individual
                                    service points.
                                </p>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 12 }}>
                                <div className="data-card-container">
                                    {this.props.initData
                                        .map((card, index) =>
                                            <LandingDataCard
                                                key={index}
                                                id={card.id}
                                                satisfaction={card.satisfaction}
                                                delta={card.delta}
                                                country={card.country}
                                                mapCenter={card.mapCenter}
                                                flag={card.flag}
                                                selectLocation={this.props.selectLocation}
                                            />
                                        )}
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="system-section">
                    <Container>
                        <Row>
                            <Col sm={{ size: 12 }}>
                                <h2>Beyond the data, Kuja Kuja supports your organization to access, interpret, and take action on customer feedback</h2>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 12 }}>
                                <p>
                                    To put customer voices at the center of your decision making requires an adaptable organization. Kuja Kuja supports you at every point in this
                                    process. Recognizing that real time data requires radically reduced response times and new ways of working, Kuja Kuja supports your teams to
                                    include customer feedback in their daily work flow, planning, and implementation.
                                </p>
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={{ size: 12}}>
                                <div className="ring-holder">
                                    <div className="system-ring">
                                        <div className="pill feedback">
                                            <h4>Collect</h4>
                                            <div className="pill-explanation">
                                                <p>Our highly trained teams talk to customers to gather feedback and input it into the system every day.</p>
                                            </div>
                                        </div>

                                        <div className="pill analyze">
                                            <h4>Analyze</h4>
                                            <div className="pill-explanation">
                                                <p>Kuja Kuja analyzes and publishes customer feedback, sharing raw data with your teams.</p>
                                            </div>
                                        </div>


                                        <div className="pill consult">
                                            <h4>Consult</h4>
                                            <div className="pill-explanation">
                                                <p>Kuja Kuja teams guide clients to access, interpret, and take action on customer feedback.</p>
                                            </div>
                                        </div>

                                        <div className="pill action">
                                            <h4>Act</h4>
                                            <div className="pill-explanation">
                                                <p>Client organizations are encouraged to take action on customer feedback. The public is also invited to take action.</p>
                                            </div>
                                        </div>

                                        <div className="pill capture">
                                            <h4>Share</h4>
                                            <div className="pill-explanation">
                                                <p>By documenting the actions taken and sharing with customers and clients, the cycle continues.</p>
                                            </div>
                                        </div>

                                        <img width="370" height="374" className="system-ring-img" src={systemRing} alt="The Kuja Kuja System"/>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="gss-section">
                    <Container>
                        <Row>
                            <Col lg={{ size: 12 }}>
                                <h2>See the power of customer feedback in action.</h2>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={{ size: 8, offset: 2 }}>
                                <p className="center">Hundreds of changes and improvements have been made thanks to Kuja Kuja data. Here are just a few.</p>
                            </Col>
                        </Row>

                        <Row>
                            <Col lg={{ size: 4 }}>
                                <div className="gss-section-card">
                                    <div className="gss-section-photo">
                                        <img alt="gss section" src={gss1} />
                                    </div>
                                    <div className="gss-section-date">
                                        <p className="small">June 15, 2018 - Bidi Bidi - Zone 5, Uganda</p>
                                    </div>
                                    <div className="gss-section-title">
                                        <h3 className="left">Over 2500 mosquito nets distributed</h3>
                                    </div>
                                    <div className="gss-section-content">
                                        <p className="left">
                                            Data analysis showed ‘mosquito net’ as a trending customer idea and expediting the acquisition of nets for customers.
                                        </p>
                                    </div>
                                    <button className="primary" onClick={
                                        () => this.openStory('https://kujakujagoldstars.com/home/2018/7/5/ixr8nura074n5n64m4bp65akt7dcee-eapgr-8k3dr-hr3gy-zxexz-jdzpb')
                                    }>
                                        Read Full Story
                                    </button>
                                </div>
                            </Col>

                            <Col lg={{ size: 4 }}>
                                <div className="gss-section-card gss-section-mobile-card">
                                    <div className="gss-section-photo">
                                        <img alt="gss section"  src={gss2} />
                                    </div>
                                    <div className="gss-section-date">
                                        <p className="small">July 31, 2018 - Kisimayo, Somalia</p>
                                    </div>
                                    <div className="gss-section-title">
                                        <h3 className="left">Expedited Installation of a Solar Energy System</h3>
                                    </div>
                                    <div className="gss-section-content">
                                        <p className="left">Customer feedback sped up the process to install solar energy, increasing safety and security.</p>
                                    </div>
                                    <button className="primary" onClick={
                                        () => this.openStory('https://kujakujagoldstars.com/home/2018/7/5/ixr8nura074n5n64m4bp65akt7dcee-eapgr-hya4n-ckklp-4mla6-435tt-5zynl-zrflp')
                                    }>
                                        Read Full Story
                                    </button>
                                </div>
                            </Col>

                            <Col lg={{ size: 4 }}>
                                <div className="gss-section-card gss-section-mobile-card">
                                    <div className="gss-section-photo">
                                        <img alt="gss section"  src={gss3} />
                                    </div>
                                    <div className="gss-section-date">
                                        <p className="small">Nov 15, 2018 - Mahama, Rwanda</p>
                                    </div>
                                    <div className="gss-section-title">
                                        <h3 className="left">New Patient Intake System at Clinic</h3>
                                    </div>
                                    <div className="gss-section-content">
                                        <p className="left">A new token system at the clinic waiting area was designed to reduce patient waiting time and alleviate confusion.</p>
                                    </div>
                                    <button className="primary" onClick={
                                        () => this.openStory('https://kujakujagoldstars.com/home/2018/7/5/ixr8nura074n5n64m4bp65akt7dcee-eapgr-xyyta-9pjxt')
                                    }>
                                        Read Full Story
                                    </button>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="featured-section">
                    <Container>
                        <Row>
                            <Col sm={{ size: 12 }}>
                                <ul className="logos">
                                    <li className="logo fastco"><img width="178" height="27" src={logoFastCo} alt="Fast Company" /></li>
                                    <li className="logo core77"><img width="128" height="56" src={logocore77} alt="Core 77m" /></li>
                                    <li className="logo gates"><img width="211" height="56" src={logogates} alt="Gates" /></li>
                                    <li className="logo cooper"><img width="110" height="56" src={logocooper} alt="Cooper Hewitt" /></li>
                                </ul>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <section className="findoutmore-section">
                    <Container>
                        <Row>
                            <Col lg={{ size: 5}}>
                                <h2 className="left">Let's connect. <br/>Send us a message.</h2>
                                <p className="left">
                                    Business Inquiries - <a href="mailto:newbiz@kujakuja.com" className="mailto_link">newbiz@kujakuja.com</a><br/>
                                    Press Inquiries - <a href="mailto:press@kujakuja.com" className="mailto_link">press@kujakuja.com</a><br />
                                    Job Opportunities - <a href="mailto:staff@kujakuja.com" className="mailto_link">staff@kujakuja.com</a><br />
                                    For more information - <a href="mailto:yellow@kujakuja.com" className="mailto_link">yellow@kujakuja.com</a><br />
                                </p>
                            </Col>
                            <Col lg={{ size: 6, offset: 1 }}>
                                <div className="findoutmore-form-container">
                                    <div className="findoutmore-form-row1">
                                        <input type="text" id="email" placeholder="Your Email"/>
                                        <input type="text" id="org" placeholder="Your Organization"/>
                                    </div>

                                    <div className="findoutmore-form-row2">
                                        <textarea id="message" cols="40" rows="3" placeholder="Enter a message"/>
                                    </div>

                                    <div className="findoutmore-form-row2">
                                        <button className="primary" onClick={() => this.submitContactForm()}>Send Message</button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </section>

                <GlobalFooter />

            </div>

        )
    }

}
LandingPage.contextType = AuthContext;

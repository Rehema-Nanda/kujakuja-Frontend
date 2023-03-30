import React from "react";
import axios from "axios";
import {
    Button, Form, FormGroup, Label, Input, FormText, FormFeedback, Container, Row, Col, Progress, Card, CardImg
} from "reactstrap";
import PropTypes, { arrayOf } from "prop-types";
import moment from "moment";
import i18n from "i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./ActionForm.css";

import storage from "../../firebase";
import { AuthContext } from "../../AuthContext";
import { getDefinedParams, getIdeafeedParamsFromUrl, getQueryParamsFromUrl, isValidUrl } from "../../helpers";
import logo from "../../img/global-logo-gray.png";

const { CancelToken } = axios;
let axiosSource = CancelToken.source();
moment.locale(i18n.language);

class ActionForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            location: "",
            country: "",
            implementor: "",
            reporter: "",
            sector: "",
            month: moment().format("MMMM"),
            year: moment().format("YYYY"),
            time: moment(),
            tag: "",
            title: "",
            startdate: "",
            endDate: "",
            description: "",
            image: null,
            numbers: "1",
            ideasCount: "",
            impact: "",
            source: "",
            filteredLocations: [],
            isUploading: false,
            isSubmiting: false,
            isValidForm: true,
            imageTotalBytes: "",
            imageBytesTransferred: "",
            errors: {
                title: "",
                description: "",
                location: i18n.t("actionForm.locationError"),
                country: i18n.t("actionForm.countryError"),
                implementor: "",
                reporter: "",
                sector: i18n.t("actionForm.sectorError"),
                source: "",
                impact: ""
              }
        };
        this.handleChange = this.handleChange.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
        this.handleCountriesChange = this.handleCountriesChange.bind(this);
        this.handleImageChange = this.handleImageChange.bind(this);
    }

    isValidIdeafeedUrl = (url) => {
        const valid = isValidUrl(url);

        if (valid && url.includes("ideafeed") && url.includes("kujakuja.com") && url.includes("&keyword=") && Object.keys(getIdeafeedParamsFromUrl(url)).length > 2) {
            return true;
        }
        return false;
    }

    handleChange = async (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });

        const { name, value } = e.target;
        let errors = this.state.errors;
        const validEmailRegex = RegExp(
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
        );

        switch (name) {
            case 'title':
              errors.title =
                value.length < 5
                ? i18n.t("actionForm.titleError")
                : '';
                break;

            case 'description':
                errors.description =
                    value.length < 5
                    ? i18n.t("actionForm.descriptionError")
                    : '';
                break;

            case 'reporter':
                errors.reporter =
                validEmailRegex.test(value)
                    ? ''
                    : i18n.t("actionForm.emailError");
                break;

            case 'impact':
                errors.impact = value.length < 5
                ? i18n.t("actionForm.impactError")
                : '';
                break;

            case 'implementor':
                errors.implementor = value.length < 5
                ? i18n.t("actionForm.impactError")
                : '';
            break;

            case 'location':
                errors.location =
                value.length < 1
                    ? i18n.t("actionForm.locationError")
                    : '';
                break;

            case 'sector':
                errors.sector =
                value.length < 1
                    ? i18n.t("actionForm.sectorError")
                    : '';
                break;

            case 'source':
                const valid = this.isValidIdeafeedUrl(value);
                const params = getIdeafeedParamsFromUrl(value);
                await this.formatStartEndIdeafeedDates(params);
                await this.setState({ tag: params.keyword });
                valid && await this.getIdeasCount();

                errors.source =
                    valid
                    ? ''
                    : i18n.t("actionForm.sourceError");
                break;

            case 'month':
                this.setState({ time: moment(`${value},${this.state.year}`).add(2, "days").format("YYYY-MM-DD")});
                break;

            case 'year':
                this.setState({ time: moment(`${this.state.month},${value}`).add(2, "days").format("YYYY-MM-DD")});
                break;

            default:
                break;
        }

        this.setState({errors, [name]: value});
    }

    validateForm = errors => {
        let valid = true;
        Object.values(errors).forEach(val => val.length > 0 && (valid = false));
        return valid;
      };

    handleCountriesChange = (e) => {
        let errors = this.state.errors;
        const selectedCountry = e.target.value;

        errors.country =
            selectedCountry.length < 1
                    ? i18n.t("actionForm.countryError")
                    : '';

        this.setState({
            country: selectedCountry,
            location: "",
        });

        this.setState({
            country: selectedCountry,
        },() => {
            this.filterLocations();
        });
    }

    handleImageChange = (e) => {
        console.log(e.target.files[0]);
        this.setState({ image: e.target.files[0] });
    }

    filterLocations = () => {
        let filteredLocations = [];

        filteredLocations = this.props.allLocations.filter((loc) => {
            return loc.country_name === this.state.country;
        });

        this.setState({ filteredLocations });
    }

    getSelectedEntityName = (entityName, entityId) => {
        let selectedEntityName = "";
        const { allLocations, serviceTypes } = this.props;

        if (entityName === "location") {
            const loc = allLocations.find(location => location.id === entityId);
            selectedEntityName = loc.name;
        }
        else if (entityName === "serviceType") {
            const st = serviceTypes.find(st => st.id === entityId);
            selectedEntityName = st.name;
        }

        return selectedEntityName;
    }

    formatStartEndIdeafeedDates = (params) => {
        const startDate = moment(params.startDate);
        const endDate = moment(params.endDate);


        startDate.isValid() ? this.setState({ startDate}) : this.setState({ startDate: "" });
        endDate.isValid() ? this.setState({ endDate }) : this.setState({ endDate: "" });
    }

    getIdeasCount = async () => {
        const { tag, startDate, endDate, source } = this.state;
        const { makeHttpCall } = this.context;
        const queryParams = getQueryParamsFromUrl(source);
        const definedParams = getDefinedParams(queryParams);

        if (!startDate || !endDate || !tag) {
            return;
        }

        const params = {
            start: startDate.format("YYYY-MM-DD"),
            end:endDate.format("YYYY-MM-DD"),
            keyword: tag,
            countries: definedParams.countries,
            settlements: definedParams.settlements,
            types: definedParams.types,
            limit: definedParams.limit,
            page: definedParams.page,
        };

        const response = await makeHttpCall("responses/ideas", "post", { cancelToken: axiosSource.token, data: params });

        this.setState({
            ideasCount: response.data.count,
        });
    };

    onSubmitForm = async(e) => {
        e.preventDefault();
        this.setState({ isSubmiting: true });

        const { makeHttpCall } = this.context;
        const {
            location, implementor, sector, month, year, title, description, image, numbers, impact, source, reporter, tag, errors, ideasCount
        } = this.state;

        if (this.validateForm(errors)) {
            this.setState({ isValidForm: true });
        } else {
            this.setState({ isValidForm: false, isSubmiting: false });
            return;
        }

        try {
            console.log(moment().month(month).year(year).format("YYYY-MM-DD"));
            const reqBody = {
                settlement_id: location,
                implementor,
                service_type_id: sector,
                time: moment().month(month).year(year).format("YYYY-MM-DD"),
                title,
                description,
                numbers,
                source,
                impact,
                reporter,
                tag,
                ideas_count: ideasCount
            };

            if (image) {
                this.setState({ isUploading: true });
                await storage.ref(`/action-feed-images/${image.name}`).put(image)
                .on('state_changed',
                    (snapshot) => {
                        // takes a snap shot of the process as it is happening
                        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                        this.setState({ imageBytesTransferred: snapshot.bytesTransferred});
                        this.setState({ imageTotalBytes: snapshot.totalBytes });
                    }, (err) => {
                        this.setState({ isUploading: false, isSubmiting: false });
                        console.error("Error uploading image:", err);
                        return;
                    }, () => {
                        // gets the functions from storage refences the image storage in firebase by the children
                        // gets the download url then sets the image from firebase as the value for the imgUrl key:
                        storage.ref('/action-feed-images').child(image.name).getDownloadURL()
                            .then(async fireBaseUrl => {
                                const newReqBody = {
                                    ...reqBody,
                                    image: fireBaseUrl,
                                }

                                await makeHttpCall("action_feeds/add", "post", { cancelToken: axiosSource.token, data: newReqBody });
                                this.setState({ isUploading: false, isSubmiting: false });
                                this.props.history.push("/actionfeed");
                            })
                            .catch(error => {
                                console.error("Error saving image:", error);
                                this.setState({ isUploading: false, isSubmiting: false });
                            });
                    });
            }
            else {
                await makeHttpCall("action_feeds/add", "post", { cancelToken: source.token, data: reqBody });
                this.setState({ isSubmiting: false });
                this.props.history.push("/actionfeed");
            }
        }
        catch (err) {
            this.setState({ isSubmiting: false });
            console.log(err.message);
        }
    }

    returnToFeed = () => {
        this.props.history.push("/actionfeed");
    }

    yearsArray = () => {
        const max = new Date().getFullYear();
        const min = 2009;
        const years = [];

        for (let i = max; i >= min; i--) {
            years.push(i);
        }
        return years;
    };

    render() {
        const {
            location, country, implementor, sector, month, year, title, description, image, numbers, impact, source, filteredLocations, errors, reporter,
            imageBytesTransferred, imageTotalBytes, isUploading, isSubmiting, isValidForm, time, tag, startDate, endDate, ideasCount
        } = this.state;
        const { allCountries, serviceTypes } = this.props;

        return (
            <div className="page-container">

                <div className="title-background-parent">
                    <div className="title-background-shape" />
                </div>

                <Container>
                    <Row>
                        <Col>
                            <div >
                                <h1 className="pageDescription">{i18n.t("actionForm.title")}</h1>
                                <p>{i18n.t("actionForm.subTitle")}</p>
                            </div>
                        </Col>
                        <Col>
                            <div className="pageReturn">
                                <Button color="primary" className="primary" onClick={this.returnToFeed}>
                                    {i18n.t("actionForm.back")}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>

                <Container>
                    <Form>
                        <div className="card-1">
                            <h4>{i18n.t("actionForm.firstUp")}</h4>

                            <Label for="title">{i18n.t("actionForm.whereLabel")}</Label>
                            <FormGroup>
                                <select
                                    id="country"
                                    name="country"
                                    value={country}
                                    onChange={this.handleCountriesChange}
                                >
                                    <option value="">{i18n.t("actionForm.countryOption")}</option>
                                    {allCountries.map((item) => {
                                        return (<option key={item.id}>{item.name}</option>);
                                    })}
                                </select>

                                <select
                                    id="location"
                                    name="location"
                                    value={location}
                                    onChange={this.handleChange}
                                    disabled={country.length < 1}
                                >
                                    <option value="">{i18n.t("actionForm.locationOption")}</option>
                                    {filteredLocations.map((loc) => {
                                        return (<option key={loc.id} value={loc.id}>{loc.name}</option>);
                                    })}
                                </select>
                                {errors.country && errors.country.length > 0 && <small className="form-text text-muted form-error">{errors.country}</small>}
                                {errors.location && errors.location.length > 0 && <small className="form-text text-muted form-error">{errors.location}</small>}
                            </FormGroup>

                            <FormGroup>
                                <Label for="reporter">{i18n.t("actionForm.reporterLabel")}</Label>
                                <Input
                                    type="text"
                                    name="reporter"
                                    value={reporter}
                                    onChange={this.handleChange}
                                    invalid={errors.reporter.length > 0}
                                />
                                {errors.reporter.length > 0 &&
                                <FormFeedback>{errors.reporter}</FormFeedback>}
                            </FormGroup>
                        </div>

                        <div className="card-1">
                            <h4>{i18n.t("actionForm.cardDetails")}</h4>

                            <Label for="question">{i18n.t("actionForm.serviceLabel")}</Label>
                            <FormGroup>
                                <Input type="select" name="sector" onChange={this.handleChange}>
                                    <option value="">{i18n.t("actionForm.serviceOption")}</option>
                                    {serviceTypes.map((type) => {
                                        return (<option key={type.id} value={type.id}>{type.name}</option>);
                                    })}
                                </Input>
                                {errors.sector && errors.sector.length > 0 && <small className="form-text text-muted form-error">{errors.sector}</small>}
                            </FormGroup>

                            <FormGroup>
                                <Label for="implementor">{i18n.t("actionForm.implementorLabel")}</Label>
                                <Input
                                    type="text"
                                    name="implementor"
                                    placeholder={i18n.t("actionForm.implementorPlaceholder")}
                                    value={implementor}
                                    onChange={this.handleChange}
                                    invalid={errors.implementor.length > 0}
                                />
                                {errors.implementor.length > 0 &&
                                <FormFeedback>{errors.implementor}</FormFeedback>}
                            </FormGroup>

                            <label htmlFor="lname">{i18n.t("actionForm.whenLabel")}</label>

                            <FormGroup>
                                <select
                                    id="month"
                                    name="month"
                                    value={month}
                                    onChange={this.handleChange}
                                >
                                    {moment.months().map((month) => {
                                        return (<option key={month}>{month}</option>);
                                    })}
                                </select>

                                <select id="year" name="year" value={year} onChange={this.handleChange}>
                                    {this.yearsArray().map((year) => {
                                        return (<option key={year}>{year}</option>);
                                    })}

                                </select>
                            </FormGroup>

                            <FormGroup>
                                <Label for="lname">{i18n.t("actionForm.titleLabel")}</Label>
                                <Input
                                    type="text"
                                    name="title"
                                    value={title}
                                    placeholder={i18n.t("actionForm.titlePlaceholder")}
                                    maxLength="255"
                                    onChange={this.handleChange}
                                    invalid={errors.title.length > 0}
                                />
                                <small className="form-text text-muted">{`Characters: ${title.length}/255`}</small>
                                {errors.title.length > 0 &&
                                <FormFeedback>{errors.title}</FormFeedback>}
                            </FormGroup>

                            <FormGroup>
                                <Label for="subject">{i18n.t("actionForm.whatLabel")}</Label>
                                <Input
                                    type="textarea"
                                    name="description"
                                    value={description}
                                    placeholder={i18n.t("actionForm.whatPlaceholder")}
                                    onChange={this.handleChange}
                                    invalid={errors.description.length > 0}
                                />
                                {errors.description.length > 0 &&
                                <FormFeedback>{errors.description}</FormFeedback>}
                            </FormGroup>
                        </div>

                        <div className="card-1">
                            <h4>{i18n.t("actionForm.photoLabel")}</h4>
                            <FormGroup>
                                <Label for="exampleFile">{i18n.t("actionForm.choosePhoto")}</Label>
                                <Input type="file" name="image" id="exampleFile" onChange={this.handleImageChange} />
                                <FormText color="muted">{i18n.t("actionForm.photoSize")}</FormText>
                            </FormGroup>

                        </div>

                        <div className="card-1">

                            <Label for="subject">{i18n.t("actionForm.numbersLabel")}</Label>

                            <FormGroup tag="fieldset">
                                <FormGroup check>
                                    <Label check>
                                        <Input
                                        type="radio"
                                        checked={numbers === "1"}
                                        name="numbers"
                                        value="1"
                                        onChange={this.handleChange}
                                    />
                                    {' '}
                                    {i18n.t("actionForm.individual")}
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                        <Input type="radio"
                                        checked={numbers === "10"}
                                        name="numbers"
                                        value="10"
                                        onChange={this.handleChange}
                                    />
                                    {' '}
                                    {i18n.t("actionForm.group")}
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                    <Input
                                        type="radio"
                                        checked={numbers === "50"}
                                        name="numbers"
                                        value="50"
                                        onChange={this.handleChange}
                                    />
                                    {" "}
                                    {i18n.t("actionForm.crowd")}
                                    </Label>
                                </FormGroup>

                                <FormGroup check>
                                    <Label check>
                                    <Input
                                        type="radio"
                                        checked={numbers === "50+"}
                                        name="numbers"
                                        value="50+"
                                        onChange={this.handleChange}
                                    />
                                    {" "}
                                    {i18n.t("actionForm.community")}
                                    </Label>
                                </FormGroup>
                            </FormGroup>

                            <FormGroup>
                                <Label for="subject">{i18n.t("actionForm.impactLabel")}</Label>

                                <Input
                                    type="textarea"
                                    name="impact"
                                    value={impact}
                                    onChange={this.handleChange}
                                    placeholder={i18n.t("actionForm.impactPlaceholder")}
                                    invalid={errors.impact.length > 0}
                                />
                                {errors.impact.length > 0 &&
                                <FormFeedback>{errors.impact}</FormFeedback>}
                            </FormGroup>
                        </div>

                        <div className="card-1">
                            <h4>{i18n.t("actionForm.sourceTitle")}</h4>

                            <FormGroup>
                                <Label for="subject">{i18n.t("actionForm.sourceLabel")}</Label>
                                <Input
                                    type="text"
                                    name="source"
                                    value={source}
                                    onChange={this.handleChange}
                                    placeholder={i18n.t("actionForm.sourcePlaceholder")}
                                    invalid={errors.source.length > 0}
                                />
                                <FormText color="muted">
                                    <ul>
                                        <li>{i18n.t("actionForm.kujakujaUrl")}</li>
                                        <li>{i18n.t("actionForm.ideafeedUrl")}</li>
                                        <li>{i18n.t("actionForm.keywordUrl")}</li>
                                    </ul>
                                </FormText>
                                {errors.source.length > 0 &&
                                <FormFeedback>{errors.source}</FormFeedback>}
                            </FormGroup>
                        </div>

                        <h4>{i18n.t("actionForm.actionPreview")}</h4>

                        <div className="action-card action-preview">
                            <div className="action-top-details">
                                <Row>
                                    <Col md="4">
                                        <Card className="action-img">
                                            <CardImg top width="100%" src={image ? URL.createObjectURL(image) : logo} alt={`[${i18n.t("actionForm.noImage")}]`} />
                                        </Card>
                                    </Col>
                                    <Col md="8">
                                        <div className="action-card-body">
                                            <div className="action-content">
                                                <p className="action-time">
                                                    {moment(time).format("MMMM, YYYY")}
                                                    {" "}
                                                    <span>&#124;</span>
                                                </p>
                                                <p className="action-area">
                                                    {" "}
                                                    {`${location ? this.getSelectedEntityName("location", location) : `[${i18n.t("actionForm.noLocation")}]`}, ${country ? country : `[${i18n.t("actionForm.noCountry")}]`}`}
                                                    {" "}
                                                    <span>&#124;</span>
                                                </p>
                                                <p className="action-sector">
                                                    {" "}
                                                    {`${sector ? this.getSelectedEntityName("serviceType", sector) : `[${i18n.t("actionForm.noServiceType")}]`}`}
                                                </p>
                                            </div>

                                            {/* <div className="action-details" lang={this.generateTranslationMarkUp()}> */}
                                            <div className="action-details">
                                                <h3 className="action-title">{title || `[${i18n.t("actionForm.noTitle")}]`}</h3>
                                                <br />
                                                <p className="action-author">
                                                    {i18n.t("actionFeed.by")}
                                                    {" "}
                                                    {implementor || `[${i18n.t("actionForm.noImplementor")}]`}
                                                </p>
                                                <p className="action-desc">{description || `[${i18n.t("actionForm.noDescription")}]`}</p>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <div className="action-footer">
                                <Row>
                                    <Col xs="8">
                                        <div className="footer-desc">
                                            <p>
                                                {i18n.t("actionFeed.actionTaken")}
                                                {" "}
                                                {`"${tag ? tag : `[${i18n.t("actionForm.noTag")}]`}"`}
                                                {" "}
                                                {i18n.t("actionFeed.during")}
                                                {" "}
                                                {startDate ? `${startDate.format("MMMM")} - ${endDate.format("MMMM, YYYY")}`: `[period]`}
                                            </p>
                                        </div>

                                    </Col>
                                    <Col xs="4">
                                        <div className="action-links">
                                            <a className="action-icon" href={source} target="_blank" rel="noopener noreferrer">
                                                <span className="footer-text">
                                                    {i18n.t("actionFeed.view")}
                                                    {" "}
                                                    {ideasCount}
                                                    {i18n.t("actionFeed.ideas")}
                                                </span>
                                                <FontAwesomeIcon icon="arrow-right" />
                                            </a>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>

                        {isUploading && <Progress value={imageBytesTransferred} max={imageTotalBytes}>Uploading image</Progress>}

                        {!isValidForm && <small className="form-text text-muted form-error">{i18n.t("actionForm.formError")}</small>}

                        <Container>
                            <Row>
                                <Button type="submit" color="primary" className="primary" onClick={this.onSubmitForm} disabled={isSubmiting}>{i18n.t("actionForm.submit")}</Button>
                            </Row>
                        </Container>

                    </Form>

                </Container>
            </div>
        );
    }
}

ActionForm.contextType = AuthContext;

ActionForm.propTypes = {
    allCountries: arrayOf(PropTypes.object).isRequired,
    allLocations: arrayOf(PropTypes.object).isRequired,
    serviceTypes: arrayOf(PropTypes.object).isRequired,
};

export default ActionForm;

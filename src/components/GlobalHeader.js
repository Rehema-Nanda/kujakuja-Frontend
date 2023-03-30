import React from "react";
import { NavLink as Link } from "react-router-dom";
import {
    Collapse, Nav, Navbar, NavbarToggler, NavItem, NavLink, Dropdown,
    DropdownMenu,
    DropdownToggle,
    DropdownItem,
} from "reactstrap";

import "./GlobalHeader.css";
import reactCSS from "reactcss";
import i18n from "i18next";
import AppConfig from "../AppConfig";
import { AuthContext } from "../AuthContext";
import lngOptions from "../i18n/lngOptions";

export default class GlobalHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isNavOpen: false,
            siteHeader: {
                highlight_colour: AppConfig.SITE_HEADER_DEFAULT_HIGHLIGHT_COLOUR,
                title_text: AppConfig.SITE_HEADER_DEFAULT_TITLE_TEXT,
                logo_url: null,
                kujakuja_logo_url: require("../img/global-logo-dark.svg"),
            },
            isLngSelectDropdownOpen: false,
        };
        this.toggleNav = this.toggleNav.bind(this);
        this.toggleLngSelectDropdown = this.toggleLngSelectDropdown.bind(this);
    }

    componentDidMount = async () => {
        await this.getSiteHeader();
    };

    generateAdminUrl = () => {
        const { location: { protocol, host } } = window;
        return `${protocol}//admin.${host}/`;
    }

    getSiteHeader = async () => {
        // retrieve site config
        const config = await this.context.makeHttpCall("config", undefined, undefined, true);

        if (config && config.data) {
            const siteHeader = { ...config.data.site_header };

            // set site favicon if there is one in the config
            if (siteHeader.favicon_url) {
                const link = document.querySelector("link[rel*='icon']") || document.createElement("link");
                link.type = "image/x-icon";
                link.rel = "shortcut icon";
                link.href = siteHeader.favicon_url;
                document.getElementsByTagName("head")[0].appendChild(link);
            }

            this.setState({
                siteHeader: {
                    ...this.state.siteHeader,
                    highlight_colour: siteHeader.highlight_colour || AppConfig.SITE_HEADER_DEFAULT_HIGHLIGHT_COLOUR,
                    title_text: siteHeader.title_text || AppConfig.SITE_HEADER_DEFAULT_TITLE_TEXT,
                    logo_url: siteHeader.logo_url,
                },
            });
        }
    };

    toggleNav() {
        const { isNavOpen } = this.state;

        // close menu if mobile
        if (window.innerWidth <= 992) {
            this.setState({
                isNavOpen: !isNavOpen,
            });
        }
    }

    toggleLngSelectDropdown() {
        const { isLngSelectDropdownOpen } = this.state;

        this.setState({
            isLngSelectDropdownOpen: !isLngSelectDropdownOpen,
        });
    }

    render() {
        const { changeLanguage, selectedLanguage } = this.props;
        const { siteHeader, isLngSelectDropdownOpen, isNavOpen } = this.state;
        const { isAuthenticated, logout } = this.context;
        const selectedLanguageOption = lngOptions.find((lng) => {
            return lng.value === selectedLanguage;
        });
        let selectedLanguageName;
        if (selectedLanguageOption) {
            selectedLanguageName = selectedLanguageOption.name;
        }
        const styles = reactCSS({
            default: {
                customHeaderBg: {
                    borderTopColor: siteHeader.highlight_colour || AppConfig.SITE_HEADER_DEFAULT_HIGHLIGHT_COLOUR,
                },
                customLogoParentBg: {
                    backgroundColor: siteHeader.highlight_colour || AppConfig.SITE_HEADER_DEFAULT_HIGHLIGHT_COLOUR,
                },
            },
        });

        return (

            <div>
                <Navbar className="global-header" style={styles.customHeaderBg} expand="lg">
                    <div className="logo-parent-div">
                        {siteHeader.logo_url
                        && (
                            <div style={styles.customLogoParentBg} className="customer-logo-parent-div">
                                <NavLink className="customer-logo-nav-link" to="/" tag={Link} onClick={this.toggleNav}>
                                    <img alt="Logo" className="customer-logo custom-logo" src={this.state.siteHeader.logo_url} />
                                </NavLink>
                            </div>
                        )}
                        <NavLink className="kuja-kuja-logo-nav-link" to="/" tag={Link} onClick={this.toggleNav}>
                            <img alt="Logo" className="customer-logo" src={this.state.siteHeader.kujakuja_logo_url} />
                        </NavLink>
                    </div>
                    <NavbarToggler onClick={this.toggleNav} />
                    <Collapse isOpen={isNavOpen} navbar>
                        <Nav className="ml-auto" navbar>
                            {AppConfig.DATA_STUDIO_GRAPH_URL
                            && (
                                <NavItem>
                                    <NavLink
                                        to="/graph"
                                        tag={Link}
                                        activeClassName="navbar_active"
                                        onClick={this.toggleNav}
                                    >
                                        {i18n.t("header.graph")}
                                    </NavLink>
                                </NavItem>
                            )}
                            {process.env.DISPLAY_IDEA ? ("") : (
                                <NavItem>
                                    <NavLink
                                        to="/ideafeed"
                                        tag={Link}
                                        activeClassName="navbar_active"
                                        onClick={this.toggleNav}
                                    >
                                        {i18n.t("header.ideaFeed")}
                                    </NavLink>
                                </NavItem>
                            )}
                            <NavItem>
                                <NavLink
                                    to="/actionfeed"
                                    tag={Link}
                                    activeClassName="navbar_active"
                                    onClick={this.toggleNav}
                                >
                                    {i18n.t("header.actionFeed")}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    to="/datamap"
                                    tag={Link}
                                    activeClassName="navbar_active"
                                    onClick={this.toggleNav}
                                >
                                    {i18n.t("header.dataMap")}
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink
                                    to="/snapshots"
                                    tag={Link}
                                    activeClassName="navbar_active"
                                    onClick={this.toggleNav}
                                >
                                    {i18n.t("header.snapshots")}
                                </NavLink>
                            </NavItem>

                            <li className="nav-item">
                                <a className="nav-link" href={this.generateAdminUrl()}>
                                    {i18n.t("header.admin")}
                                </a>
                            </li>

                            {AppConfig.LOGIN_REQUIRED && isAuthenticated && (
                                <li className="nav-item">
                                    <a onClick={logout} className="nav-link" href="/login">Logout</a>
                                </li>
                            )}

                            <NavItem>
                                <Dropdown isOpen={isLngSelectDropdownOpen} toggle={this.toggleLngSelectDropdown}>
                                    <DropdownToggle
                                        caret
                                        tag="span"
                                        onClick={this.toggleLngSelectDropdown}
                                        data-toggle="dropdown"
                                        aria-expanded={isLngSelectDropdownOpen}
                                    >
                                        {selectedLanguageName}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        <div className="arrow-up" />
                                        {lngOptions
                                        .filter((lng) => { return !AppConfig.GCP_PROJECT_ID.includes("raiseyourvoice") || lng.value != 'ru' })
                                        .map((lng) => {
                                            return (
                                                <DropdownItem
                                                    key={lng.value}
                                                    onClick={changeLanguage}
                                                    value={lng.value}
                                                    active={selectedLanguage === lng.value}
                                                >
                                                    {lng.name}
                                                </DropdownItem>
                                            );
                                        })}
                                    </DropdownMenu>
                                </Dropdown>
                            </NavItem>
                        </Nav>
                    </Collapse>
                </Navbar>
            </div>

        );
    }
}
GlobalHeader.contextType = AuthContext;

// https://reactjs.org/docs/context.html
// https://dev.to/sunnysingh/sharing-state-using-reacts-context-api-3623

import React, { createContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import JWT from "jsonwebtoken";
import decode from "jwt-decode";
import AppConfig from "./AppConfig";

export const AuthContext = createContext({
    isAuthenticated: false,
    isLoading: false,
    login: () => {
    },
    logout: () => {
    },
    makeHttpCall: () => {
    },
    getToken: (isAnonymous) => {
    },
    getProfile: () => {
    },
});

export class AuthProvider extends React.Component {
    constructor(props) {
        super(props);

        this.userAuthToken = null;
        this.anonymousAuthToken = null;
        this.isLoadingFalseTimerId = null;

        /* eslint-disable react/no-unused-state */
        this.state = {
            // we assume you're always authenticated if authentication is not required
            isAuthenticated: !AppConfig.LOGIN_REQUIRED,
            isLoading: false,
            login: this.login,
            logout: this.logout,
            makeHttpCall: this.makeHttpCall,
            getToken: this.getToken,
            getProfile: this.getProfile,
        };
        /* eslint-enable react/no-unused-state */
    }

    componentWillUnmount() {
        if (this.isLoadingFalseTimerId) {
            window.clearTimeout(this.isLoadingFalseTimerId);
            this.isLoadingFalseTimerId = null;
        }
    }

    doLoginPost = async (email, password) => {
        return axios.post(
            `${AppConfig.API_URL}auth/login`,
            {
                email: email,
                password: password,
            },
        );
    };

    login = async (email = null, password = null, redirectUrl = null) => {
        if (email === null || password === null) {
            const response = await this.doLoginPost(AppConfig.DEFAULT_LOGIN_EMAIL, AppConfig.DEFAULT_LOGIN_PASSWORD);
            this.anonymousAuthToken = response.data.token;
        }
        else {
            const response = await this.doLoginPost(email, password);
            this.userAuthToken = response.data.token;
            this.saveTokenInLocalStorage(this.userAuthToken);
            this.setState({
                isAuthenticated: true,
            }, () => {
                window.location = redirectUrl || "/"; // router not available at this point
            });
        }
    };

    logout = async ($event) => {
        $event.preventDefault();

        this.userAuthToken = null;
        this.removeTokenFromLocalStorage();

        if (AppConfig.LOGIN_REQUIRED) {
            window.location = "/login"; // router not available at this point
        }
    };

    getTokenFromLocalStorage = () => {
        return window.localStorage.getItem("kk_auth_token");
    };

    saveTokenInLocalStorage = (token) => {
        window.localStorage.setItem("kk_auth_token", token);
    };

    removeTokenFromLocalStorage = () => {
        window.localStorage.removeItem("kk_auth_token");
    };

    tokenExpiryInSeconds = (token) => {
        const now = Date.now();
        const decodedToken = JWT.decode(token, { json: true });
        return decodedToken.exp - (now / 1000);
    };

    isTokenExpired = (token) => {
        return this.tokenExpiryInSeconds(token) <= 0;
    };

    isTokenCloseToExpiry = (token) => {
        return this.tokenExpiryInSeconds(token) < 300;
    };

    refreshToken = async (token) => {
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const response = await axios.get(`${AppConfig.API_URL}auth/refresh`, requestConfig);
        return response.data.token;
    };

    getToken = async (isAnonymous) => {
        if (isAnonymous) {
            if (!this.anonymousAuthToken || this.isTokenExpired(this.anonymousAuthToken)) {
                // do "anonymous" login using default login credentials
                await this.login();
            }

            // check if token is close to expiry, and refresh it if yes
            if (this.isTokenCloseToExpiry(this.anonymousAuthToken)) {
                this.anonymousAuthToken = await this.refreshToken(this.anonymousAuthToken);
            }

            return this.anonymousAuthToken;
        }

        if (!this.userAuthToken) {
            this.userAuthToken = this.getTokenFromLocalStorage();
        }

        if (!this.userAuthToken || this.isTokenExpired(this.userAuthToken)) {
            // user must log in, redirect to login page

            // keep record of path and query params and pass to login for redirecting user to originally intended path
            // after successful login
            const pathName = window.location.pathname;
            const searchParams = window.location.search;
            const redirectUrl = pathName
                ? `?redirect_url=${encodeURIComponent(`${pathName}${searchParams}`)}`
                : "";

            window.location = `/login${redirectUrl}`; // router not available at this point
            throw new Error("User is not authenticated");
        }

        // check if token is close to expiry, and refresh it if yes
        if (this.isTokenCloseToExpiry(this.userAuthToken)) {
            this.userAuthToken = await this.refreshToken(this.userAuthToken);
        }

        const { isAuthenticated } = this.state;
        if (!isAuthenticated) {
            this.setState({
                isAuthenticated: true,
            });
        }

        return this.userAuthToken;
    };

    getProfile = () => {
        return decode(this.userAuthToken);
    };

    getRequestConfig = async (path, method, config, isAnonymous) => {
        const absolutePath = `${AppConfig.API_URL}${path}`;
        const token = await this.getToken(isAnonymous);

        const requestConfig = {
            ...config,
            method: method,
            url: absolutePath,
        };
        if (Object.prototype.hasOwnProperty.call(requestConfig, "headers")) {
            requestConfig.headers.Authorization = `Bearer ${token}`;
        }
        else {
            requestConfig.headers = { Authorization: `Bearer ${token}` };
        }
        return requestConfig;
    };

    makeHttpCall = async (path, method = "get", config = null, isAnonymous = !AppConfig.LOGIN_REQUIRED) => {
        if (this.isLoadingFalseTimerId) {
            window.clearTimeout(this.isLoadingFalseTimerId);
            this.isLoadingFalseTimerId = null;
        }
        const { isLoading } = this.state;
        if(!isLoading) {
            this.setState({
                isLoading: true, // eslint-disable-line react/no-unused-state
            });
        }

        try {
            const requestConfig = await this.getRequestConfig(path, method, config, isAnonymous);
            return axios(requestConfig);
        }
        catch(error){
            console.log(error)
        }
        finally {
            this.setIsLoadingFalse();
        }
    };

    // stops the loading spinner from "stuttering" with many sequential requests
    setIsLoadingFalse = () => {
        if (!this.isLoadingFalseTimerId) {
            this.isLoadingFalseTimerId = window.setTimeout(() => {
                this.setState({
                    isLoading: false, // eslint-disable-line react/no-unused-state
                });
            }, 1800);
        }
    };

    render() {
        const { children } = this.props;

        return (
            <AuthContext.Provider value={this.state}>
                {children}
            </AuthContext.Provider>
        );
    }
}
AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const AuthConsumer = AuthContext.Consumer;

export default class AppConfig {
    static get GCP_PROJECT_ID() {
        return "kujakuja-dev";
    }

    static get API_URL() {
        // return "http://localhost:8080/api/v3/";
        return "https://api.dev.ccd.kujakuja.com/api/v3/";
    }

    static get LOGIN_REQUIRED() {
        return false;
    }

    static get DEFAULT_LOGIN_EMAIL() {
        return "website@kujakuja.com";
    }

    static get DEFAULT_LOGIN_PASSWORD() {
        return "website_pass";
    }

    static get SITE_HEADER_DEFAULT_HIGHLIGHT_COLOUR() {
        return "#FFC300";
    }

    static get SITE_HEADER_DEFAULT_TITLE_TEXT() {
        return "Customer feedback";
    }

    static get GOOGLE_TRANSLATE_API_KEY() {
        return "AIzaSyDDD5DC0CLCoK9nG2N2vJRSNAK9hVAy6ng";
    }

    static get TOP_KEYWORDS_ENABLED() {
        return true;
    }

    static get TOP_KEYWORDS_LOGIN_URL() {
        return "https://kujakuja.co/login";
        // return "http://127.0.0.1:5000/login";
    }

    static get TOP_KEYWORDS_LOGIN_USERNAME() {
        return "api_user";
    }

    static get TOP_KEYWORDS_LOGIN_PASSWORD() {
        return "d<eFrSGw9v]D@PHP";
    }

    static get TOP_KEYWORDS_API_URL() {
        return "https://kujakuja.co/kujakuja/alight/keywords/v1";
    }

    static get DATA_STUDIO_GRAPH_URL() {
        return "https://kujakuja.com";
    }
}

import moment from "moment";

// returns an object containing the URL query params
// - does not change their type (everything's a string)
// - allows multiple, digit param values for a single param key to be comma-separated
//   (rather than adhering to the 'standard' pattern where the param key is repeated, eg: ?longParamName=1&longParamName=2)
// **NB: digit params are always returned as an array
export const getQueryParamsFromUrl = (query) => {
    const searchQuery = query || window.location.search;
    const searchParams = new URLSearchParams(searchQuery);

    const params = {};

    for (const p of searchParams) { // eslint-disable-line no-unused-vars
        const key = p[0];
        let val = p[1];

        if (val.search(/^\d+$/) === 0) {
            val = [val];
        }
        else if (val.search(/^\d+(,\d+)*$/) === 0) {
            val = val.split(",");
        }
        params[key] = val;
    }

    return params;
};

export const remapQueryParamsToGlobalFilterStateVariableNames = (queryParams) => {
    // this function renames query param names, on the left, to the equivalent state variable names, on the right
    // *note that some state variable names are repeated - this is because the query param names come from API
    // endpoint param names, and these are not always consistent
    const map = {
        "countries": "selectedCountries",
        "settlements": "selectedLocations",
        "service_types": "selectedServiceTypes", // *
        "types": "selectedServiceTypes", // *
        "points": "selectedServicePoints",
        "start": "dateStart",
        "end": "dateEnd"
    };

    // avoid mutating queryParams, create a copy
    const mappedParams = Object.assign({}, queryParams);

    for (const entry of Object.entries(map)) { // eslint-disable-line no-unused-vars
        if (mappedParams.hasOwnProperty(entry[0])) {
            mappedParams[entry[1]] = mappedParams[entry[0]];
            delete mappedParams[entry[0]];
        }
    }

    return mappedParams;
};

// returns a new object, which excludes any params that are not relevant to the global filter
// also "re-moment-ises" the date params
export const getGlobalFilterParams = (params) => {
    const globalFilterParamsKeys = [
        "selectedCountries",
        "selectedLocations",
        "selectedServicePoints",
        "selectedServiceTypes",
        "dateStart",
        "dateEnd"
    ];

    let filteredParams =  Object.fromEntries(
        Object.entries(params).filter(p => globalFilterParamsKeys.includes(p[0]))
    );

    if (filteredParams.hasOwnProperty("dateStart")) {
        filteredParams.dateStart = moment(filteredParams.dateStart);
    }
    if (filteredParams.hasOwnProperty("dateEnd")) {
        filteredParams.dateEnd = moment(filteredParams.dateEnd);
    }

    return filteredParams;
};

// returns a new object, which excludes any falsy values as well as empty arrays
export const getDefinedParams = (params) => {
    return Object.fromEntries(
        Object.entries(params).filter(p => p[1] && p[1].toString().length > 0)
    );
};


export const isValidUrl = (url) => {
    try {
        new URL(url);
    }
    catch (e) {
        return false;
    }
    return true;
};

export const getIdeafeedParamsFromUrl = (url) => {
    const paramsObj = {};
    let definedParams = {};

    if (isValidUrl(url)) {
        const { searchParams } = new URL(url);

        paramsObj.startDate = searchParams.get("start");
        paramsObj.endDate = searchParams.get("end");
        paramsObj.keyword = searchParams.get("keyword");
        definedParams = getDefinedParams(paramsObj);
    }

    return definedParams;
};

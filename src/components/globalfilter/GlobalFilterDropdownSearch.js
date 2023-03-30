import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { Input } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import i18n from "i18next";

const GlobalFilterDropdownSearch = ({
    className, items, itemLabelProperty, setResults, searchTerm, setSearchTerm,
}) => {
    const handleSearch = useCallback(
        (e) => {
            const eventSearchTerm = e.target.value;
            const lowerCasedSearchTerm = eventSearchTerm.toLowerCase();
            const results = items.filter((item) => {
                return item[itemLabelProperty].toLowerCase().includes(lowerCasedSearchTerm);
            });
            setResults(results);
            setSearchTerm(eventSearchTerm);
        }, [items, itemLabelProperty, setResults, setSearchTerm],
    );

    return (
        <div className={`${className} globalfilter-search-container`}>
            <div className="map-controls-search-icon">
                <FontAwesomeIcon icon="search" />
            </div>
            <Input
                type="text"
                onChange={handleSearch}
                className="map-controls-search"
                placeholder={i18n.t("globalHeader.search")}
                defaultValue={searchTerm}
            />
        </div>
    );
};

GlobalFilterDropdownSearch.propTypes = {
    className: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    itemLabelProperty: PropTypes.string.isRequired,
    setResults: PropTypes.func.isRequired,
    searchTerm: PropTypes.string,
    setSearchTerm: PropTypes.func,
};

GlobalFilterDropdownSearch.defaultProps = {
    className: "",
    searchTerm: "",
    setSearchTerm: () => {},
};

export default GlobalFilterDropdownSearch;

export default {
    'Data map page displays correctly' : browser => {
        browser
            .url(browser.launch_url)
            .waitForElementVisible('body')
            .waitForElementVisible('.loading-overlay')
            .waitForElementVisible('.globalfilter-search-container')
            .waitForElementVisible('.globalfilter-locations-container')
            .waitForElementVisible('.globalfilter-calendar-container')
            .waitForElementVisible('.globalfilter-service-container')
            .waitForElementVisible('.map-datapanel-show')
            .waitForElementVisible('.mapboxgl-marker', 20000)
            .waitForElementVisible('.mapboxMap')
            .assert.containsText('.powered-by', 'POWERED BY KUJA KUJA')
            .pause(1000);
    },

    'Select a country from the filter dropdown' : browser => {
        browser
            .assert.containsText('#CountriesDropDown', 'Countries')
            .click('#CountriesDropDown')
            .waitForElementVisible('.map-controls-popover-list')
            .click('.form-check-label')
            .waitForElementVisible('.loading-overlay')
            .assert.containsText('#CountriesDropDown', 'Rwanda')
            .pause(10000)
    },

    'Select a location from the filter dropdown' : browser => {
        browser
            .assert.containsText('#LocationsDropDown', 'Locations')
            .click('#LocationsDropDown')
            .waitForElementVisible('.map-controls-popover-list')
            .click('.form-check-label')
            .waitForElementVisible('.loading-overlay')
            .assert.containsText('#LocationsDropDown', 'ARC Kism...')
            .pause(20000)
    },

    'Select date range from the date filter' : browser => {
        browser
            .waitForElementVisible('.date-picker-startdate')
            .pause(5000)
            .click('.date-picker-startdate')
            .waitForElementVisible('.react-datepicker')
            .click('.react-datepicker__day--mon')
            .waitForElementVisible('.loading-overlay')
            .pause(30000)
            .waitForElementVisible('.react-datepicker')
            .click('.react-datepicker__day--sat')
            .waitForElementVisible('.loading-overlay')
            .pause(1000)
            .end();
    }
}

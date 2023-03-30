import React from 'react';
import { render } from 'enzyme';
import GlobalFilter from '../../components/globalfilter/GlobalFilter';
import moment from 'moment';

describe('<GlobalFilter/> static rendering tests', () => {
    let today = moment.utc().startOf('day');

    const wrapper = render(
        <GlobalFilter
            dateStart={today.clone().subtract(7, 'days')}
            dateEnd={today}
            allCountries={[]}
            selectedCountries={[]}
            allLocations={[]}
            selectedLocations={[]}
        />
    );

    it('should contain a search textbox', () => {
        expect(wrapper.find('#search')).toHaveLength(1);
    });

    it('should contain a countries dropdown', () => {
        expect(wrapper.find('#CountriesDropDown')).toHaveLength(1);
    });

    it('should contain a locations dropdown', () => {
        expect(wrapper.find('#LocationsDropDown')).toHaveLength(1);
    });

    it('should contain start date picker', () => {
        expect(wrapper.find('.date-picker-startdate')).toHaveLength(1);
    });

    it('should contain end date picker', () => {
        expect(wrapper.find('.date-picker-enddate')).toHaveLength(1);
    });

    it('should contain service type buttons', () => {
        expect(wrapper.find('.globalfilter-service-container')).toHaveLength(2); // 2 because the GlobalFilterServices component is re-used for the mobile version
    });
});




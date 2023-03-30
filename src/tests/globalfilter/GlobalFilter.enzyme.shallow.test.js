import React from 'react';
import { shallow } from 'enzyme';
import GlobalFilter from '../../components/globalfilter/GlobalFilter';
import moment from 'moment';

it('renders without crashing', () => {
    let today = moment.utc().startOf('day');

    shallow(
        <GlobalFilter
            dateStart={today.clone().subtract(7, 'days')}
            dateEnd={today}
            selectedCountries={[]}
            selectedLocations={[]}
        />
    );
});

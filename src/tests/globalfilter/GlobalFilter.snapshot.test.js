import React from 'react';
import renderer from 'react-test-renderer';
import GlobalFilter from '../../components/globalfilter/GlobalFilter';
import moment from 'moment';

it('renders correctly', () => {
    let fixedDate = moment.utc('2019-07-17').startOf('day');

    const tree = renderer.create(
        <GlobalFilter
            dateStart={fixedDate.clone().subtract(7, 'days')}
            dateEnd={fixedDate}
            allCountries={[]}
            selectedCountries={[]}
            allLocations={[]}
            selectedLocations={[]}
            selectedServiceTypes={[]}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

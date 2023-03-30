import React from 'react';
import renderer from 'react-test-renderer';
import SnapshotsPage from '../../components/snapshots/SnapshotsPage';
import moment from 'moment';

it('renders correctly', () => {
    let fixedDate = moment.utc('2019-07-17').startOf('day');

    const tree = renderer.create(
        <SnapshotsPage
            allCountries={[]}
            allLocations={[]}
            selectedCountries={[]}
            selectedLocations={[]}
            dateStart={fixedDate.clone().subtract(7, 'days')}
            dateEnd={fixedDate}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

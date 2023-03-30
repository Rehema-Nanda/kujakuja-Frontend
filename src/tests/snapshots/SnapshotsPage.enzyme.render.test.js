import React from 'react';
import { render } from 'enzyme';
import SnapshotsPage from '../../components/snapshots/SnapshotsPage';
import moment from 'moment';

describe('<SnapshotsPage/> static rendering tests', () => {
    let today = moment.utc().startOf('day');

    const wrapper = render(
        <SnapshotsPage
            allCountries={[]}
            allLocations={[]}
            selectedCountries={[]}
            selectedLocations={[]}
            dateStart={today.clone().subtract(7, 'days')}
            dateEnd={today}
        />
    );

    it('should contain .snapshots-page-title class', () => {
        expect(wrapper.find('.snapshots-page-title')).toHaveLength(1);
    });

    it('should contain .snapshots-page-bg class', () => {
        expect(wrapper.find('.snapshots-page-bg')).toHaveLength(1);
    });
});

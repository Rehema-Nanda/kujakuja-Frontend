import React from 'react';
import renderer from 'react-test-renderer';
import SnapshotCardDates from '../../components/snapshots/SnapshotCardDates';
import moment from 'moment';

it('renders correctly', () => {
    let fixedDate = moment.utc('2019-07-17').startOf('day');

    const tree = renderer.create(
        <SnapshotCardDates
            singleDay={true}
            start={fixedDate.clone().subtract(1, 'days')}
            end={fixedDate}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

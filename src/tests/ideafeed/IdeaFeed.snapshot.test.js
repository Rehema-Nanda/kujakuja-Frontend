import React from 'react';
import renderer from 'react-test-renderer';
import IdeaFeedPage from '../../components/ideafeed/IdeaFeedPage';
import moment from 'moment';

it('renders correctly', () => {
    let fixedDate = moment.utc('2019-07-17').startOf('day');

    const tree = renderer.create(
        <IdeaFeedPage
            allCountries={[]}
            allLocations={[]}
            selectedCountries={[]}
            selectedLocations={[]}
            selectedServiceTypes={[]}
            dateStart={fixedDate.clone().subtract(7, 'days')}
            dateEnd={fixedDate}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

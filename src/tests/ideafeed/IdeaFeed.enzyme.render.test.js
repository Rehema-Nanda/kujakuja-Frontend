import React from 'react';
import { render } from 'enzyme';
import IdeaFeedPage from '../../components/ideafeed/IdeaFeedPage';
import moment from 'moment';

describe('<IdeaFeedPage/> static rendering tests', () => {
    let today = moment.utc().startOf('day');

    const wrapper = render(
        <IdeaFeedPage
            allCountries={[]}
            allLocations={[]}
            selectedCountries={[]}
            selectedLocations={[]}
            dateStart={today.clone().subtract(7, 'days')}
            dateEnd={today}
        />
    );

    it('should contain .ideafeed-page-bg class', () => {
        expect(wrapper.find(`.ideafeed-page-bg`)).toHaveLength(1);
    });
});

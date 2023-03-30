import React from 'react';
import renderer from 'react-test-renderer';
import GlobalFilterCalendar from '../../components/globalfilter/GlobalFilterCalendar';
import { CalendarConfig } from '../../components/globalfilter/CalendarConfig';
import moment from 'moment';

it('renders correctly', () => {
    let fixedDate = moment.utc('2019-07-17').startOf('day');

    const tree = renderer.create(
        <GlobalFilterCalendar
            withPortal={false}
            type={CalendarConfig.CALENDAR_DATE}
            dateStart={fixedDate.clone().subtract(7, 'days')}
            dateEnd={fixedDate}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

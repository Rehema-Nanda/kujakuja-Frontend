import React from 'react';
import { shallow } from 'enzyme';
import GlobalFilterCalendar from '../../components/globalfilter/GlobalFilterCalendar';
import { CalendarConfig } from '../../components/globalfilter/CalendarConfig';
import moment from 'moment';

describe('<GlobalFilterCalendar/> shallow rendering tests', () => {
    let today = moment.utc().startOf('day');

    const mockFn = jest.fn().mockName('setDateStartEnd');

    const wrapper = shallow(
        <GlobalFilterCalendar
            withPortal={false}
            setDateStartEnd={mockFn}
            type={CalendarConfig.CALENDAR_DATE}
            dateStart={today.clone().subtract(7, 'days')}
            dateEnd={today}
        />
    );

    it('should call setDateStartEnd when one of the arrow buttons is clicked', () => {
        wrapper.find('.left-right-button').first().simulate('click');
        expect(mockFn).toHaveBeenCalled();
    });
});

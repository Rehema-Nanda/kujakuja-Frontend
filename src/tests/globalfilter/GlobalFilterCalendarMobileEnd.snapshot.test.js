import React from 'react';
import moment from 'moment';
import renderer from 'react-test-renderer';
import GlobalFilterCalendarMobileEnd from '../../components/globalfilter/GlobalFilterCalendarMobileEnd';

const testProps = {
    dateStart: moment.utc('2017-01-01'),
    dateEnd: moment.utc('2018-01-01'),
    setDateStartEnd: jest.fn(),
    displayMobileFilter: jest.fn()
};

const wrapper = renderer.create(<GlobalFilterCalendarMobileEnd {...testProps} />).toJSON();

it("renders correctly", () => {
    expect(wrapper).toMatchSnapshot();
});

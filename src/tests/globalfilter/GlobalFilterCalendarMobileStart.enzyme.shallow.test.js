import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import GlobalFilterCalendarMobileStart from '../../components/globalfilter/GlobalFilterCalendarMobileStart';

describe("<GlobalFilterCalendarMobileStart /> shallow rendering tests", () => {
    const testProps = {
        dateStart: moment.utc('2017-01-01'),
        dateEnd: moment.utc('2018-01-01'),
        setDateStartEnd: jest.fn(),
        displayMobileFilter: jest.fn()
    };
    const wrapper = shallow(<GlobalFilterCalendarMobileStart {...testProps} />);

    it("should call handleDateChangeStart function when the date changes", () => {
        const testFunc = jest.spyOn(wrapper.instance(), 'handleDateChangeStart');
        wrapper.instance().forceUpdate(); // reason here https://github.com/airbnb/enzyme/issues/944
        const datePicker = wrapper.find('.date-picker-startdate');
        datePicker.simulate('change');
        expect(testFunc).toHaveBeenCalled();
    });
});

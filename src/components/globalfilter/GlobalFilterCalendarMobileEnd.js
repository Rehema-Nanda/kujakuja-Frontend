
import React from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import GlobalFilterCalendarContainer from "./GlobalFilterCalendarContainer";
import {CalendarConfig} from "./CalendarConfig";

export default class GlobalFilterCalendarMobileEnd extends GlobalFilterCalendarContainer {

    constructor(props) {
        super(props);
        this.handleDateChangeEnd = this.handleDateChangeEnd.bind(this);
        this.state = {
            selectedDateRangeType: this.getDateRangeType(),
            isMobileView: true
        };
    }

    handleDateChangeEnd(endDate) {
        this.handleDateRangeSelect(this.props.dateStart, moment(endDate), CalendarConfig.IS_END_DATE);
        this.props.displayMobileFilter();
    }

    render() {

        return (

            <div className="date-pickers-holder fadein">
                <DatePicker inline
                    className="date-picker-startdate"
                    withPortal={this.props.withPortal}
                    selected={this.props.dateEnd.toDate()}
                    selectsEnd
                    ref={CalendarConfig.END_DATE_PICKER_REF}
                    startDate={this.props.dateStart.toDate()}
                    endDate={this.props.dateEnd.toDate()}
                    maxDate={moment.utc().startOf('day').toDate()}
                    calendarContainer={this.calendarContainer.bind(this)}
                    onChange={this.handleDateChangeEnd} />
            </div>

        );
    }

}

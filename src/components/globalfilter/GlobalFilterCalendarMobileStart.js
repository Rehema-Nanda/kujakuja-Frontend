
import React from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import GlobalFilterCalendarContainer from "./GlobalFilterCalendarContainer";
import {CalendarConfig} from "./CalendarConfig";

export default class GlobalFilterCalendarMobileStart extends GlobalFilterCalendarContainer {

    constructor(props) {
        super(props);
        this.handleDateChangeStart = this.handleDateChangeStart.bind(this);
        this.state = {
            selectedDateRangeType: this.getDateRangeType(),
            isMobileView: true
        };
    }

    handleDateChangeStart(startDate) {
        this.handleDateRangeSelect(moment(startDate), this.props.dateEnd, CalendarConfig.IS_START_DATE);
        this.props.displayMobileFilter();
    }

    render() {

        return (

            <div className="date-pickers-holder fadein">
                <DatePicker inline
                    className="date-picker-startdate"
                    withPortal={this.props.withPortal}
                    selected={this.props.dateStart.toDate()}
                    selectsStart
                    ref={CalendarConfig.START_DATE_PICKER_REF}
                    startDate={this.props.dateStart.toDate()}
                    endDate={this.props.dateEnd.toDate()}
                    maxDate={moment.utc().startOf('day').toDate()}
                    calendarContainer={this.calendarContainer.bind(this)}
                    onChange={this.handleDateChangeStart} />
            </div>

        );
    }

}

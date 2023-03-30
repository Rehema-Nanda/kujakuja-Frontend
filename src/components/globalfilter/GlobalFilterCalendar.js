import React from 'react';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import './GlobalFilter.css';
import GlobalFilterCalendarContainer from "./GlobalFilterCalendarContainer";
import {CalendarConfig} from "./CalendarConfig";

export default class GlobalFilterCalendar extends GlobalFilterCalendarContainer {

    constructor(props) {
        super(props);

        this.handleDateChangeStart = this.handleDateChangeStart.bind(this);
        this.handleDateChangeEnd = this.handleDateChangeEnd.bind(this);
        this.datePickerInputFocusHandler = this.datePickerInputFocusHandler.bind(this);

        setTimeout(() => {
            this.setState(
            {
                selectedDateRangeType: this.getDateRangeType(),
                isMobileView: false
            }
            )
        }, 0);
    }

    handleDateChangeStart(startDate) {
        this.handleDateRangeSelect(moment(startDate), this.props.dateEnd, CalendarConfig.IS_START_DATE);
    }

    handleDateChangeEnd(endDate) {
        this.handleDateRangeSelect(this.props.dateStart, moment(endDate), CalendarConfig.IS_END_DATE);
    }

    datePickerInputFocusHandler(e) {
        // immediately blur on focus to prevent the virtual keyboard from displaying on mobile devices
        // TODO: test for side effects, for example if the 'withPortal' option is true (see setBlur, cancelFocusInput, deferFocusInput & handleBlur functions at
        //       https://github.com/Hacker0x01/react-datepicker/blob/master/src/index.jsx)
        if (this.refs) {
            if (this.refs[CalendarConfig.START_DATE_PICKER_REF]) {
                this.refs[CalendarConfig.START_DATE_PICKER_REF].setBlur();
            }
            if (this.refs[CalendarConfig.END_DATE_PICKER_REF]) {
                this.refs[CalendarConfig.END_DATE_PICKER_REF].setBlur();
            }
        }
    }

    render() {

        return (

        <div className="date-pickers-holder">

            <button onClick={() => {
                this.selectNewDateRange(-1)
            }} className='left-right-button left-button'>
                <div className='left-right-arrow left-arrow'></div>
            </button>

            <DatePicker
            className='date-picker-startdate'
            withPortal={this.props.withPortal}
            selected={this.props.dateStart.toDate()}
            selectsStart
            ref={CalendarConfig.START_DATE_PICKER_REF}
            monthsShown={2}
            useWeekdaysShort={true}
            onFocus={this.datePickerInputFocusHandler}
            startDate={this.props.dateStart.toDate()}
            endDate={this.props.dateEnd.toDate()}
            maxDate={moment.utc().startOf('day').toDate()}
            calendarContainer={this.calendarContainer.bind(this)}
            popperPlacement="bottom-start"
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: 'viewport'
              }
            }}
            onSelect={this.handleDateChangeStart}>
            </DatePicker>

            <span className={`dash ${this.state.selectedDateRangeType === CalendarConfig.DAILY ? 'hidden' : ''}`}> - </span>

            <DatePicker
            className={`date-picker-enddate ${this.state.selectedDateRangeType === CalendarConfig.DAILY ? 'hide-date' : ''}`}
            withPortal={this.props.withPortal}
            selected={this.props.dateEnd.toDate()}
            selectsEnd
            ref={CalendarConfig.END_DATE_PICKER_REF}
            monthsShown={2}
            useWeekdaysShort={true}
            onFocus={this.datePickerInputFocusHandler}
            startDate={this.props.dateStart.toDate()}
            endDate={this.props.dateEnd.toDate()}
            maxDate={moment.utc().startOf('day').toDate()}
            calendarContainer={this.calendarContainer.bind(this)}
            popperPlacement="bottom-start"
            popperModifiers={{
              preventOverflow: {
                enabled: true,
                escapeWithReference: false,
                boundariesElement: 'viewport'
              }
            }}
            onSelect={this.handleDateChangeEnd}/>

            <button onClick={() => {
                this.selectNewDateRange(1)
            }} className='left-right-button right-button'>
                <div className='left-right-arrow right-arrow'></div>
            </button>

        </div>

        );
    }

}

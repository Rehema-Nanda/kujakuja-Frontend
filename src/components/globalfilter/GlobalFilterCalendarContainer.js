import React from "react";
import { CalendarContainer } from "react-datepicker";
import i18n from "i18next";
import PropTypes from "prop-types";
import "./GlobalFilter.css";
import { CalendarConfig } from "./CalendarConfig";

export default class GlobalFilterCalendarContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDateRangeType: null,
            customDateStartSpecified: false,
            customDateEndSpecified: false,
            customDayWeekMonthDateSpecified: true,
            isMobileView: false,
        };
    }

    getDateRangeType() {
        const { dateStart, dateEnd, type } = this.props;

        if (dateEnd.diff(dateStart, "days") === 0) {
            return CalendarConfig.DAILY;
        }
        if (type === CalendarConfig.CALENDAR_DATE_ISO
        && dateStart.isoWeekday() === 1
        && dateEnd.isoWeekday() === 7) {
            return CalendarConfig.WEEKLY;
        }
        if (type === CalendarConfig.CALENDAR_DATE
        && dateStart.weekday() === 0
        && dateEnd.weekday() === 6) {
            return CalendarConfig.WEEKLY;
        }
        if (type === CalendarConfig.WEEK_MONTH_TO_DATE
        && Math.abs(dateEnd.diff(dateStart, "weeks")) === 1) {
            return CalendarConfig.WEEKLY;
        }
        if ((type === CalendarConfig.CALENDAR_DATE_ISO || type === CalendarConfig.CALENDAR_DATE)
        && dateStart.date() === 1
        && dateEnd.date() === dateStart.clone().endOf("month").date()) {
            return CalendarConfig.MONTHLY;
        }
        if (type === CalendarConfig.WEEK_MONTH_TO_DATE
        && Math.abs(dateEnd.diff(dateStart, "months")) === 1
        && Math.abs(dateEnd.diff(dateStart, "days")) <= 31) {
            return CalendarConfig.MONTHLY;
        }

        return null;
    }

    setDateRange(dateRangeType, direction) {
        const {
            setDateStartEnd, dateStart, dateEnd, type,
        } = this.props;

        if (!Number.isInteger(direction) || direction > 1 || direction < -1) { // can only be -1, 0 or 1
            throw new Error("Invalid direction value stipulated");
        }

        this.setState({
            selectedDateRangeType: dateRangeType,
            customDayWeekMonthDateSpecified: true,
        }, () => {
            switch (dateRangeType) {
                case CalendarConfig.DAILY:

                    if (direction === 0) {
                        this.setState({
                            customDayWeekMonthDateSpecified: false,
                        }, () => {
                            setDateStartEnd(dateStart, dateStart, null);
                            this.closeDatePickersIfApplicable();
                        });
                    }
                    else {
                        setDateStartEnd(dateEnd.clone().add(direction, "days"),
                                        dateEnd.add(direction, "days"));
                        this.closeDatePickersIfApplicable();
                    }
                    break;

                case CalendarConfig.WEEKLY:

                    if (direction === 0) {
                        this.setState({
                            customDayWeekMonthDateSpecified: false,
                        }, () => {
                            setDateStartEnd(dateStart.clone().startOf("week"), dateStart.clone().endOf("week"), null);
                            this.closeDatePickersIfApplicable();
                        });
                    }
                    else {
                        if (type === CalendarConfig.CALENDAR_DATE_ISO) {
                            setDateStartEnd(dateEnd.clone().startOf("isoWeek").add(direction, "weeks"),
                                            dateEnd.clone().endOf("isoWeek").add(direction, "weeks"));
                        }
                        else if (type === CalendarConfig.CALENDAR_DATE) {
                            setDateStartEnd(dateEnd.clone().startOf("week").add(direction, "weeks"),
                                            dateEnd.clone().endOf("week").add(direction, "weeks"));
                        }
                        else {
                            setDateStartEnd(dateStart.clone().add(direction, "weeks"), dateEnd.clone().add(direction, "weeks"));
                        }
                        this.closeDatePickersIfApplicable();
                    }
                    break;

                case CalendarConfig.MONTHLY:

                    if (direction === 0) {
                        this.setState({
                            customDayWeekMonthDateSpecified: false,
                        }, () => {
                            setDateStartEnd(dateStart.clone().startOf("month"), dateStart.clone().endOf("month"), null);
                            this.closeDatePickersIfApplicable();
                        });
                    }
                    else {
                        if (type === CalendarConfig.CALENDAR_DATE_ISO || type === CalendarConfig.CALENDAR_DATE) {
                            setDateStartEnd(dateEnd.clone().startOf("month").add(direction, "months"),
                                            dateEnd.clone().endOf("month").add(direction, "months").endOf("month"));
                        }
                        else {
                            setDateStartEnd(dateStart.clone().add(direction, "months"), dateEnd.clone().add(direction, "months"));
                        }
                        this.closeDatePickersIfApplicable();
                    }
                    break;

                default:

                    this.setState({
                        customDateStartSpecified: false,
                        customDateEndSpecified: false,
                    }, () => {
                        if (direction !== 0) {
                            const dayDifference = dateEnd.diff(dateStart, "days");
                            setDateStartEnd(dateStart.clone().add(direction * dayDifference, "days"),
                                            dateEnd.clone().add(direction * dayDifference, "days"));
                        }
                        this.closeDatePickersIfApplicable();
                    });
            }
        });
    }

    checkIfBothCustomDatesSpecified = (startDate, endDate) => {
        const { customDateStartSpecified, customDateEndSpecified } = this.state;
        const { setDateStartEnd } = this.props;

        if (customDateStartSpecified && customDateEndSpecified) {
            if (endDate.isBefore(startDate)) {
                setDateStartEnd(endDate, startDate, false);

                this.setState({
                    customDateStartSpecified: true,
                    customDateEndSpecified: false,
                }, () => {
                    this.closeStartDatePicker();
                    this.closeEndDatePicker();
                });
            }
            else {
                setDateStartEnd(startDate, endDate, true);
                this.setState({
                    customDateStartSpecified: false,
                    customDateEndSpecified: false,
                }, () => {
                    this.closeStartDatePicker();
                    this.closeEndDatePicker();
                });
            }
        }
    };

    handleDateRangeSelect(startDate, endDate, startOrEndDateSelected) {
        const { setDateStartEnd, type } = this.props;
        const {
            selectedDateRangeType, customDateStartSpecified, customDateEndSpecified, isMobileView,
        } = this.state;
        const selectedDate = startOrEndDateSelected === CalendarConfig.IS_START_DATE ? startDate : endDate;
        this.setState({
            customDayWeekMonthDateSpecified: true,
        });

        switch (selectedDateRangeType) {
            case CalendarConfig.DAILY:

                setDateStartEnd(selectedDate, selectedDate);
                break;

            case CalendarConfig.WEEKLY:

                if (type === CalendarConfig.CALENDAR_DATE_ISO) {
                    setDateStartEnd(selectedDate.clone().startOf("isoWeek"), selectedDate.clone().endOf("isoWeek"));
                }
                else if (type === CalendarConfig.CALENDAR_DATE) {
                    setDateStartEnd(selectedDate.clone().startOf("week"), selectedDate.clone().endOf("week"));
                }
                else {
                    setDateStartEnd(selectedDate.clone().add(-1, "weeks"), selectedDate.clone());
                }
                break;

            case CalendarConfig.MONTHLY:

                if (type === CalendarConfig.CALENDAR_DATE_ISO || type === CalendarConfig.CALENDAR_DATE) {
                    setDateStartEnd(selectedDate.clone().startOf("month"), selectedDate.clone().endOf("month"));
                }
                else {
                    setDateStartEnd(selectedDate.clone().add(-1, "months"), selectedDate.clone());
                }
                break;

            default:

                // ***CUSTOM DATE RANGE***

                if (!customDateStartSpecified || !customDateEndSpecified) {
                    // this is a workaround to allow for custom date range selection in the mobile filter
                    // it doesn't automatically prompt the user to select the 'other' date, nor does it display the
                    // hints ("Please select a ...") that you see in the desktop filter
                    if (isMobileView) {
                        setDateStartEnd(startDate, endDate, true);
                        return;
                    }


                    // which date picker is open, the start or end date ?
                    if (this.refs[CalendarConfig.START_DATE_PICKER_REF] && this.refs[CalendarConfig.START_DATE_PICKER_REF].state.open) {
                        // mark start date as specified, open end date picker
                        this.setState({
                            customDateStartSpecified: true,
                        }, () => {
                            setDateStartEnd(startDate, startDate, false);
                            this.closeStartDatePicker();
                            this.openEndDatePicker();
                            this.checkIfBothCustomDatesSpecified(startDate, endDate);
                        });
                    }
                    else {
                        // mark end date as specified, open start date picker
                        this.setState({
                            customDateEndSpecified: true,
                        }, () => {
                            setDateStartEnd(endDate, endDate, false);
                            this.closeEndDatePicker();
                            this.openStartDatePicker();
                            this.checkIfBothCustomDatesSpecified(startDate, endDate);
                        });
                    }
                }
        }
    }

    selectNewDateRange(direction) {
        this.setDateRange(this.getDateRangeType(), direction);
    }

    closeStartDatePicker() {
        if (this.refs && this.refs[CalendarConfig.START_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.START_DATE_PICKER_REF].cancelFocusInput();
        }
        if (this.refs && this.refs[CalendarConfig.START_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.START_DATE_PICKER_REF].setOpen(false);
        }
    }

    closeEndDatePicker() {
        if (this.refs && this.refs[CalendarConfig.END_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.END_DATE_PICKER_REF].cancelFocusInput();
        }
        if (this.refs && this.refs[CalendarConfig.END_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.END_DATE_PICKER_REF].setOpen(false);
        }
    }

    openStartDatePicker() {
        if (this.refs && this.refs[CalendarConfig.START_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.START_DATE_PICKER_REF].setOpen(true);
        }
    }

    openEndDatePicker() {
        if (this.refs && this.refs[CalendarConfig.END_DATE_PICKER_REF]) {
            this.refs[CalendarConfig.END_DATE_PICKER_REF].setOpen(true);
        }
    }

    displayStartDateSelectHeader() {
        const { selectedDateRangeType, customDateStartSpecified } = this.state;

        return (selectedDateRangeType === null
        && !customDateStartSpecified
        && this.refs[CalendarConfig.START_DATE_PICKER_REF]
        && this.refs[CalendarConfig.START_DATE_PICKER_REF].state.open);
    }

    displayEndDateSelectHeader() {
        const { selectedDateRangeType, customDateEndSpecified } = this.state;

        return (selectedDateRangeType === null
        && !customDateEndSpecified
        && this.refs[CalendarConfig.END_DATE_PICKER_REF]
        && this.refs[CalendarConfig.END_DATE_PICKER_REF].state.open);
    }

    displaySelectDayHeader() {
        const { customDayWeekMonthDateSpecified, selectedDateRangeType } = this.state;

        return !customDayWeekMonthDateSpecified && selectedDateRangeType === CalendarConfig.DAILY;
    }

    displaySelectWeekHeader() {
        const { customDayWeekMonthDateSpecified, selectedDateRangeType } = this.state;

        return !customDayWeekMonthDateSpecified && selectedDateRangeType === CalendarConfig.WEEKLY;
    }

    displaySelectMonthHeader() {
        const { customDayWeekMonthDateSpecified, selectedDateRangeType } = this.state;

        return !customDayWeekMonthDateSpecified && selectedDateRangeType === CalendarConfig.MONTHLY;
    }

    closeDatePickersIfApplicable() {
        const { selectedDateRangeType, customDayWeekMonthDateSpecified } = this.state;

        if (selectedDateRangeType !== null && customDayWeekMonthDateSpecified) {
            this.closeStartDatePicker();
            this.closeEndDatePicker();
        }
    }

    calendarContainer({ className, children }) {
        const { selectedDateRangeType } = this.state;

        return (
            <div>
                <CalendarContainer className={className}>
                    <div className="custom-date-parent">

                        <button
                            type="button"
                            className={`btn btn-light custom-date ${selectedDateRangeType === CalendarConfig.DAILY ? "selected btn-dark " : ""}`}
                            onClick={() => {
                                this.setDateRange(CalendarConfig.DAILY, 0);
                            }}
                        >
                            {i18n.t("calendarConfig.daily")}
                        </button>

                        <button
                            type="button"
                            className={`btn btn-light custom-date ${selectedDateRangeType === CalendarConfig.WEEKLY ? "selected btn-dark " : ""}`}
                            onClick={() => {
                                this.setDateRange(CalendarConfig.WEEKLY, 0);
                            }}
                        >
                            {i18n.t("calendarConfig.weekly")}
                        </button>
                        <button
                            type="button"
                            className={`btn btn-light custom-date ${selectedDateRangeType === CalendarConfig.MONTHLY ? "selected btn-dark " : ""}`}
                            onClick={() => {
                                this.setDateRange(CalendarConfig.MONTHLY, 0);
                            }}
                        >
                            {i18n.t("calendarConfig.monthly")}
                        </button>

                        <button
                            type="button"
                            className={`btn btn-light custom-date ${selectedDateRangeType == null ? "selected btn-dark " : ""}`}
                            onClick={() => {
                                this.setDateRange(null, 0);
                            }}
                        >
                            {i18n.t("calendarConfig.custom")}
                        </button>

                    </div>
                    <div style={{ position: "relative" }}>
                        {children}
                    </div>
                    <h5 className="choose-from-end-date" style={{ display: this.displayStartDateSelectHeader() ? "block" : "none" }}>{CalendarConfig.HEADING_CUSTOM_START_DATE}</h5>
                    <h5 className="choose-from-end-date" style={{ display: this.displayEndDateSelectHeader() ? "block" : "none" }}>{CalendarConfig.HEADING_CUSTOM_END_DATE}</h5>
                    <h5 className="choose-from-end-date" style={{ display: this.displaySelectDayHeader() ? "block" : "none" }}>{CalendarConfig.HEADING_SELECT_DATE_DAY}</h5>
                    <h5 className="choose-from-end-date" style={{ display: this.displaySelectWeekHeader() ? "block" : "none" }}>{CalendarConfig.HEADING_SELECT_DATE_WEEK}</h5>
                    <h5 className="choose-from-end-date" style={{ display: this.displaySelectMonthHeader() ? "block" : "none" }}>{CalendarConfig.HEADING_SELECT_DATE_MONTH}</h5>
                </CalendarContainer>
            </div>
        );
    }
}

GlobalFilterCalendarContainer.propTypes = {
    dateEnd: PropTypes.objectOf(PropTypes.any).isRequired,
    dateStart: PropTypes.objectOf(PropTypes.any).isRequired,
    type: PropTypes.string.isRequired,
    setDateStartEnd: PropTypes.func.isRequired,
};

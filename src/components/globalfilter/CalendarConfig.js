import i18n from "i18next";

export class CalendarConfig {
    static get DAILY() {
        return 'daily';
    }

    static get WEEKLY() {
        return 'weekly';
    }

    static get MONTHLY() {
        return 'monthly';
    }

    static get IS_START_DATE() {
        return 'is_start_date';
    }

    static get IS_END_DATE() {
        return 'is_end_date';
    }

    static get CALENDAR_DATE_ISO() {
        return 'calendar_date_iso';
    }

    static get CALENDAR_DATE() {
        return 'calendar_date';
    }

    static get WEEK_MONTH_TO_DATE() {
        return 'week_month_to_date';
    }

    static get START_DATE_PICKER_REF() {
        return 'picker1';
    }

    static get END_DATE_PICKER_REF() {
        return 'picker2';
    }

    static get HEADING_SELECT_DATE_DAY() {
        return `${i18n.t("calendarConfig.selectDay")}`;
    }

    static get HEADING_SELECT_DATE_WEEK() {
        return `${i18n.t("calendarConfig.selectWeek")}`;
    }

    static get HEADING_SELECT_DATE_MONTH() {
        return `${i18n.t("calendarConfig.selectMonth")}`;     
    }

    static get HEADING_CUSTOM_START_DATE() {
        return `${i18n.t("calendarConfig.customStartDate")}`;
    }

    static get HEADING_CUSTOM_END_DATE() {
        return `${i18n.t("calendarConfig.customEndDate")}`;
    }
}

import React from "react";
import { mount } from "enzyme";
import ActionFeedCard from "../../components/actionfeed/ActionFeedCard";

describe("ActionFeedCard component", () => {
    const props = {
        action: {
            location: "Mahama",
            country: "Rwanda",
            description: "there were no materials for a sustainable solution. Therefore, a Technical Team has been sent to build those stairs to help customers be safe from the accidents the place was causing them and now they are comfortably fetching water standing on that side.there were no materials for a sustainable solution. Therefore, a Technical Team has been sent to build those stairs to help customers be safe from the accidents the place was",
            image: "https://firebasestorage.googleapis.com/v0/b/kuja-kujans-survey-ecdb7.appspot.com/o/img3.jpg?alt=media&token=2627c138-258f-42d4-8ccf-254fb932b778",
            implementor: "John Doe",
            numbers: "235",
            service_type: "Nutrition Service",
            source: "https://dev.alight.kujakuja.com/en/ideafeed?start=2020-10-01&end=2020-10-31&settlements=16&keyword=water&limit=50&page=1",
            tag: "#porridge",
            time: "2020-10-11",
            title: "The ALIGHT Health Service Team has implemented an action"
        },
    };
    const wrapper = mount(<ActionFeedCard {...props} />);

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

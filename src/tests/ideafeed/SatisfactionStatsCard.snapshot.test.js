import React from "react";
import { mount } from "enzyme";
import SatisfactionStatsCard from "../../components/ideafeed/SatisfactionStatsCard";

describe("SatisfactionStatsCard component", () => {
    const props = {
        ideasCount: 100,
        satisfiedIdeaCount: 60,
    };
    const wrapper = mount(<SatisfactionStatsCard {...props} />);

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

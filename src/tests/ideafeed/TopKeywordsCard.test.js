import React from "react";
import { mount } from "enzyme";
import TopKeywordsCard from "../../components/ideafeed/TopKeywordsCard";

describe("TopKeywordsCard component", () => {
    const props = {
        negativeKeywords: ["test negative"],
        positiveKeywords: ["test positive"],
        handleKeywordSelect: jest.fn(),
        ideaSearchString: "",
        clearIdeaSearchString: jest.fn(),
    };
    const wrapper = mount(<TopKeywordsCard {...props} />);

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

import React from "react";
import { mount } from "enzyme";
import IdeaCard from "../../components/ideafeed/IdeaCard";

describe("IdeaCard component", () => {
    const props = {
        idea: {
            idea: "some random idea",
            created_at: "2019-11-18T14:35:38.000Z",
            is_starred: false,
            name: "Nyabiheke camp",
            tags: "TestTag1,TestTag2",
            idea_language: "en",
        },
        searchTag: jest.fn(),
    };
    const wrapper = mount(<IdeaCard {...props} />);

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });

    it("should call search function", () => {
        wrapper.find(".tag").first().simulate("click");
        expect(props.searchTag).toHaveBeenCalled();
    });
});

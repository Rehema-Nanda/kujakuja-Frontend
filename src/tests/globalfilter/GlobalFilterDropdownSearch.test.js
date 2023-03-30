import React from "react";
import { mount } from "enzyme";
import GlobalFilterDropdownSearch from "../../components/globalfilter/GlobalFilterDropdownSearch";

describe("GlobalFilterDropdownSearch component", () => {
    const props = {
        items: [],
        itemLabelProperty: "name",
        setResults: jest.fn(),
    };
    const wrapper = mount(<GlobalFilterDropdownSearch {...props} />);

    it("renders correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

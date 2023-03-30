import React from "react";
import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import DataStudioGraphPage from "../../components/datastudio_graphs/DataStudioGraphPage";

describe("DataStudioGraphPage component", () => {
    const wrapper = mount(<BrowserRouter><DataStudioGraphPage /></BrowserRouter>);

    it("render correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

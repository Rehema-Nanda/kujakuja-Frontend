import React from "react";
import { mount } from "enzyme";
import { BrowserRouter } from "react-router-dom";
import NoPage from "../../components/no_page/NoPage";

describe("NoPage component", () => {
    const testProps = {
        history: {
            goBack: jest.fn(),
        },
    };
    const wrapper = mount(<BrowserRouter><NoPage {...testProps} /></BrowserRouter>);

    it("render correctly", () => {
        expect(wrapper.debug()).toMatchSnapshot();
    });
});

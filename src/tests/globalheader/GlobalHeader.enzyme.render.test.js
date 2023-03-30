import React from "react";
import { render } from "enzyme";
import { BrowserRouter as Router } from "react-router-dom";
import GlobalHeader from "../../components/GlobalHeader";

describe("<GlobalHeader/> static rendering tests", () => {
    const wrapper = render(
        <Router>
            <GlobalHeader />
        </Router>,
    );

    it("should contain .global-header class", () => {
        expect(wrapper.find(".global-header")).toHaveLength(1);
    });

    it("should contain .ml-auto class", () => {
        expect(wrapper.find(".ml-auto")).toHaveLength(1);
    });

    it("should contain the default title text", () => {
        expect(wrapper.find(".title-text").text()).toEqual("");
    });

    it("should contain 4 navigation <li> with the class .nav-item by default", () => {
        expect(wrapper.find(".nav-item")).toHaveLength(7);
    });
});

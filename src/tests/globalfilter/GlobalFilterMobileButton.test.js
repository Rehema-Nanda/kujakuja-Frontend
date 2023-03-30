import React from "react";
import renderer from "react-test-renderer";
import GlobalFilterMobileButton from "../../components/globalfilter/GobalFilterMobileButton";

it("renders correctly", () => {
    const props = {
        text: "Test",
        onClick: jest.fn(),
    };

    const tree = renderer.create(
        <GlobalFilterMobileButton {...props} />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

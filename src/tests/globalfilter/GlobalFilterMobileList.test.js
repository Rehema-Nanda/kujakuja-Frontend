import React from "react";
import renderer from "react-test-renderer";
import GlobalFilterMobileList from "../../components/globalfilter/GlobalFilterMobileList";

it("renders correctly", () => {
    const props = {
        items: [],
        itemLabelProperty: "name",
        selectItemHandler: jest.fn(),
        selectedItems: [],
    };

    const tree = renderer.create(
        <GlobalFilterMobileList {...props} />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

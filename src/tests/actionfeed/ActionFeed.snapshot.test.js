import React from "react";
import renderer from "react-test-renderer";
import moment from "moment";
import ActionFeedPage from "../../components/actionfeed/ActionFeedPage";

it("renders correctly", () => {
    const fixedDate = moment.utc("2019-07-17").startOf("day");

    const tree = renderer.create(
        <ActionFeedPage
            allCountries={[]}
            allLocations={[]}
            selectedCountries={[]}
            selectedLocations={[]}
            selectedServiceTypes={[]}
            dateStart={fixedDate.clone().subtract(7, "days")}
            dateEnd={fixedDate}
        />,
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

import React from "react";
import moment from "moment";
import { shallow } from "enzyme";
import SnapshotCard from "../../components/snapshots/SnapshotCard";

it("renders correctly", () => {
    const fixedDate = moment.utc("2019-07-17").startOf("day");

    const sampleSnapshotData = {
        featured_idea: "Test idea",
        interval: {
            average: 81,
            delta: -11.956521739130435,
            end: fixedDate.format(),
            responses: 16,
            satisfied: 13,
            start: fixedDate.clone().subtract(1, "days").format(),
        },
        next: {
            average: null,
            end: fixedDate.clone().add(1, "days").format(),
            responses: null,
            satisfied: null,
            start: fixedDate.format(),
        },
        previous: {
            average: 92,
            end: fixedDate.clone().subtract(1, "days").format(),
            responses: 603,
            satisfied: 554,
            start: fixedDate.clone().subtract(2, "days").format(),
        },
        region: {
            id: 16,
            name: "Gihembe Camp",
            parent_id: 176,
            parent_name: "Rwanda",
            type: "Settlement",
        },
        serviceTypes: [
            {
                average: 91,
                delta: -5.208333333333334,
                responses: 11,
                satisfied: 10,
                service_type_id: 6,
                service_type_name: "Nutrition ",
            },
        ],
    };

    const tree = shallow(
        <SnapshotCard
            snapshot={sampleSnapshotData}
            singleDay
            dateStart={fixedDate.clone().subtract(1, "days")}
            dateEnd={fixedDate}
        />,
    );

    expect(tree.debug()).toMatchSnapshot();
});

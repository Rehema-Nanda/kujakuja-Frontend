import React from 'react';
import renderer from 'react-test-renderer';
import ServiceTypeListItem from '../../components/snapshots/ServiceTypeListItem';

it('renders correctly', () => {
    const tree = renderer.create(
        <ServiceTypeListItem
            serviceTypeName='Test'
            average={90}
            delta={-5}>
        </ServiceTypeListItem>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

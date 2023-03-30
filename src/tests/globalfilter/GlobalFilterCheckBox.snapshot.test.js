import React from 'react';
import renderer from 'react-test-renderer';
import GlobalFilterCheckbox from '../../components/globalfilter/GlobalFilterCheckbox';

it('renders correctly', () => {
    const tree = renderer.create(
        <GlobalFilterCheckbox
            item={{id: 1, name: 'Uganda'}}
            itemLabelProperty="name"
            selectItemHandler={() => {}}
            selectItemHandlerArgs={[]}
            selectedItems={[]}
        />
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

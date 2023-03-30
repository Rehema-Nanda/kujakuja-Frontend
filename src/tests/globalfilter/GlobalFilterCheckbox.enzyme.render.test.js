import React from 'react';
import { render } from 'enzyme';
import GlobalFilterCheckbox from '../../components/globalfilter/GlobalFilterCheckbox';

describe('<GlobalFilterCheckbox/> static rendering tests', () => {
    const wrapper = render(
        <GlobalFilterCheckbox
            item={{id: 1, name: 'Uganda'}}
            itemLabelProperty="name"
            selectItemHandler={() => {}}
            selectItemHandlerArgs={[]}
            selectedItems={[]}
        />
    );

    it('should contain .map-controls-checkbox class', () => {
        expect(wrapper.find('.map-controls-checkbox')).toHaveLength(1);
    });
});

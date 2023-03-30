import React from 'react';
import { shallow } from 'enzyme';
import GlobalFilterServiceButton from '../../components/globalfilter/GlobalFilterServiceButton';

describe('<GlobalFilterServiceButton/> shallow rendering tests', () => {
    const mockFn = jest.fn().mockName('toggleServiceType');

    const wrapper = shallow(
        <GlobalFilterServiceButton
            id={1}
            tipId='commTip'
            iconoff={require('../../img/icons/community_off.svg')}
            iconon={require('../../img/icons/community_on.svg')}
            name='Community Pulse'
            toggleServiceType={mockFn}
            selectedServiceTypes={[]}
        />
    );

    it('should call toggleServiceType when clicked', () => {
        wrapper.find('#commTip').simulate('click');
        expect(mockFn).toHaveBeenCalled();
    });
});

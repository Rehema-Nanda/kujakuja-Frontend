import React from 'react';
import renderer from 'react-test-renderer';
import GlobalFooter from '../../components/GlobalFooter';

it('renders correctly', () => {
    const tree = renderer.create(
        <GlobalFooter/>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

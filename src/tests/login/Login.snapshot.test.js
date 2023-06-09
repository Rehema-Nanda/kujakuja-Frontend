import React from 'react';
import renderer from 'react-test-renderer';
import Login from '../../components/login/Login';

it('renders correctly', () => {
    const tree = renderer.create(
        <Login/>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

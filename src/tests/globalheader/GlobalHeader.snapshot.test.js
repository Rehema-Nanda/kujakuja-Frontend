import React from 'react';
import renderer from 'react-test-renderer';
import { BrowserRouter as Router } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';

it('renders correctly', () => {
    const tree = renderer.create(
        <Router>
            <GlobalHeader/>
        </Router>
    ).toJSON();

    expect(tree).toMatchSnapshot();
});

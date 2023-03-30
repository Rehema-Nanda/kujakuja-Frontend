import React from 'react';
import { render } from 'enzyme';
import Login from '../../components/login/Login';

describe('<Login/> static rendering tests', () => {
    const wrapper = render(
        <Login/>
    );

    it('should contain .login-form class', () => {
        expect((wrapper).find('.login-form')).toHaveLength(1);
    });

    it('should contain a username field', () => {
        expect((wrapper).find('[name="username"]')).toHaveLength(1);
    });

    it('should contain a password field', () => {
        expect((wrapper).find('[name="password"]')).toHaveLength(1);
    });
});

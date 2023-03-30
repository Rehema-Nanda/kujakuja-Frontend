import React from 'react';
import  {Alert, Col, Container, Row } from 'reactstrap';
import './Login.css';
import { AuthContext } from "../../AuthContext";

export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            errorMsg: null,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
    }

    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        try {
            if (!this.state.username || !this.state.password) {
                throw new Error('Please specify email address and password');
            }

            let searchParams = window.location.search || '';
            if (searchParams && searchParams.includes('?redirect_url=')) {
                searchParams = decodeURIComponent(searchParams.replace(/\?redirect_url=/g, ''));
            }
            await this.context.login(this.state.username, this.state.password, searchParams);
        }
        catch (err) {
            this.setState({
                errorMsg: e.response ? 'Login failed - please try again' : err.message,
            });
        }
    }

    render() {
        return (
            <div className="login-page">
                <Container>
                    <Row className="login-row">
                        <Col sm={{size: 6, offset: 3}} lg={{size: 4, offset: 4}}>
                            <div className="login-form">
                                <h3>Login</h3>

                                <form onSubmit={this.handleFormSubmit}>
                                    <input
                                    placeholder="Username"
                                    name="username"
                                    type="text"
                                    onChange={this.handleChange}
                                    />
                                    <input

                                    placeholder="Password"
                                    name="password"
                                    type="password"
                                    onChange={this.handleChange}
                                    />

                                    <button className="primary" type="submit">
                                        {this.context.isLoading ? <div className="loader"/> : "Submit"}
                                    </button>
                                    {this.state.errorMsg && <Alert color="danger">{this.state.errorMsg}</Alert>}
                                </form>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }
}
Login.contextType = AuthContext;

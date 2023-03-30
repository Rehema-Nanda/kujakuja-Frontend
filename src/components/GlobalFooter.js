
import React from 'react';

import './GlobalFooter.css';

export default class GlobalFooter extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (

            <section className="footer">
                <div className="footer-details">
                    <div className="footer-logo"><img src={require('../img/footer-logo.svg')} alt="idea feed" /></div>
                    <div className="footer-social">
                        <div className="social-instagram" onClick={() => window.open('https://www.instagram.com/kujakujaglobal/', '_blank')}></div>
                        <div className="social-fb" onClick={() => window.open('https://www.facebook.com/KujaKujaGlobal', '_blank')}></div>
                        <div className="social-twitter" onClick={() => window.open('https://twitter.com/kujakujaglobal', '_blank')}></div>
                        <div className="social-medium" onClick={() => window.open('https://medium.com/@KujaKujaGlobal', '_blank')}></div>
                    </div>
                </div>
            </section>

        );
    }
}

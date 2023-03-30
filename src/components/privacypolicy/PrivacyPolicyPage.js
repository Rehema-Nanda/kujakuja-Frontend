import React from 'react';
import {Container, Row, Col} from 'reactstrap';
import GlobalFooter from "../GlobalFooter";
import './PrivacyPolicyPage.css';

const PrivacyPolicyPage = () => {

    return (

    <div className="privacy-policy">

        <Container>
            <Row>
                <Col>
                    <div className="privacy-policy-title">
                        <h1>Privacy Policy</h1>
                    </div>
                </Col>
            </Row>
        </Container>

        <Container>
            <Row>
                <Col>

                    <p>
                        Kuja Kuja is a commercial web and smartphone application. This service is provided by Kuja Kuja & American Refugee
                        Committee and is intended for use as is. This page is used to inform visitors regarding our policies with the
                        collection, use, and disclosure of Personal Information for all users of our Service.
                    </p>
                    ‍
                    <p>
                        If you choose to use our Service, then you agree to the collection and use of information in relation to this policy.
                        The Personal Information that we collect is used for providing and improving the Service. We will not use or share
                        your information with anyone except as described in this Privacy Policy.
                    </p>

                    ‍<h3 className="left">Information Collection and Use</h3>
                    <p>
                        The information that we request will be retained by us and used as described in this privacy policy. The app does use
                        third party services that may collect information used to identify you. Kuja Kuja collects simple analytics on all
                        Kuja Kuja systems. These include time, location, etc..
                    </p>

                    <p>
                        The Kuja Kuja mobile application stores data in a mysql database that is hosted and protected by Amazon Web Services.
                        Privacy and security policies from AWS can he found <a href="https://aws.amazon.com/blogs/security/aws-gdpr-data-processing-addendum/" rel="noopener noreferrer" target="_blank">here</a>.
                    </p>

                    <p>
                        The Kuja Kuja website is hosted on Google Cloud Platform.
                        Privacy policies related to this platform are viewable <a href="https://policies.google.com/privacy" rel="noopener noreferrer" target="_blank">here</a>.
                    </p>

                    ‍<h3 className="left">Log Data</h3>
                    <p>
                        We want to inform you that whenever you use our Service, in a case of an error in the app we may collect data and
                        information (through third party products). This Log Data may include information such as your device Internet
                        Protocol (“IP”) address, device name, operating system version, the configuration of the app when utilizing our
                        Service, the time and date of your use of the Service, and other statistics.
                    </p>

                    ‍<h3 className="left">Cookies</h3>
                    <p>
                        Cookies are files with a small amount of data that are commonly used as anonymous unique identifiers. These are sent
                        to your browser from the websites that you visit and are stored on your device's internal memory.
                    </p>

                    <p>
                        This Service does not use these “cookies” explicitly. However, the app may use third party code and libraries that
                        use “cookies” to collect information and improve their services. In particular, “cookies” are used by the application
                        to identify the user between sessions, so that the user need not log-in every time they wish to use the application
                        online You have the option to either accept or refuse these cookies and know when a cookie is being sent to your
                        device. If you choose to refuse our cookies, you may not be able to use some portions of this Service.
                    </p>

                    ‍<h3 className="left">Service Providers</h3>
                    <p>
                        We may employ third-party companies and individuals due to the following reasons:
                        To facilitate our Service;
                        To provide the Service on our behalf;
                        To perform Service-related services; or
                        To assist us in analysing how our Service is used.
                        We want to inform users of this Service that these third parties will not be given access to any of your Personal
                        Information.
                    </p>

                    ‍<h3 className="left">Security</h3>
                    <p>
                        We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable
                        means of protecting it. But remember that no method of transmission over the internet, or method of electronic storage
                        is 100% secure and reliable, so while we hold ourselves to the highest possible standard of security excellence, we
                        cannot guarantee its absolute security.
                    </p>

                    ‍<h3 className="left">Links to Other Sites</h3>
                    <p>
                        This Service may contain links to other sites. If you click on a third-party link, you will be directed to that site.
                        Note that these external sites are not operated by us. Therefore, we strongly advise you to review the Privacy Policy
                        of these websites. We have no control over and assume no responsibility for the content, privacy policies, or
                        practices of any third-party sites or services.
                    </p>

                    ‍<h3 className="left">Children’s Privacy</h3>
                    <p>
                        These Services do not address anyone under the age of 13. We do not knowingly collect personally identifiable
                        information from children under 13. In the case we discover that a child under 13 has provided us with personal
                        information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your
                        child has provided us with personal information, please contact us so that we will be able to do necessary
                        actions.
                    </p>

                    ‍<h3 className="left">Changes to This Privacy Policy</h3>
                    <p>
                        We may update our Privacy Policy from time to time. Thus, you are advised to review this page periodically for any
                        changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective
                        immediately after they are posted on this page.
                    </p>

                    ‍<p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>


                </Col>
            </Row>
        </Container>

        <GlobalFooter/>
    </div>
    );

};

export default PrivacyPolicyPage;

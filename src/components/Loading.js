import React from "react";

import "./Loading.css";

export default class Loading extends React.PureComponent {
    render() {
        return (
            <div className="loading-overlay">
                <div className="loading-container">
                    <div className="loader" />
                </div>
            </div>
        );
    }
}

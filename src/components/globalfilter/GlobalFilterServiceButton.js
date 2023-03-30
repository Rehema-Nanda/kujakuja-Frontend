import React from 'react';

import { Button, Tooltip } from 'reactstrap';

export default class GlobalFilterServiceButton extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            tipState: false,
            buttonState: false
        };

        this.setTipState = this.setTipState.bind(this);
        this.setButtonState = this.setButtonState.bind(this);
    }

    setTipState = () => {
        this.setState({
            tipState: !this.state.tipState,
        });
    };

    setButtonState = (id) => {
        this.setState({
            buttonState: !this.state.buttonState,
        });
        this.props.toggleServiceType(id);
    };

    componentDidMount() {
        if (this.props.selectedServiceTypes.includes(this.props.id)) {
            this.setState({
                buttonState: true
            });
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (prevProps.selectedServiceTypes.includes(this.props.id) && !this.props.selectedServiceTypes.includes(this.props.id))
            || (!prevProps.selectedServiceTypes.includes(this.props.id) && this.props.selectedServiceTypes.includes(this.props.id))
        ) {
            this.setState({buttonState: this.props.selectedServiceTypes.includes(this.props.id)});
        }
    }

    render() {

        const buttonStyle = this.state.buttonState ? "service-toggle-on" : "service-toggle-off";
        const iconPath = this.state.buttonState ? this.props.iconon : this.props.iconoff;

        return (
            <div>
                <Button id={this.props.tipId} data-service-id={this.props.id} className={buttonStyle}
                        onClick={(e) => this.setButtonState(this.props.id)}>
                    <img alt="" src={iconPath} />
                </Button>
                <Tooltip placement="bottom" target={this.props.tipId} isOpen={this.state.tipState}
                         toggle={this.setTipState}>{this.props.name}</Tooltip>
            </div>
        );
    }

}

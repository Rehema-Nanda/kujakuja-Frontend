import React from "react";

import { Input, Label, FormGroup } from "reactstrap";
import PropTypes from "prop-types";

export default class GlobalFilterCheckbox extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            checked: props.selectedItems.indexOf(props.item.id) !== -1,
        };

        this.onChange = this.onChange.bind(this);
        this.label = this.label.bind(this);
    }

    onChange = () => {
        const { checked } = this.state;
        const {
            selectItemHandler, selectItemHandlerArgs, item, allowMultipleServicePointSelect,
        } = this.props;

        this.setState({
            checked: !checked,
        });

        if (allowMultipleServicePointSelect) {
            selectItemHandler(
                item.id,
                ...selectItemHandlerArgs,
            );
        }
        else {
            selectItemHandler(
                item.id,
                ...selectItemHandlerArgs,
                false,
                true,
                false,
            );
        }
    };

    label = () => {
        const { item, itemLabelProperty } = this.props;

        return item[itemLabelProperty];
    };

    render() {
        const { allowMultipleServicePointSelect } = this.props;
        const { checked } = this.state;

        return (
            <FormGroup check>
                <Label check className="map-controls-checkbox">
                    {allowMultipleServicePointSelect
                        ? <Input type="checkbox" checked={checked} onChange={this.onChange} />
                        : <Input type="radio" name="radio1" checked={checked} onChange={this.onChange} />}
                    {this.label()}
                </Label>
            </FormGroup>
        );
    }
}

GlobalFilterCheckbox.propTypes = {
    itemLabelProperty: PropTypes.string.isRequired,
    item: PropTypes.objectOf(PropTypes.any).isRequired,
    selectedItems: PropTypes.arrayOf(PropTypes.any),
    selectItemHandler: PropTypes.func.isRequired,
    selectItemHandlerArgs: PropTypes.arrayOf(PropTypes.any).isRequired,
    allowMultipleServicePointSelect: PropTypes.bool,
};

GlobalFilterCheckbox.defaultProps = {
    selectedItems: [],
    allowMultipleServicePointSelect: true,
};

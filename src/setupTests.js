import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({ adapter: new Adapter() });


jest.mock('mapbox-gl/dist/mapbox-gl', () => {
    return {
        Map: jest.fn(() => {
            return {
                fitBounds: jest.fn(),
                on: jest.fn(),
                remove: jest.fn()
            }
        })
    };
});

jest.mock('react-ga');

const reactstrap = jest.requireActual('reactstrap');
reactstrap.Popover = jest.fn(() => 'Popover');
reactstrap.Tooltip = jest.fn(() => 'Tooltip');

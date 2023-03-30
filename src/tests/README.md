# Testing

Information on our testing framework and its configuration, as well as links to external resources.

## Overview

We use the standard configuration that ships with Create React App (CRA), using Jest as the runner plus Enzyme and react-test-renderer. The latter are listed as `devDependencies`
in `package.json`. 

This setup follows the recommendations in the [CRA docs on testing](https://facebook.github.io/create-react-app/docs/running-tests).

Configuration is mostly contained in [setupTests.js](../setupTests.js).

Tests themselves are found in `/src/tests/`.

## Documentation

[Running Tests](https://facebook.github.io/create-react-app/docs/running-tests) - Create React App

[Enzyme](https://airbnb.io/enzyme/)

[Difference between shallow, mount and render of Enzyme](https://gist.github.com/fokusferit/e4558d384e4e9cab95d04e5f35d4f913) - It's crucial that you understand the different types
of tests and their purpose, also refer to the CRA docs for this.

[Jest](https://jestjs.io/docs/en/getting-started)

## Pointers

### File naming conventions

Test files are named to signify the particular type of test - please follow this pattern when adding new tests. For example:

* `<Component>.snapshot.test.js` for snapshot tests
* `<Component>.enzyme.render.test.js` for Enzyme tests using the `render` function
* `<Component>.enzyme.shallow.test.js` for Enzyme tests using the `shallow` function
* `<Component>.enzyme.mount.test.js` for Enzyme tests using the `mount` function

### Mocked components

A few third-party components had to be mocked to get the tests to run, as detailed below. Also see [setupTests.js](../setupTests.js).

#### mapbox-gl

Is known to cause issues under test. While a [mapbox-gl-js-mock](https://github.com/mapbox/mapbox-gl-js-mock) package exists, there is
[virtually no documentation](https://github.com/mapbox/mapbox-gl-js-mock/issues/27) and we couldn't get it to work. It may however be worth revisiting this in future.

Reference material:<br>
https://stackoverflow.com/questions/48866088/testing-a-react-mapbox-gl-with-jsodom-and-jest<br>
https://github.com/uber/react-map-gl/issues/210<br>
https://github.com/mapbox/mapbox-gl-js/issues/3436

#### react-ga

Google Analytics, no further info on this. Comment the mock if you want to see what happens if it's not mocked.

#### Popover & Tooltip components from reactstrap

This is also a known issue, which occurs when these components don't have access to a full DOM and thus can't find the sibling elements they're looking for.

We've done a *partial* mock of reactstrap to mock only those two components.

Reference material:<br>
https://github.com/reactstrap/reactstrap/issues/773<br>
https://github.com/facebook/react/issues/7371

#### @fortawesome/react-fontawesome

Mocked using a [manual mock](https://jestjs.io/docs/en/manual-mocks). See `/src/tests/__mocks__/@fortawesome/react-fontawesome.js`
([link](./__mocks__/@fortawesome/react-fontawesome.js)), which also contains links to reference material.

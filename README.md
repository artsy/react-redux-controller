# react-redux-controller

**react-redux-controller** is a library that adds some opinion to the [react-redux](https://github.com/rackt/react-redux) binding of [React](https://facebook.github.io/react/index.html) components to the [Redux](http://redux.js.org/) store. It creates the entity of a `Controller`, which is intended to be the single point of integration between React and Redux. The controller passes data and callbacks to the UI components via the [React `context`](https://facebook.github.io/react/docs/context.html). It's one solution to [the question](http://stackoverflow.com/a/34320909/807674) of how to get data and controller-like methods (e.g. event handlers) to the React UI components.

## Philosophy

This library takes the opinion that React components should solely be focused on the job of rendering and capturing user input, and that Redux actions and reducers should be soley focused on the job of managing the store and providing a view of the state of the store in the form of [selectors](http://rackt.org/redux/docs/basics/UsageWithReact.html). The plumbing of distributing data to components, as well as deciding what to fetch, when to fetch, how to manage latency, and what to do with error handling, should be vested in an explicit controller layer.

This differs from alternative methods in a number of ways:

- The ancestors of a component are not responsible for conveying dependencies to via `props` -- particularly when it comes to dependencies the ancestors don't use themselves.
- The components are not coupled to Redux in any way -- no `connect` distributed throughout the component tree.
- There are no [smart components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.m5y0saa0k). Well there's one, but it's hidden inside the Controller.
- Action creators do not peforming any fetching. They are only responsible for constructing action objects, as is the case in vanilla Redux, with no middleware needed.

## Usage

The **controller** factory requires 3 parameters:

- The root component of the UI component tree.
- An object that holds controller generator functions.
- Any number of selector bundles, which are likely simply imported selector modules, each selector annotated a [`propType`](https://facebook.github.io/react/docs/reusable-components.html) that indicates what kind of data it provides.

The functionality of the controller layer is implemented using [generator functions](http://www.2ality.com/2015/03/es6-generators.html). Within these functions, `yield` may be used await the results of [Promises](http://www.2ality.com/2014/09/es6-promises-foundations.html) and to request selector values and root component properties. As a very rough sketch of how you might use this library:

```javascript
// controllers/app_controller.js

import { controller, getProps } from 'react-redux-controller';
import AppLayout from '../components/app_layout';
import * as actions from '../actions';
import * as mySelectors from '../selectors/my_selectors';

const controllerGenerators = {
  *initialize() {
    // ... any code that should run before initial render (like loading actions)
  },
  *onUserActivity(meaningfulParam) {
    const { dispatch, otherData } = yield getProps;
    dispatch(actions.fetchingData());
    try {
      const apiData = yield httpRequest(`http://myapi.com/${otherData}`);
      return dispatch(actions.fetchingSuccessful(apiData));
    } catch (err) {
      return dispatch(actions.errorFetching(err));
    }
  },
  // ... other controller generators follow
};

const selectorBundles = [
  mySelectors,
];

export default controller(AppLayout, controllerMethodFactories, selectorBundles);

```

## Example

To see an in-depth example of usage of this library, [the async example from the redux guide](http://redux.js.org/docs/advanced/ExampleRedditAPI.html) is ported to use the controller approach [in this repo](https://github.com/artsy/react-redux-controller/blob/master/example/README.md).

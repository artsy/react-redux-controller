# Async example

This directory contains a port of [the async example from the redux guide](http://redux.js.org/docs/advanced/ExampleRedditAPI.html). Here, we point out some of the points of interest in using react-redux-controller.

## Structual differences from original example

Below are some of the fundamental ways in which the approach here differs from the async example:

### Dumb components

In line with Dan Abramov's [post on Smart and Dumb components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0#.ho45ybvub), it's interesting to note that the controller approach hides the smart components entirely. Here, [all of the components](https://github.com/artsy/react-redux-controller/tree/master/example/components) are stateless functional components, which lets them focus purely on UI structure and I/O. Even up to the root UI component, they are directly coupled only to React itself and other components.

### Minimal use of manual `props` passing

In this paradigm, typical React `props` passing is not used for general dependencies. Instead, it's used for intentional coupling between components. This might be an iterator-iteratee relationship, or configuration of a particular use of a general-purpose subcomponent. When the relationship is simply structural, no `props` are passed. See the [Layout component](https://github.com/artsy/react-redux-controller/blob/master/example/components/Layout.js#L31).

This small example doesn't really sell the benefits of this decoupling. But in a design with deeply nested components and a lot of user interactions, the branches of the component tree would be vastly simplified.

### Context types to declare dependencies

The `contextTypes` annotation on components is used to formalize the dependencies between the controller and the components. See the [Layout component](https://github.com/artsy/react-redux-controller/blob/master/example/components/Layout.js#L38-L43), for instance.

### Use of selectors as the materialize view of the store 

As mentioned in the Redux guide, it's best to keep the store itself normalized. But normalization isn't the ideal way for the controller methods and the views to consume model data, especially when it comes to derived data. By storing all calculations in a [selector layer](https://github.com/artsy/react-redux-controller/blob/master/example/selectors/index.js), components can be written to depend only on the derived data. Note also how the selectors are annotated with the prop types they return.

In real use, you might use tools like reselect and normalizr, as suggested in the Redux guide.

### Mapping of DOM event to domain event

In this example, the DOM belongs to the view layer, and the view performs any DOM manipulation before invoking controller methods. See the [Layout component](https://github.com/artsy/react-redux-controller/blob/master/example/components/Layout.js#L18)'s handling of the refresh button.

### Dumb action creators

Compared to [redux-thunk](https://github.com/gaearon/redux-thunk) and similar approaches to handling asynchrony, [action creators](https://github.com/artsy/react-redux-controller/blob/master/example/actions/index.js) no longer contain any real logic, which now exists in the explicit controller layer.

## Practical usage

This library offers a number of ways of accomplishing basic controller tasks that differ from other approaches. This example helps to document exactly how it works in practice.

### `*initialize` method for startup actions

This magic generator method can be used to kick off any activity that might need to happen upon launching the application. In a [universal app](https://medium.com/@mjackson/universal-javascript-4761051b7ae9), the initial state would be delivered with the webpage, so that the client could boot right up into it's steady-state. But in a client-side application that needs to be able to make a cold start, like this one, this is the way to initialize. See [the App controller](https://github.com/artsy/react-redux-controller/blob/master/example/controllers/App.js#L10-14).

### `yield` to resolve promises

Use of [co](https://github.com/tj/co) allows ES6 `yield` to be used to suspend controller generators on Promises, which are resumed returning the resolved value of the promise (or throwing exceptions, in the case of rejection). This is used in the example to [fetch from the Reddit API](https://github.com/artsy/react-redux-controller/blob/master/example/controllers/App.js#L46). The upside of this is that regular control flow can be used, interleaved with asynchronicity.

### `yield` to get state and dispatch

[Special symbols](https://github.com/artsy/react-redux-controller/blob/master/example/controllers/App.js#L4) can be used to access the controller's props, as injected by react-redux. These include the raw state from the store and `dispatch` for triggering state changes. [Controller generators use `yield`](https://github.com/artsy/react-redux-controller/blob/master/example/controllers/App.js#L17) to request these dependencies.

### `yield` to defer to subcomponents

Controller methods are composable. Behind the scenes, they are converted into regular method functions that return promises, and they are bound into a shared `this` context. This means you can call other controller methods and use `yield` await them, as seen in [the App controller](https://github.com/artsy/react-redux-controller/blob/master/example/controllers/App.js#L22).

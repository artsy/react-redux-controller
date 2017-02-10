import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import co from 'co';
import { aggregateSelectors } from './selector_utils';

const toDispatchSymbol = Symbol('toDispatch');

/** Request to get the props object at a specific time */
export const getProps = Symbol('getProps');

/**
 * Request to get a function that will return the controller `props` object,
 * when called.
 */
export const getPropsGetter = Symbol('getPropsGetter');

/**
 * Convenience request to dispatch an action directly from a controller
 * generator.
 * @param  {*} action a Redux action
 * @return {*} the result of dispatching the action
 */
export function toDispatch(action) {
  return { [toDispatchSymbol]: action };
}

/**
 * The default function for converting the controllerGenerators to methods that
 * can be directly called. It resolves `yield` statements in the generators by
 * delegating Promise to `co` and processing special values that are used to
 * request data from the controller.
 * @param  {Function} propsGetter gets the current controller props.
 * @return {Function} a function that converts a generator to a method
 *   forwarding on the arguments the generator receives.
 */
export function runControllerGenerator(propsGetter) {
  return controllerGenerator => co.wrap(function* coWrapper() {
    const gen = controllerGenerator.apply(this, arguments);
    let value;
    let done;
    let toController;

    for ({ value, done } = gen.next(); !done; { value, done } = gen.next(toController)) {
      const props = propsGetter();

      // In the special cases that the yielded value has one of our special
      // tags, process it, and then we'll send the result on to `co` anyway
      // in case whatever we get back is a promise.
      if (value && value[toDispatchSymbol]) {
        // Dispatch an action
        toController = props.dispatch(value[toDispatchSymbol]);
      } else if (value === getProps) {
        // Return all props
        toController = props;
      } else if (value === getPropsGetter) {
        // Return the propsGetter itself, so the controller can get props
        // values in async continuations
        toController = propsGetter;
      } else {
        // Defer to `co`
        try {
          toController = yield value;
        } catch (e) {
          gen.throw(e);
        }
      }
    }

    return value;
  });
}

/**
 * This higher-order component introduces a concept of a Controller, which is a
 * component that acts as an interface between the proper view component tree
 * and the Redux state modeling, building upon react-redux. It attempts to
 * solve a couple problems:
 *
 * - It provides a way for event handlers and other helpers to access the
 *   application state and dispatch actions to Redux.
 * - It conveys those handlers, along with the data from the react-redux
 *   selectors, to the component tree, using React's [context](bit.ly/1QWHEfC)
 *   feature.
 *
 * It was designed to help keep UI components as simple and domain-focused
 * as possible (i.e. [dumb components](bit.ly/1RFh7Ui), while concentrating
 * the React-Redux integration point at a single place. It frees intermediate
 * components from the concern of routing dependencies to their descendents,
 * reducing coupling of components to the UI layout.
 *
 * @param  {React.Component} RootComponent is the root of the app's component
 *   tree.
 * @param  {Object} controllerGenerators contains generator methods to be used
 *   to create controller methods, which are distributed to the component tree.
 *   These are called from UI components to trigger state changes. These
 *   generators can `yield` Promises to be resolved via `co`, can `yield`
 *   requests to receive application state or dispatch actions, and can
 *   `yield*` to delegate to other controller generators.
 * @param  {(Object|Object[])} selectorBundles maps property names to selector
 *   functions, which produce property value from the Redux store.
 * @param  {Function} [controllerGeneratorRunner = runControllerGenerator] is
 *   the generator wrapper that will be used to run the generator methods.
 * @return {React.Component} a decorated version of RootComponent, with
 *   `context` set up for its descendants.
 */
export function controller(RootComponent, controllerGenerators, selectorBundles, controllerGeneratorRunner = runControllerGenerator) {
  // Combine selector bundles into one mapStateToProps function.
  const mapStateToProps = aggregateSelectors(Object.assign({ }, ...(_.flattenDeep([selectorBundles]))));
  const selectorPropTypes = mapStateToProps.propTypes;

  // All the controller method propTypes should simply be "function" so we can
  // synthesize those.
  const controllerMethodPropTypes = _.mapValues(controllerGenerators, () => PropTypes.func.isRequired);

  // Declare the availability of all of the selectors and controller methods
  // in the React context for descendant components.
  const contextPropTypes = {...selectorPropTypes, ...controllerMethodPropTypes};

  class Controller extends React.Component {
    constructor(...constructorArgs) {
      super(...constructorArgs);

      const injectedControllerGeneratorRunner = controllerGeneratorRunner(() => this.props);
      this.controllerMethods = _.mapValues(controllerGenerators, controllerGenerator =>
        injectedControllerGeneratorRunner(controllerGenerator)
      );

      // Ensure controller methods can access each other via `this`
      for (const methodName of Object.keys(this.controllerMethods)) {
        this.controllerMethods[methodName] = this.controllerMethods[methodName].bind(this.controllerMethods);
      }
    }

    componentWillMount() {
      if (this.controllerMethods.initialize) {
        this.controllerMethods.initialize();
      }
    }

    componentWillUnMount() {
      if (this.controllerMethods.deinitialize) {
        this.controllerMethods.deinitialize();
      }
    }

    getChildContext() {
      // Rather than injecting all of the RootComponent props into the context,
      // we only explicitly pass selector and controller method props.
      const selectorProps = _.pick(this.props, Object.keys(selectorPropTypes));
      return { ...selectorProps, ...this.controllerMethods };
    }

    render() {
      return (
        <RootComponent {...this.props} />
      );
    }
  }

  Controller.propTypes = { ...selectorPropTypes, ...(RootComponent.propTypes || {}) };
  Controller.childContextTypes = contextPropTypes;

  return connect(mapStateToProps)(Controller);
}

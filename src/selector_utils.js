import _ from 'lodash';

/**
 * Combines bundle of selector functions into a single super selector function
 * maps the state to extracts a set of property name-value pairs corresponding
 * to the selector function outputs. The selectors materialize a view of the
 * Redux store, which will be fed to React components as `props`.
 *
 * A selector bundle looks like:
 *
 * {
 *   selectorName: (state) => value,
 *   ...
 * }
 *
 * , where each selector function should carry a `propType` property,
 * describing its result.
 *
 * The resulting super selector function looks like:
 *
 * state => {
 *   selectorName: value,
 *   ...
 * }
 *
 * , and has a `propTypes` property of the form:
 *
 * {
 *   selectorName: propType,
 *   ...
 * }
 *
 * This property can be merged directly into a `propTypes` or `contextTypes`
 * property on a React component.
 *
 * A bundle is typically created by importing an entire module of exported
 * selector functions. To keep track of React prop types, selector functions
 * should be annotated by assigning a `propType` property to the function
 * within the module where it is declared.
 *
 * @param  {Object.<string, Function>} bundle contains the
 *   selectors, as explained above.
 * @return {Function} a function that, when given the store state, produces all
 *   of the selector outputs.
 */
export function aggregateSelectors(bundle) {
  const combinedSelector = state => _.mapValues(bundle, selectorFunction => selectorFunction(state));
  combinedSelector.propTypes = _.mapValues(bundle, selectorFunction => selectorFunction.propType);
  return combinedSelector;
}

/**
 * Does the opposite of [[aggregateSelectors]]
 *
 * @param  {Function} superSelector
 * @return {Object.<string, Function>} a selector bundle, with each selector
 *   annotated with a propType property.
 */
export function disaggregateSuperSelector(superSelector) {
//TODO: refactor for lodash
/*  return R.mapObjIndexed((propType, propName) => {
    const singleSelector = R.pipe(superSelector, R.prop(propName));
    singleSelector.propType = propType;
    return singleSelector;
  }, superSelector.propTypes);
*/
}

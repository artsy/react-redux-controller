import 'babel-polyfill'
import fetch from 'isomorphic-fetch'
import React, { Component, PropTypes } from 'react'
import { controller, getProps } from 'react-redux-controller'
import * as actions from '../actions'
import * as selectors from '../selectors'
import Layout from '../components/Layout'

const controllerGenerators = {
  *initialize() {
    const { selectedReddit } = yield getProps

    yield this.fetchPostsIfNeeded(selectedReddit)
  },

  *onSelectReddit(nextReddit) {
    const { dispatch, selectedReddit } = yield getProps

    dispatch(actions.selectReddit(nextReddit))

    if (nextReddit !== selectedReddit) {
      yield this.fetchPostsIfNeeded(nextReddit)
    }
  },

  *onRefresh() {
    const { dispatch, selectedReddit } = yield getProps

    dispatch(actions.invalidateReddit(selectedReddit))
    yield this.fetchPostsIfNeeded(selectedReddit)
  },

  *fetchPostsIfNeeded(reddit) {
    const { postsByReddit } = yield getProps

    const posts = postsByReddit[reddit]
    if (!posts || !posts.isFetching || posts.didInvalidate) {
      yield this.fetchPosts(reddit)
    }
  },

  *fetchPosts(reddit) {
    const { dispatch } = yield getProps

    dispatch(actions.requestPosts(reddit))
    const response = yield fetch(`http://www.reddit.com/r/${reddit}.json`)
    const responseJson = yield response.json()
    const newPosts = responseJson.data.children.map(child => child.data)
    dispatch(actions.receivePosts(reddit, newPosts))
  }
}

export default controller(Layout, controllerGenerators, selectors)

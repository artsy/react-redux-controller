import { PropTypes } from 'react'

export const selectedReddit = state => state.selectedReddit
selectedReddit.propType = PropTypes.string.isRequired

export const postsByReddit = state => state.postsByReddit
postsByReddit.propType = PropTypes.object.isRequired

export const posts = state => {
  const p = state.postsByReddit[selectedReddit(state)]
  return p && p.items ? p.items : []
}
posts.propType = PropTypes.array.isRequired

export const isFetching = state => {
  const posts = state.postsByReddit[selectedReddit(state)]
  return posts ? posts.isFetching : true
}
isFetching.propType = PropTypes.bool.isRequired

export const lastUpdated = state => {
  const posts = state.postsByReddit[selectedReddit(state)]
  return posts && posts.lastUpdated
}
lastUpdated.propType = PropTypes.number

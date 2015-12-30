import React, { PropTypes } from 'react'

export default function Posts(_, { posts }) {
  return (
    <ul>
      { posts.map((post, i) =>
        <li key={ i }>{ post.title }</li>
      )}
    </ul>
  )
}

Posts.contextTypes = {
  posts: PropTypes.array.isRequired
}

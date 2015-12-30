import React, { PropTypes } from 'react'
import Picker from '../components/Picker'
import Posts from '../components/Posts'

export default function Layout(_, { posts, isFetching, lastUpdated, onRefresh }) {
  return (
    <div>
      <Picker options={[ 'reactjs', 'frontend' ]} />
      <p>
        {lastUpdated &&
          <span>
            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
            {' '}
          </span>
        }
        {!isFetching &&
          <a href="#"
             onClick={ e => { e.preventDefault(); onRefresh() } }>
            Refresh
          </a>
        }
      </p>
      {isFetching && posts.length === 0 &&
        <h2>Loading...</h2>
      }
      {!isFetching && posts.length === 0 &&
        <h2>Empty.</h2>
      }
      {posts.length > 0 &&
        <div style={{ opacity: isFetching ? 0.5 : 1 }}>
          <Posts />
        </div>
      }
    </div>
  )
}

Layout.contextTypes = {
  posts: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  onRefresh: PropTypes.func.isRequired
}

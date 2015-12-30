import React, { PropTypes } from 'react'

export default function Picker({ options }, { selectedReddit, onSelectReddit }) {
  return (
    <span>
      <h1>{ selectedReddit }</h1>
      <select onChange={ e => onSelectReddit(e.target.value) }
              value={ selectedReddit }>
        { options.map(option =>
          <option value={ option } key={ option }>
            { option }
          </option>)
        }
      </select>
    </span>
  )
}

Picker.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.string.isRequired
  ).isRequired
}

Picker.contextTypes = {
  selectedReddit: PropTypes.string.isRequired,
  onSelectReddit: PropTypes.func.isRequired
}

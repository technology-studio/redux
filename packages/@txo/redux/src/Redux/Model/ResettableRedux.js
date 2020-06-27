/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-06-08T17:25:01+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import { type Reducer } from 'redux'

/* ------------- Types and Action Creators ------------- */

export const types = {
  RESET: 'RESET',
}

export const actions = {
  reset: {
    type: types.RESET,
  },
}

export const creators = {
  reset: () => actions.reset,
}

/* ------------- Reducers ------------- */

export const resettableReducer = <STATE, ACTION> (originalReducer: Reducer<STATE, ACTION>): Reducer<STATE, ACTION> => {
  if (typeof originalReducer !== 'function') {
    throw new Error('A reducer is required.')
  }
  const resetState = originalReducer((undefined: any), ({}: any))

  const reducer = (state = resetState, action) => {
    return action && action.type === types.RESET
      ? resetState
      : originalReducer(state, action)
  }
  return reducer
}

export const resettableRedux = {
  types,
  actions,
  creators,
}

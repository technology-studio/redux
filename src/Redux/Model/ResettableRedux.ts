/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-06-08T17:25:01+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import { type Reducer } from 'redux'

import type { Action } from '../../Model/Types'

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

export const resettableReducer = <STATE, ACTION extends Action> (originalReducer: Reducer<STATE, ACTION>): Reducer<STATE, ACTION> => {
  if (typeof originalReducer !== 'function') {
    throw new Error('A reducer is required.')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
  const resetState = originalReducer((undefined as any), ({} as any))

  const reducer = (state = resetState, action: ACTION): STATE => action.type === types.RESET
    ? resetState
    : originalReducer(state, action)
  return reducer
}

export const resettableRedux = {
  types,
  actions,
  creators,
}

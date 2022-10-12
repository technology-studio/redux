/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2019-01-13T10:37:13+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import update from 'immutability-helper'

import type { ReduxHandler } from '../src'
import {
  createRedux,
} from '../src'

type SetFirstAttributes = {
  first: Record<string, unknown>,
}

type SetSecondAttributes = {
  second: Record<string, unknown>,
}

export type Handlers<STATE> = {
  setFirst: ReduxHandler<STATE, SetFirstAttributes>,
  clearFirst: ReduxHandler<STATE>,
  setSecond: ReduxHandler<STATE, SetSecondAttributes>,
  clearSecond: ReduxHandler<STATE>,
}

export type State = {
  first: Record<string, unknown> | null,
  second: Record<string, unknown> | null,
}

export const INITIAL_STATE = {
  first: null,
  second: null,
}

export const redux = createRedux<State, Handlers<State>>({
  filter: {
    first: true,
  },
  initialState: INITIAL_STATE,
  handlers: {
    setFirst: (state, { first }) => update(state, { first: { $set: first } }),
    clearFirst: state => update(state, { first: { $set: null } }),
    setSecond: (state, { second }) => update(state, { second: { $set: second } }),
    clearSecond: state => update(state, { second: { $set: null } }),
  },
  prefix: '.sample.prefix',
})

export const type = redux.types.setFirst
redux.creators.setFirst({ first: { a: 1 } })

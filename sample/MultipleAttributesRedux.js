/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2019-01-13T10:37:13+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

import {
  type ActionCreator,
  type Redux,
  createRedux,
} from '../lib'
import update from 'immutability-helper'

type SetFirtAttributes = {
  first: Object,
}

type SetSecondAttributes = {
  second: Object,
}

export type ActionCreators = {
  setFirst: ActionCreator<SetFirtAttributes>,
  clearFirst: ActionCreator<>,
  setSecond: ActionCreator<SetSecondAttributes>,
  clearSecond: ActionCreator<>,
}

export type State = {|
  first: ?Object,
  second: ?Object,
|}

export const INITIAL_STATE = {
  first: null,
  second: null,
}

export const redux: Redux<State, ActionCreators> = createRedux<State, _>({
  filter: {
    first: true,
  },
  initialState: INITIAL_STATE,
  handlers: {
    setFirst: (state, { type, first }) => update(state, { first: { $set: first } }),
    clearFirst: state => update(state, { first: { $set: null } }),
    setSecond: (state, { type, second }) => update(state, { second: { $set: second } }),
    clearSecond: state => update(state, { second: { $set: null } }),
  },
  prefix: '.sample.prefix',
})

export const type = redux.types.setFirst
redux.creators.setFirst({ first: { a: 1 } })

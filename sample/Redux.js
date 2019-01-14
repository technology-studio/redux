/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2019-01-13T10:37:13+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

import {
  type Action,
  type Redux,
  createRedux,
} from '../lib'

type SampleData = {
  sampleNumber: number,
}

type SetAttributes = {
  data: SampleData,
}

export type Creators = {
  set: (attributes: SetAttributes) => Action & SetAttributes,
  clear: () => Action,
}

export type State = {|
  data: ?SampleData,
|}

export const redux: Redux<State, Creators> = createRedux<State, _>({
  filter: {
    data: true,
  },
  initialState: {
    data: null,
  },
  handlers: {
    set: (state, { type, error }) => state,
    clear: state => state,
  },
  prefix: '.sample.prefix',
})

export const type = redux.types.set
redux.creators.set({ data: { sampleNumber: 1 } })

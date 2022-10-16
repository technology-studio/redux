/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2019-02-22T22:15:47+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import {
  redux,
  INITIAL_STATE,
} from '../../sample/MultipleAttributesRedux'

const VOID_ACTION = {
  type: 'VOID',
}

const NOT_RELATED_ACTION = {
  type: 'NOTE_RELATED',
}

const FIRST_STATE = redux.reducer(undefined, VOID_ACTION)

const SAMPLE_DATA_1 = {
  a: 1,
}

describe('createRedux', () => {
  test('reducer should intialize with initial state', () => {
    expect(redux.reducer(undefined, VOID_ACTION)).toBe(INITIAL_STATE)
  })

  test('reducer should not change state with not related action', () => {
    const nextState = redux.reducer(FIRST_STATE, NOT_RELATED_ACTION)
    expect(nextState).toBe(FIRST_STATE)
  })

  test('reducer should update state with new attribute and keep other the same', () => {
    const nextState = redux.reducer(FIRST_STATE, redux.creators.setFirst({ first: SAMPLE_DATA_1 }))
    expect(nextState.first).toBe(SAMPLE_DATA_1)
    expect(nextState.second).toBe(FIRST_STATE.second)
  })
})

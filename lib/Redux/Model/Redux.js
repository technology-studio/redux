/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-04-07T07:06:49+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import { combineReducers, type Reducer } from 'redux'
import constantCase from 'constant-case'
import Immutable from 'seamless-immutable'

import type {
  Action,
  ExtractActionCreatorReturnType,
  Handler,
  HandlerMap,
  HandlerWrapper,
  NodeReduxMap,
  Redux,
  TypeMap,
} from '../../Model/Types'

import { resettableReducer } from './ResettableRedux'

const createTypes = <KEY: string> (keys: KEY[], prefix: string): TypeMap<KEY> => {
  return keys.reduce((typeMap, key) => {
    typeMap[key] = prefix + constantCase(key)
    return typeMap
  }, {})
}

const wrapImmutable = <VALUE> (previous: ?VALUE, next: VALUE): VALUE => previous && previous === next ? previous : Immutable(next)

const identityHandler = <STATE, ACTION>(state: STATE, action: ACTION): STATE => state

const createReducer = <STATE, INNER_STATE, ACTION_BASE: Action> (
  initialState: INNER_STATE,
  handlerMap: HandlerMap<INNER_STATE>,
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, *>,
): Reducer<STATE, $Subtype<Action>> => {
  if (!initialState) {
    throw new Error('initial state is required')
  }

  return (state: ?STATE, action: ACTION_BASE): STATE => {
    var handler
    if (action && action.type) {
      const type: string = action.type
      handler = handlerMap[type]
    }
    return wrapImmutable(state, handlerWrapper(initialState, state, action, handler || identityHandler))
  }
}

const defaultFilter = {}

export type Attributes<STATE> = {
  filter: Object,
  initialState: STATE,
  handlers: Object,
  prefix: string,
  resettable?: boolean,
}

export type AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = Attributes<INNER_STATE> & {
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, ACTION_BASE>,
}

export const createReduxAdvanced = <
  STATE,
  INNER_STATE,
  ACTION_BASE: Action,
  ATTRIBUTES: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE>,
>(attributes: ATTRIBUTES): Redux<STATE, $ObjMap<$PropertyType<ATTRIBUTES, 'handlers'>, ExtractActionCreatorReturnType>> => {
  const _attributes: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = {
    filter: defaultFilter,
    ...attributes,
  }

  const handlers: $PropertyType<ATTRIBUTES, 'handlers'> = attributes.handlers
  const handlersKeys: $Keys<$PropertyType<ATTRIBUTES, 'handlers'>>[] = Object.keys(handlers)
  const types: TypeMap<$Keys<$PropertyType<ATTRIBUTES, 'handlers'>>> = createTypes(handlersKeys, _attributes.prefix)

  const applyResettable = reducer => attributes.resettable ? resettableReducer(reducer) : reducer
  const reducer: Reducer<STATE, $Subtype<Action>> = applyResettable(
    createReducer(
      Immutable(_attributes.initialState),
      handlersKeys.reduce((handlerMap, handlerKey) => {
        handlerMap[types[handlerKey]] = _attributes.handlers[handlerKey]
        return handlerMap
      }, {}),
      attributes.handlerWrapper,
    )
  )

  const creators = handlersKeys.reduce((creatorList, handlerKey) => {
    creatorList[handlerKey] = (attributes) => ({
      type: types[handlerKey],
      ...attributes,
    })
    return creatorList
  }, {})

  return {
    prefix: attributes.prefix,
    filter: _attributes.filter,
    reducer,
    types,
    creators,
  }
}

export const combineRedux = (reduxMap: NodeReduxMap) => ({
  filter: Object.keys(reduxMap).reduce((filterMap, key) => {
    filterMap[key] = reduxMap[key].filter
    return filterMap
  }, {}),
  reducer: combineReducers(Object.keys(reduxMap).reduce((reducerMap, key) => {
    reducerMap[key] = reduxMap[key].reducer
    return reducerMap
  }, {})),
}: {
  filter: Object,
  reducer: Reducer<any, *>, // TODO: fix Reducer<$ObjMap<typeof reduxMap, <S>(r: Reducer<S, any>) => S>, *>,
})

export const createRedux = <
  STATE,
  ATTRIBUTES: Attributes<STATE>,
>(attributes: ATTRIBUTES): Redux<STATE, $ObjMap<$PropertyType<ATTRIBUTES, 'handlers'>, ExtractActionCreatorReturnType>> => {
  return createReduxAdvanced({
    ...attributes,
    handlerWrapper: <ACTION: $Subtype<Action>>(initialState: STATE, state: ?STATE, action: ACTION, handler: Handler<STATE, ACTION>) => handler(state || initialState, action),
  })
}

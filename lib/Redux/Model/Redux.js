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
  AbstractReduxMap,
  Action,
  ExtractActionCreatorReturnType,
  Handler,
  HandlerMap,
  HandlerWrapper,
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

const createReducer = <STATE, INNER_STATE> (
  initialState: INNER_STATE,
  handlerMap: HandlerMap<INNER_STATE>,
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE>,
): Reducer<STATE, $Subtype<Action>> => {
  if (!initialState) {
    throw new Error('initial state is required')
  }

  return <ACTION: Action>(state: ?STATE, action: ACTION): STATE => {
    var handler
    if (action && action.type) {
      const type: string = action.type
      handler = handlerMap[type]
    }
    return wrapImmutable(state, handlerWrapper(initialState, state, action, handler || identityHandler))
  }
}

const defaultFilter = {}

export type Attributes<STATE, HANDLER_KEY: string> = {
  filter: Object,
  initialState: STATE,
  handlers: {
    [HANDLER_KEY]: Handler<STATE, $Subtype<Action>>,
  },
  prefix: string,
  resettable?: boolean,
}

export type AttributesAdvanced<STATE, INNER_STATE, HANDLER_KEY: string> = Attributes<INNER_STATE, HANDLER_KEY> & {
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE>,
}

export const createReduxAdvanced = <
  STATE,
  INNER_STATE,
  HANDLER_KEY: string,
  ATTRIBUTES: AttributesAdvanced<STATE, INNER_STATE, HANDLER_KEY>,
>(attributes: ATTRIBUTES): Redux<STATE, HANDLER_KEY, $ObjMap<$PropertyType<ATTRIBUTES, 'handlers'>, ExtractActionCreatorReturnType>> => {
  const _attributes: AttributesAdvanced<STATE, INNER_STATE, HANDLER_KEY> = {
    filter: defaultFilter,
    ...attributes,
  }

  const handlersKeys = Object.keys(_attributes.handlers)
  const types: TypeMap<HANDLER_KEY> = createTypes(handlersKeys, _attributes.prefix)

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
    filter: _attributes.filter,
    reducer,
    types,
    creators,
  }
}

export const combineRedux = (reduxMap: AbstractReduxMap) => ({
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
  HANDLER_KEY: string,
  ATTRIBUTES: Attributes<STATE, HANDLER_KEY>,
>(attributes: ATTRIBUTES): Redux<STATE, HANDLER_KEY, $ObjMap<$PropertyType<ATTRIBUTES, 'handlers'>, ExtractActionCreatorReturnType>> => {
  return createReduxAdvanced({
    ...attributes,
    handlerWrapper: <ACTION: $Subtype<Action>>(initialState: STATE, state: ?STATE, action: ACTION, handler: Handler<STATE, ACTION>) => handler(state || initialState, action),
  })
}

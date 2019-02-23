/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-04-07T07:06:49+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

import { combineReducers, type Reducer } from 'redux'
import constantCase from 'constant-case'

import type {
  Action,
  HandlerAction,
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

type Immutable = <+VALUE>(value: $ReadOnly<VALUE>) => $ReadOnly<VALUE>

const identity = <+VALUE>(value: $ReadOnly<VALUE>) => value

const wrapImmutable = <VALUE> (immutable: Immutable, previous: ?VALUE, next: VALUE): VALUE => previous && previous === next ? previous : immutable(next)

const createReducer = <STATE, INNER_STATE, ACTION_BASE: Action & { attributes: * }> (
  initialState: INNER_STATE,
  handlerMap: HandlerMap<INNER_STATE>,
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, *>,
  immutable: Immutable
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
    return wrapImmutable(
      immutable,
      state,
      handlerWrapper(
        immutable(initialState),
        state,
        action,
        handler
      )
    )
  }
}

const defaultFilter = {}

export type Attributes<STATE> = {
  filter: Object,
  initialState: STATE,
  handlers: Object,
  prefix: string,
  resettable?: boolean,
  immutable?: Immutable,
}

export type AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = Attributes<INNER_STATE> & {
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, ACTION_BASE>,
}

export const createReduxAdvanced = <
  STATE,
  INNER_STATE,
  ACTION_BASE: HandlerAction<*>,
  ATTRIBUTES: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE>,
>(attributes: ATTRIBUTES): Redux<STATE, $ObjMap<$PropertyType<ATTRIBUTES, 'handlers'>, ExtractActionCreatorReturnType>> => {
  const _attributes: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = {
    filter: defaultFilter,
    ...attributes,
  }
  const immutable: Immutable = attributes.immutable || identity
  const handlers: $PropertyType<ATTRIBUTES, 'handlers'> = attributes.handlers
  const handlersKeys: $Keys<$PropertyType<ATTRIBUTES, 'handlers'>>[] = Object.keys(handlers)
  const types: TypeMap<$Keys<$PropertyType<ATTRIBUTES, 'handlers'>>> = createTypes(handlersKeys, _attributes.prefix)

  const applyResettable = reducer => attributes.resettable ? resettableReducer(reducer) : reducer
  const reducer: Reducer<STATE, $Subtype<Action>> = applyResettable(
    createReducer(
      _attributes.initialState,
      handlersKeys.reduce((handlerMap, handlerKey) => {
        handlerMap[types[handlerKey]] = _attributes.handlers[handlerKey]
        return handlerMap
      }, {}),
      attributes.handlerWrapper,
      immutable,
    )
  )

  const creators = handlersKeys.reduce((creatorList, handlerKey) => {
    creatorList[handlerKey] = (attributes, actionAttributes) => ({
      type: types[handlerKey],
      attributes,
      ...actionAttributes,
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
    handlerWrapper: <ACTION: $Subtype<Action>>(
      initialState: STATE,
      state: ?STATE,
      action: ACTION,
      handler: ?Handler<STATE, ACTION>
    ) => handler ? handler(state || initialState, action.attributes, action) : (state || initialState),
  })
}

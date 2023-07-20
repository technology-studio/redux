/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-04-07T07:06:49+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import type { Reducer } from 'redux'
import { combineReducers } from 'redux'
import { constantCase } from 'constant-case'

import type {
  Action,
  HandlerAction,
  Handler,
  HandlerMap,
  HandlerWrapper,
  NodeReduxMap,
  Redux,
  TypeMap,
  FilterNode,
  ReduxHandler,
  Creators,
} from '../../Model/Types'

import { resettableReducer } from './ResettableRedux'

// TODO: resolve why typescript throws error when using KEY generic
const createTypes = (keys: (string | number | symbol)[], prefix: string): TypeMap<string | number | symbol> => {
  const result = keys.reduce<TypeMap<string | number | symbol>>((typeMap, key) => {
    typeMap[key] = prefix + constantCase(key as string)
    return typeMap
  }, {})
  return result
}

type Immutable = <VALUE>(value: VALUE) => VALUE

const identity = <VALUE>(value: VALUE): VALUE => value

const wrapImmutable = <VALUE>(immutable: Immutable, previous: VALUE | undefined, next: VALUE): VALUE => previous != null && previous === next ? previous : immutable(next)

const createReducer = <
  STATE,
  INNER_STATE,
  ACTION_BASE extends Action & { attributes: Record<string, unknown> },
>(
    initialState: INNER_STATE,
    handlerMap: HandlerMap<INNER_STATE>,
    handlerWrapper: HandlerWrapper<STATE, INNER_STATE, HandlerAction<Record<string, unknown>>>,
    immutable: Immutable,
  ): Reducer<STATE, ACTION_BASE> => {
  if (initialState == null) {
    throw new Error('initial state is required')
  }

  return (state: STATE | undefined, action: ACTION_BASE): STATE => {
    let handler
    if (action?.type != null && action.type !== '') {
      const type: string = action.type
      handler = handlerMap[type]
    }
    return wrapImmutable(
      immutable,
      state,
      handlerWrapper(
        state,
        action,
        handler,
      ),
    )
  }
}

// const defaultFilter = {}

export type Attributes<
INNER_STATE,
HANDLER_KEY extends string,
HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE>>
> = {
  filter: FilterNode,
  initialState: INNER_STATE,
  handlers: HANDLERS,
  prefix: string,
  resettable?: boolean,
  immutable?: Immutable,
}

export type AttributesAdvanced<
  STATE,
  INNER_STATE,
  ACTION_BASE extends HandlerAction<Record<string, unknown>>,
  HANDLER_KEY extends string,
  HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE>>,
> = Attributes<INNER_STATE, HANDLER_KEY, HANDLERS> & {
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, ACTION_BASE>,
}

export const createReduxAdvanced = <
  STATE,
  INNER_STATE,
  ACTION_BASE extends HandlerAction<Record<string, unknown>>,
  HANDLER_KEY extends string,
  HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE>>,
  ATTRIBUTES extends AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE, HANDLER_KEY, HANDLERS>,
> (attributes: ATTRIBUTES): Redux<STATE, INNER_STATE, HANDLER_KEY, HANDLERS> => {
  // const _attributes: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = {
  //   // filter: defaultFilter,
  //   ...attributes,
  // }
  const immutable: Immutable = attributes.immutable ?? identity
  const handlers: HANDLERS = attributes.handlers
  const handlersKeys = Object.keys(handlers) as (HANDLER_KEY)[]
  const types: TypeMap<HANDLER_KEY> = createTypes(handlersKeys, attributes.prefix)

  const applyResettable = <STATE, ACTION extends Action>(reducer: Reducer<STATE, ACTION>): Reducer<STATE, ACTION> => attributes.resettable ?? false ? resettableReducer(reducer) : reducer

  const reducer: Reducer<STATE, ACTION_BASE> = applyResettable(
    createReducer(
      attributes.initialState,
      handlersKeys.reduce<Record<string, ReduxHandler<INNER_STATE>>>(
        (handlerMap, handlerKey) => {
          handlerMap[types[handlerKey]] = handlers[handlerKey]
          return handlerMap
        },
        {},
      ),
      attributes.handlerWrapper,
      immutable,
    ),
  )

  const creators = handlersKeys.reduce<Creators<INNER_STATE, HANDLER_KEY, HANDLERS>>((creatorList, handlerKey) => {
    creatorList[handlerKey] = (attributes, actionAttributes) => ({
      type: types[handlerKey],
      attributes,
      ...actionAttributes,
    })
    return creatorList
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  }, {} as Creators<INNER_STATE, HANDLER_KEY, HANDLERS>)

  return {
    prefix: attributes.prefix,
    filter: attributes.filter,
    reducer,
    types,
    creators,
  }
}

export const combineRedux = (reduxMap: NodeReduxMap): {
  filter: FilterNode,
  reducer: Reducer, // TODO: fix Reducer<$ObjMap<typeof reduxMap, <S>(r: Reducer<S, any>) => S>, *>,
} => ({
  filter: Object.keys(reduxMap).reduce<Record<string, FilterNode>>((filterMap, key) => {
    filterMap[key] = reduxMap[key].filter
    return filterMap
  }, {}),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducer: combineReducers(Object.keys(reduxMap).reduce<Record<string, Reducer<unknown, any>>>((reducerMap, key) => {
    reducerMap[key] = reduxMap[key].reducer
    return reducerMap
  }, {})),
})

export const createRedux = <
  STATE,
  HANDLER_KEY extends string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  HANDLERS extends Record<HANDLER_KEY, ReduxHandler<STATE, any>>,
>(attributes: Attributes<STATE, HANDLER_KEY, HANDLERS>): Redux<STATE, STATE, HANDLER_KEY, HANDLERS> => createReduxAdvanced<
  STATE,
  STATE,
  HandlerAction<Record<string, unknown>>,
  HANDLER_KEY,
  HANDLERS,
  AttributesAdvanced<STATE, STATE, HandlerAction<Record<string, unknown>>, HANDLER_KEY, HANDLERS>
  >({
    ...attributes,
    handlerWrapper: <ACTION extends HandlerAction<Record<string, unknown>>>(
      state: STATE | undefined,
      action: ACTION,
      handler: Handler<STATE, ACTION> | undefined,
    ) => (handler != null) ? handler(state ?? attributes.initialState, action.attributes, action) : (state ?? attributes.initialState),
  })

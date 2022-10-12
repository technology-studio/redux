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
  Filter,
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

const wrapImmutable = <VALUE>(immutable: Immutable, previous: VALUE | undefined, next: VALUE): VALUE => previous && previous === next ? previous : immutable(next)

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
  if (!initialState) {
    throw new Error('initial state is required')
  }

  return (state: STATE | undefined, action: ACTION_BASE): STATE => {
    let handler
    if (action?.type) {
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
        handler,
      ),
    )
  }
}

// const defaultFilter = {}

export type Attributes<STATE, HANDLERS extends Record<keyof HANDLERS, ReduxHandler<STATE>>> = {
  filter: Filter,
  initialState: STATE,
  handlers: HANDLERS,
  prefix: string,
  resettable?: boolean,
  immutable?: Immutable,
}

export type AttributesAdvanced<
  STATE,
  INNER_STATE,
  ACTION_BASE extends HandlerAction<Record<string, unknown>>,
  HANDLERS extends Record<keyof HANDLERS, ReduxHandler<INNER_STATE>>,
> = Attributes<INNER_STATE, HANDLERS> & {
  handlerWrapper: HandlerWrapper<STATE, INNER_STATE, ACTION_BASE>,
}

export const createReduxAdvanced = <
  STATE,
  INNER_STATE,
  ACTION_BASE extends HandlerAction<Record<string, unknown>>,
  ATTRIBUTES extends AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE, HANDLERS>,
  HANDLERS extends Record<keyof ATTRIBUTES['handlers'], ReduxHandler<INNER_STATE>>,
>(attributes: ATTRIBUTES): Redux<STATE, HANDLERS> => {
  // const _attributes: AttributesAdvanced<STATE, INNER_STATE, ACTION_BASE> = {
  //   // filter: defaultFilter,
  //   ...attributes,
  // }
  const immutable: Immutable = attributes.immutable ?? identity
  const handlers: HANDLERS = attributes.handlers
  const handlersKeys = Object.keys(handlers) as (keyof HANDLERS)[]
  const types: TypeMap<keyof HANDLERS> = createTypes(handlersKeys, attributes.prefix)

  const applyResettable = <STATE, ACTION extends Action>(reducer: Reducer<STATE, ACTION>): Reducer<STATE, ACTION> => attributes.resettable ? resettableReducer(reducer) : reducer

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

  const creators = handlersKeys.reduce<Creators<STATE, HANDLERS>>((creatorList, handlerKey) => {
    creatorList[handlerKey] = (attributes, actionAttributes) => ({
      type: types[handlerKey],
      attributes,
      ...actionAttributes,
    })
    return creatorList
  // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter, @typescript-eslint/consistent-type-assertions
  }, {} as Creators<STATE, HANDLERS>)

  return {
    prefix: attributes.prefix,
    filter: attributes.filter,
    reducer,
    types,
    creators,
  }
}

export const combineRedux = (reduxMap: NodeReduxMap): {
  filter: Record<string, unknown>,
  reducer: Reducer, // TODO: fix Reducer<$ObjMap<typeof reduxMap, <S>(r: Reducer<S, any>) => S>, *>,
} => ({
  filter: Object.keys(reduxMap).reduce<Record<string, Filter>>((filterMap, key) => {
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
  HANDLERS extends Record<keyof HANDLERS, ReduxHandler<STATE>>,
>(attributes: Attributes<STATE, HANDLERS>): Redux<STATE, HANDLERS> => createReduxAdvanced<
  STATE,
  STATE,
  HandlerAction<Record<string, unknown>>,
  AttributesAdvanced<STATE, STATE, HandlerAction<Record<string, unknown>>, HANDLERS>,
  HANDLERS
  >({
    ...attributes,
    handlerWrapper: <ACTION extends HandlerAction<Record<string, unknown>>>(
      initialState: STATE,
      state: STATE | undefined,
      action: ACTION,
      handler: Handler<STATE, ACTION> | undefined,
    ) => handler ? handler(state ?? initialState, action.attributes, action) : (state ?? initialState),
  })

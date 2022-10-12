/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-08-10T07:44:18+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import type { Reducer } from 'redux'

export type Action = {
  type: string,
}

export type FilterLeaf = '*' | boolean
export type FilterNode = { [key: string]: FilterNode } | FilterLeaf
export type Filter = { [key: string]: FilterNode }

export type TypeMap<KEY extends string | number | symbol> = Record<KEY, string>

export type NodeRedux<STATE> = {
  filter: Filter,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducer: Reducer<STATE, any>,
}

export type AbstractRedux<STATE> = NodeRedux<STATE> & {
  prefix: string,
}

export type Redux<STATE, HANDLERS> = AbstractRedux<STATE> & {
  types: TypeMap<keyof HANDLERS>,
  creators: Creators<STATE, HANDLERS>,
}

export type ExtractHandlerActionAttributes<STATE, HANDLER> = HANDLER extends ReduxHandler<STATE, infer ATTRIBUTES> ? ATTRIBUTES : never

export type Creators<STATE, HANDLERS> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [KEY in keyof HANDLERS]: ActionCreator<ExtractHandlerActionAttributes<STATE, HANDLERS[KEY]>, any>
}

export type NodeReduxMap = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: NodeRedux<any>,
}

export type HandlerAction<HANDLER_ATTRIBUTES> = Action & {
  attributes: HANDLER_ATTRIBUTES,
}

export type ActionCreator<
  ATTRIBUTES = Record<string, unknown> | undefined,
  ADDITIONAL_ACTION_ATTRIBUTES = Record<string, unknown> | undefined,
> = (
  attributes: ATTRIBUTES,
  actionAttributes?: ADDITIONAL_ACTION_ATTRIBUTES,
) => HandlerAction<ATTRIBUTES> & ADDITIONAL_ACTION_ATTRIBUTES

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReduxHandler<STATE, ATTRIBUTES extends Record<string, unknown> | any = any> = (
  state: STATE,
  attributes: ATTRIBUTES,
) => STATE

export type Handler<STATE, ACTION extends HandlerAction<Record<string, unknown>>> = (
  state: STATE,
  attributes: ACTION['attributes'],
  action: ACTION,
) => STATE

export type HandlerWrapper<STATE, INNER_STATE, ACTION_BASE extends HandlerAction<Record<string, unknown>>> = <ACTION extends ACTION_BASE>(
  initialState: INNER_STATE,
  state: STATE | undefined,
  action: ACTION,
  handler: Handler<INNER_STATE, ACTION> | undefined,
) => STATE

export type HandlerMap<STATE> = {
  [key: string | number | symbol]: Handler<STATE, HandlerAction<Record<string, unknown>>>,
}

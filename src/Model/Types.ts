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

export type Redux<STATE, INNER_STATE, HANDLER_KEY extends string, HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE, any>>> = AbstractRedux<STATE> & {
  types: TypeMap<HANDLER_KEY>,
  creators: Creators<INNER_STATE, HANDLER_KEY, HANDLERS>,
}

export type ExtractHandlerActionAttributes<STATE, HANDLER> = HANDLER extends ReduxHandler<STATE, infer ATTRIBUTES> ? ATTRIBUTES : never

export type Creators<INNER_STATE, HANDLER_KEY extends string, HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE>>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [KEY in HANDLER_KEY]: ActionCreator<ExtractHandlerActionAttributes<INNER_STATE, HANDLERS[KEY]>, any>
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
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
  attributes: ATTRIBUTES extends undefined ? void : ATTRIBUTES,
  actionAttributes?: ADDITIONAL_ACTION_ATTRIBUTES,
) => HandlerAction<ATTRIBUTES> & ADDITIONAL_ACTION_ATTRIBUTES

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ReduxHandler<STATE, ATTRIBUTES extends Record<string, unknown> | any = any> = (
  state: STATE,
  attributes: ATTRIBUTES,
) => STATE

export type Handler<INNER_STATE, ACTION extends HandlerAction<Record<string, unknown>>> = (
  state: INNER_STATE,
  attributes: ACTION['attributes'],
  action: ACTION,
) => INNER_STATE

export type HandlerWrapper<STATE, INNER_STATE, ACTION_BASE extends HandlerAction<Record<string, unknown>>> = <ACTION extends ACTION_BASE>(
  state: STATE | undefined,
  action: ACTION,
  handler: Handler<INNER_STATE, ACTION> | undefined,
) => STATE

export type HandlerMap<STATE> = {
  [key: string | number | symbol]: Handler<STATE, HandlerAction<Record<string, unknown>>>,
}

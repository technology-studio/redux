/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-08-10T07:44:18+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
**/

import type { Reducer } from 'redux'
import type { Translate } from '@txo/functional'

export type Action = {
  type: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterLeaf = '*' | Translate<any> | boolean
export type FilterNode = { [key: string]: FilterNode } | FilterLeaf
export type Filter = Record<string, FilterNode>

export type TypeMap<KEY extends string | number | symbol> = Record<KEY, string>

export type NodeRedux<STATE> = {
  filter: FilterNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reducer: Reducer<STATE, any>,
}

export type AbstractRedux<STATE> = NodeRedux<STATE> & {
  prefix: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Redux<STATE, INNER_STATE, HANDLER_KEY extends string, HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE, any>>> = AbstractRedux<STATE> & {
  types: TypeMap<HANDLER_KEY>,
  creators: Creators<INNER_STATE, HANDLER_KEY, HANDLERS>,
}

export type ExtractHandlerActionAttributes<STATE, HANDLER> = HANDLER extends ReduxHandler<STATE, infer ATTRIBUTES> ? ATTRIBUTES : never

export type Creators<INNER_STATE, HANDLER_KEY extends string, HANDLERS extends Record<HANDLER_KEY, ReduxHandler<INNER_STATE>>> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [KEY in HANDLER_KEY]: ActionCreator<ExtractHandlerActionAttributes<INNER_STATE, HANDLERS[KEY]>, any>
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type NodeReduxMap = Record<string, NodeRedux<any>>

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-redundant-type-constituents
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

export type HandlerMap<STATE> = Record<string | number | symbol, Handler<STATE, HandlerAction<Record<string, unknown>>>>

/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-08-10T07:44:18+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import type { Reducer } from 'redux'

export type Action = {
  type: $Supertype<string>,
}

export type TypeMap<KEY: string> = {
  [KEY]: string,
}

export type AbstractRedux<STATE> = {
  filter: Object,
  reducer: Reducer<STATE, any>,
}
export type Redux<STATE, HANDLER_KEY: string, CREATORS> = AbstractRedux<STATE> & {
  types: TypeMap<HANDLER_KEY>,
  creators: CREATORS,
}

export type AbstractReduxMap = {
  [string]: AbstractRedux<any>,
}

export type HandlerAction<HANDLER_ATTRIBUTES> = Action & HANDLER_ATTRIBUTES

export type ExtractActionCreatorReturnType = <PARAM, HANDLER_ATTRIBUTES, STATE> ((state: STATE, action: HandlerAction<HANDLER_ATTRIBUTES>) => STATE) => (attributes: HANDLER_ATTRIBUTES) => HandlerAction<HANDLER_ATTRIBUTES> // eslint-disable-line

export type Handler<STATE, ACTION> = (state: STATE, action: ACTION) => STATE

export type HandlerWrapper<STATE, INNER_STATE> = <ACTION: $Subtype<Action>>(initialState: INNER_STATE, state: ?STATE, action: ACTION, handler: Handler<INNER_STATE, ACTION>) => STATE

export type HandlerMap<STATE> = {
  [string]: Handler<STATE, $Supertype<Action>>,
}

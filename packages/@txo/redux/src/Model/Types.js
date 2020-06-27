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
  +type: string,
  ...
}

export type TypeMap<KEY: string> = $ReadOnly<{
  [KEY]: string,
}>

export type NodeRedux<STATE> = {
  +filter: Object,
  +reducer: Reducer<STATE, any>,
}

export type AbstractRedux<STATE> = $ReadOnly<{
  ...NodeRedux<STATE>,
  +prefix: string,
}>

export type Redux<STATE, CREATORS: Object> = $ReadOnly<{
  ...AbstractRedux<STATE>,
  +types: TypeMap<$Keys<CREATORS>>,
  +creators: CREATORS,
}>

export type NodeReduxMap = $ReadOnly<{
  [string]: NodeRedux<any>,
}>

export type HandlerAction<HANDLER_ATTRIBUTES> = $ReadOnly<{
  ...Action,
  +attributes: HANDLER_ATTRIBUTES,
}>

export type ActionCreator<
  ATTRIBUTES: Object = void,
  ADDITIONAL_ACTION_ATTRIBUTES: Object = void
> = (
  attributes: ATTRIBUTES,
  actionAttribues: ADDITIONAL_ACTION_ATTRIBUTES,
) => $ReadOnly<{
  ...HandlerAction<ATTRIBUTES>,
  ...ADDITIONAL_ACTION_ATTRIBUTES,
}>

export type ExtractActionCreatorReturnType = <PARAM, HANDLER_ATTRIBUTES, STATE> (
  (state: STATE, action: HandlerAction<HANDLER_ATTRIBUTES>) => STATE,
) => (attributes: HANDLER_ATTRIBUTES) => HandlerAction<HANDLER_ATTRIBUTES> // eslint-disable-line

export type Handler<STATE, ACTION: HandlerAction<*>> = (
  state: STATE,
  attributes: $PropertyType<ACTION, 'attributes'>,
  action: $ReadOnly<ACTION>,
) => STATE

export type HandlerWrapper<STATE, INNER_STATE, ACTION_BASE: HandlerAction<*>> = <ACTION: ACTION_BASE>(
  initialState: INNER_STATE,
  state: ?STATE,
  action: ACTION,
  handler: ?Handler<INNER_STATE, ACTION>,
) => STATE

export type HandlerMap<STATE> = $ReadOnly<{
  [string]: Handler<STATE, HandlerAction<*>>,
}>

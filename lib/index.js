/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2018-03-17T13:08:21+01:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import { storeManager } from './Api/StoreManager'
import { AbstractStateObservableManager } from './Api/AbstractStateObservableManager'
import { StoreObservableManager } from './Api/StoreObservableManager'
import type {
  AbstractRedux,
  AbstractReduxMap,
  Action,
  ExtractActionCreatorReturnType,
  Handler,
  HandlerAction,
  HandlerWrapper,
  Redux,
  TypeMap,
} from './Model/Types'
import {
  createRedux,
  createReduxAdvanced,
  combineRedux,
  type Attributes,
  type AttributesAdvanced,
} from './Redux/Model/Redux'
import {
  resettableReducer,
  resettableRedux,
} from './Redux/Model/ResettableRedux'

export {
  AbstractStateObservableManager,
  combineRedux,
  createRedux,
  createReduxAdvanced,
  resettableReducer,
  resettableRedux,
  storeManager,
  StoreObservableManager,
}

export type {
  AbstractRedux,
  AbstractReduxMap,
  Action,
  Attributes,
  AttributesAdvanced,
  ExtractActionCreatorReturnType,
  Handler,
  HandlerAction,
  HandlerWrapper,
  Redux,
  TypeMap,
}

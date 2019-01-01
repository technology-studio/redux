/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2017-06-14T21:19:38+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import { AbstractStateObservableManager } from './AbstractStateObservableManager'

export class StoreObservableManager<STATE> extends AbstractStateObservableManager<STATE, STATE> {
  constructor () {
    super((state) => state)
  }
}

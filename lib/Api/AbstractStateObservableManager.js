/**
 * @Author: Rostislav Simonik <rostislav.simonik>
 * @Date:   2017-06-14T21:19:38+02:00
 * @Email:  rostislav.simonik@technologystudio.sk
 * @Copyright: Technology Studio
 * @flow
 */

'use strict'; // eslint-disable-line

import { storeManager } from '../Api/StoreManager'

export class AbstractStateObservableManager<STATE, REDUX_STATE> {
  _state: ?STATE

  constructor (stateSelector: (state: REDUX_STATE) => any) {
    this._state = null
    storeManager.observeStoreWithSelect(stateSelector, this._onChangeHandler)
  }

  dispatchAction (action: Object) {
    storeManager.dispatch(action)
  }

  _onChangeHandler = (state: STATE) => {
    this.onChange(state)
  }

  onChange (state: STATE) {
    this._state = state
  }

  getState (): ?STATE {
    return this._state
  }
}

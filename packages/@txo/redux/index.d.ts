declare module "@txo/redux" {
  import type { Reducer } from 'redux'

  type Action = {
    type: string,
  }

  type Filter = '*'
  type FilterNode = { [key: string]: FilterNode | Filter } | Filter

  type NodeRedux<STATE> = {
    filter: FilterNode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reducer: Reducer<STATE, any>,
  }

  type AbstractRedux<STATE> = NodeRedux<STATE> & {
    prefix: string,
  }

  type Redux<STATE, CREATORS> = AbstractRedux<STATE> & {
    types: { [key in keyof CREATORS]: string},
    creators: CREATORS,
  }

  type NodeReduxMap = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: NodeRedux<any>,
  }

  type HandlerAction<HANDLER_ATTRIBUTES> = Action & {
    attributes: HANDLER_ATTRIBUTES,
  }

  type ActionCreator<
    ATTRIBUTES = void,
    ADDITIONAL_ACTION_ATTRIBUTES = void,
  > = (
    attributes: ATTRIBUTES,
    actionAttribues: ADDITIONAL_ACTION_ATTRIBUTES,
  ) => HandlerAction<ATTRIBUTES> & ADDITIONAL_ACTION_ATTRIBUTES

  type ExtractHandlerActionAttributes<STATE, HANDLER> = HANDLER extends ReduxHandler<STATE, infer ATTRIBUTES> ? ATTRIBUTES : never

  type ReduxHandler<STATE, ATTRIBUTES = void> = (
    state: STATE,
    attributes: ATTRIBUTES,
  ) => STATE

  type GetNodeReduxState <NODE_REDUX> = NODE_REDUX extends NodeRedux<infer STATE> ? STATE : never
  type ExtractNodeReduxState<NODE_REDUX_MAP> = { [KEY in keyof NODE_REDUX_MAP]: GetNodeReduxState<NODE_REDUX_MAP[KEY]> }

  function combineRedux <NODE_REDUX_MAP extends NodeReduxMap> (
    reduxMap: NODE_REDUX_MAP
  ): NodeRedux<ExtractNodeReduxState<NODE_REDUX_MAP>>

  type ImmutableWrapper = <VALUE>(value: VALUE) => VALUE

  type CreateReduxAttributes<STATE> = {
    filter: FilterNode,
    initialState: STATE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handlers: { [key: string]: ReduxHandler<STATE, any> },
    prefix: string,
    resettable?: boolean,
    immutable?: ImmutableWrapper,
  }

  type Creators<STATE, HANDLERS> = {
    [KEY in keyof HANDLERS]: ActionCreator<ExtractHandlerActionAttributes<STATE, HANDLERS[KEY]>, any>
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function createRedux<STATE, HANDLERS extends { [key: string]: ReduxHandler<STATE, any> }> (
    attributes: CreateReduxAttributes<STATE>
  ): Redux<STATE, Creators<STATE, HANDLERS>>

  type ResetAction = {
    type: 'RESET',
  }

  const resettableRedux: {
    actions: {
      reset: ResetAction,
    },
    creators: {
      reset: () => ResetAction,
    },
  }
}

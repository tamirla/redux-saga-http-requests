import { handleAction, combineActions } from 'redux-actions';
import { values } from 'lodash';
import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { asyncAction } from './asyncActions';

const asyncActionsReducer = (action, {
  store, config: {
    initialState = {},
    extraActions = [],
    persist = undefined,
  } = {},
}) => {
  const reducer = handleAction(
    combineActions(
      ...values(asyncAction(action)),
      ...extraActions,
    ), (state, { payload }) => ({
      ...state,
      ...payload,
    }),
    {
      isLoading: false,
      data: initialState,
    },
  );
  return persist ? persistReducer({
    ...persist,
    key: store,
    storage,
  }, reducer) : reducer;
};

export default asyncActionsReducer;

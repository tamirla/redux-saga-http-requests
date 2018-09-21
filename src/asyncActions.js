import { createActions } from 'redux-actions';
import { get } from 'lodash';

let asyncActions = {};

const createAsyncAction = name => createActions({
  [name]: {
    CALLED: () => ({ isLoading: true }),
    COMPLETED: payload => ({ data: payload, isLoading: false, error: null }),
    FAILED: error => ({ error, isLoading: false }),
  },
});

export const initAsyncActions = (requests) => {
  asyncActions = Object.keys(requests).reduce((obj, api) => ({
    ...obj,
    [api]: {
      actions: createAsyncAction(api),
    },
  }), {});
};

export const asyncAction = name => get(asyncActions, [name, 'actions', name]);
export const completedAsyncAction = name => get(asyncAction(name), 'completed');
export const failedAsyncAction = name => get(asyncAction(name), 'failed');

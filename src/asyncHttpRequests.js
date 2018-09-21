import {
  put, takeEvery, call, all,
} from 'redux-saga/effects';
import { init, httpRequest, extractErrorMessage } from './http';
import {
  initAsyncActions,
  completedAsyncAction,
  failedAsyncAction,
  asyncAction,
} from './asyncActions';
import asyncActionReducer from './asyncActionReducer';

const DISPATCH_SAGA = 'DISPATCH_SAGA';

let requests;

const createReducers = reqs => (
  Object.keys(reqs).reduce((obj, api) => ({
    ...obj,
    [requests[api].store]: asyncActionReducer(api, requests[api]),
  }), {})
);

export const configureRequests = ({ config, requests: reqs }) => {
  requests = reqs;
  init(config);
  initAsyncActions(requests);
  return createReducers(requests);
};

function* asyncActionWorker(action) {
  const { payload: { api, params } } = action;
  const { called, completed, failed } = asyncAction(api);
  yield put(called());
  try {
    const { url, requestHandler, responseHandler } = requests[api];
    let response = requestHandler && (yield call(requestHandler, url, params));
    if (!response) {
      const { data } = yield call(httpRequest, requests[api], params);
      response = responseHandler ? (yield call(responseHandler, params, data)) : data;
    }
    yield put(completed(response));
  } catch (error) {
    const err = extractErrorMessage(error);
    yield put(failed(err));
  }
}

export const dispatchRequest = (api, params) => ({
  type: DISPATCH_SAGA,
  payload: {
    api,
    params,
  },
});

export function* onRequestCompleted(action, worker) {
  yield takeEvery(completedAsyncAction(action), worker);
}

export function* onRequestFailed(action, worker) {
  yield takeEvery(failedAsyncAction(action), worker);
}

export function* onAllRequestsFailed(worker) {
  yield all(Object.keys(requests).map(api => onRequestFailed(api, worker)));
}

export function* requestsWatcher() {
  yield takeEvery(DISPATCH_SAGA, asyncActionWorker);
}

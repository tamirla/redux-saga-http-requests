# redux-saga-http-requests

simplify http requests execution in react-native applications, by encapuslating all common logic, using redux as state management, saga as middleware &amp; axios as http client.

see https://github.com/tamirla/redux-saga-http-requests-tester for a sample application that demonstrate usage.

## Code Example

**actions.js**

```js

import { dispatchRequest } from 'redux-saga-http-requests';

// define some actions that dispatch api requests
export const fetchTodos = () => dispatchRequest('todos');
export const fetchUser = id => dispatchRequest('users', { id });

```

**saga.js**

```js

import { requestsWatcher } from 'redux-saga-http-requests';

export function* rootSaga() {
  yield all([
    requestsWatcher(), // <-- add requestsWatcher, this will handle all requests
    // other sagas
  ]);
}

```

**App.js**

```js

import { Provider, connect } from 'react-redux';
import { configureRequests } from 'redux-saga-http-requests';
import { PersistGate } from 'redux-persist/integration/react';
import configureStore from './configureStore';
import { fetchTodos, fetchUser } from './actions';

// use configureRequests to define reducers for all apis 
const reducers = configureRequests({
  // config object used to define base url
  config: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
  // list of all api requests, each request must have url & store params, and may have some other optional params, see below
  requests: {
    todos: {
      url: 'todos',
      store: 'todos',
    },
    users: {
      url: 'users',
      store: 'users',
      urlBuilder: (url, { id }) => `${url}/${id}`,
    },
  },
});

const { store, persistor } = configureStore(reducers);

const App = ({ fetchTodos, fetchUser }) => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <View style={styles.container}>
        <Text style={styles.welcome}>Redux Saga Http Reuqests Tester</Text>
        <Button title="fetch Todos" onPress={fetchTodos} />
        <Button title="fetch user" onPress={() => fetchUser(1)} />
      </View>
    </PersistGate>
  </Provider>
);

const enhance = connect(
  null,
  {
    fetchTodos,
    fetchUser,
  },
);

export default enhance(App);

```

## Motivation

Implementing api requests in react-native application that uses redux involves many repetitive definitions of actions & reducers. The motivation behind this module is to eliminate all this repetitive code, allowing the developer to focus only in the meaningful definitions, ie. endpoints & their results mapped to store.

## Installation
```
yarn add redux-saga-http-requests
```
or 
```
npm install --save redux-saga-http-requests
```
## API Reference

* configureRequests(config, requests) - Accepts config object that defines baseURL, and requests object that defines all apis. Returns combined reducers that handle all api actions 

```js

import { configureRequests } from 'redux-saga-http-requests';

const reducers = configureRequests({
  config: {
    baseURL: 'https://jsonplaceholder.typicode.com',
  },
   requests: {
    getTodos: {
      url: 'todos',
      store: 'todos',
    },
    getUsers: {
      url: 'users',
      store: 'user',
      // construct get url with given parameter
      urlBuilder: (url, { id }) => `${url}/${id}`,
      // optional handlers for request\ersponse
      requestHandler: (url, params) => {
        if (params.id === 2) {
          console.log('returning local response');
          return {
            id: 2,
            name: 'localUser',
          };
        }
        console.log('going to call ', url, ' with params', params);
        return null;
      },
      responseHandler: (params, response) => {
        console.log('got response for params', params, '->', response);
        return {
          ...response,
          requestParams: params,
        };
      },
    },
    addPost: {
      url: 'posts',
      store: 'newPost',
      method: 'post',
    },
});

```

mandatory parameters for each request:

* url - the endpoint of this request
* store - the store element to which the response will be mapped

optional parameters for each request:

* method - http method, default is get
* urlBuilder - allows to define url for request dynamically, according to given parameters, as demonstrated above

* dispatchRequest - dispatches a specific api, for example:
```js
import { dispatchRequest } from 'redux-saga-http-requests';

export const fetchTodos = () => dispatchRequest('todos');
export const fetchUser = id => dispatchRequest('users', { id });

```

* requestsWatcher - returnrs the saga watcher that handles all api and should be added to rootSaga as demostrated above
* onRequestCompleted - callback that can be used to dispatch some actions once specific api completed successfully
* onRequestFailed - callback that can be used to dispatch some actions once specific api failed
* onAllRequestsFailed - callback that can be used to dispatch some actions once *any* api failed, can be used to show generic error message, etc.

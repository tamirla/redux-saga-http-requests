import { configureRequests } from '../src';

test('configure requests', () => {
  const reducers = configureRequests({
    config: {},
    requests: {
      login: {
        url: 'api/login',
        store: 'userCredentials',
      },
    },
  });
  expect(reducers).toHaveProperty('userCredentials');
});

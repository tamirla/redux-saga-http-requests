import {
  initAsyncActions,
  asyncAction,
  completedAsyncAction,
  failedAsyncAction,
} from '../src/asyncActions';

test('initialize async actions', () => {
  initAsyncActions({
    act1: {},
    act2: {},
  });
  const act1 = asyncAction('act1');
  expect(act1).toHaveProperty('called');
  expect(act1).toHaveProperty('completed');
  expect(act1).toHaveProperty('failed');
  expect(act1.called).toBeInstanceOf(Function);
  expect(act1.completed).toBeInstanceOf(Function);
  expect(act1.failed).toBeInstanceOf(Function);
  expect(completedAsyncAction('act1')).toBeInstanceOf(Function);
  expect(failedAsyncAction('act1')).toBeInstanceOf(Function);
});

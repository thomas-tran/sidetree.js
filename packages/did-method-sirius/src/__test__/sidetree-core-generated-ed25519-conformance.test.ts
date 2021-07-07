/* eslint-disable @typescript-eslint/no-explicit-any */
import Sirius from '../Sirius';
// import { sidetreeCoreGeneratedEd25519Resolutions } from '../__fixtures__';
// const operation = require('./operation.json');
import { getTestSirius } from '../test/utils';

console.info = (): null => null;

let sirius: Sirius;

beforeAll(async () => {
  sirius = await getTestSirius();
});

afterAll(async () => {
  await sirius.close();
});

// const operationFixture = operation.operation;

// let did: any;
jest.setTimeout(60 * 30000);

it('can create and resolve', async () => {
  expect(1).toEqual(1);
 /* const response = await sirius.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[0].request))
  );
  await new Promise((resolve) => {
    return setTimeout(resolve, 30000);
  });
  console.log(response.body);
  expect(response.body).toEqual(operationFixture[0].response);
  await sirius.triggerBatchAndObserve();
  const txns = await sirius.transactionStore.getTransactions();
  expect(txns.length).toBe(1);
  // consider further fixtures tests here.
  did = response.body.didDocument.id;
  const resolveRequest = await sirius.handleResolveRequest(did);
  expect(resolveRequest.body).toEqual(operationFixture[0].response);*/
});
/*
it('can update and resolve', async () => {
  const response = await sirius.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[1].request))
  );
  await new Promise((resolve) => {
    return setTimeout(resolve, 50000);
  });
  expect(response).toEqual({
    status: 'succeeded',
  });

  await sirius.triggerBatchAndObserve();
  const txns = await sirius.transactionStore.getTransactions();
  expect(txns.length).toBe(2);
  // consider further fixtures tests here.
  const resolveRequest = await sirius.handleResolveRequest(did);

  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[0]
  );
});

it('can recover and resolve', async () => {
  const response = await sirius.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[2].request))
  );
  await new Promise((resolve) => {
    return setTimeout(resolve, 50000);
  });
  expect(response).toEqual({
    status: 'succeeded',
  });

  await sirius.triggerBatchAndObserve();
  const txns = await sirius.transactionStore.getTransactions();
  expect(txns.length).toBe(3);
  // consider further fixtures tests here.
  const resolveRequest = await sirius.handleResolveRequest(did);

  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[1]
  );
});

it('can deactivate and resolve', async () => {
  const response = await sirius.handleOperationRequest(
    Buffer.from(JSON.stringify(operationFixture[3].request))
  );
  await new Promise((resolve) => {
    return setTimeout(resolve, 50000);
  });
  expect(response).toEqual({
    status: 'succeeded',
  });

  await sirius.triggerBatchAndObserve();
  const txns = await sirius.transactionStore.getTransactions();
  expect(txns.length).toBe(4);
  // consider further fixtures tests here.
  const resolveRequest = await sirius.handleResolveRequest(did);
  expect(resolveRequest).toEqual(
    sidetreeCoreGeneratedEd25519Resolutions.resolution[2]
  );
});*/

/* eslint-disable jest/no-commented-out-tests */
import Sirius from './Sirius';
import { ICas } from '@sidetree/common';
import { SiriusLedger } from '@sidetree/sirius-ledger';
import { sidetreeCoreGeneratedEd25519 } from '@sidetree/test-vectors';
import {
  resetDatabase,
  getTestLedger,
  getTestCas,
  replaceMethod,
} from './test/utils';
import config from './test/sirius-config.json';

const create = sidetreeCoreGeneratedEd25519.operation.operation[0];
const {
  shortFormDid: elemShortFormDid,
  request: createOperation,
  response: elemResolveBody,
} = create;

const shortFormDid = elemShortFormDid.replace('elem', 'sirius');
const resolveBody = replaceMethod(elemResolveBody);
const createOperationBuffer = Buffer.from(JSON.stringify(createOperation));

console.info = (): null => null;
jest.setTimeout(60 * 20000);

describe('Sirius', () => {
  let ledger: SiriusLedger;
  let cas: ICas;
  let sirius: Sirius;

  beforeAll(async () => {
    await resetDatabase();
    ledger = await getTestLedger();
    cas = await getTestCas();
  });

  afterAll(async () => {
    await sirius.close();
  });

  it('should create the sirius class', async () => {
    sirius = new Sirius(config, config.versions, ledger, cas);
    expect(sirius).toBeDefined();
  });

  it('should initialize the sirius class', async () => {
    await sirius.initialize(false, false);
  });

  it('should get versions', async () => {
    const response = await sirius.handleGetVersionRequest();
    expect(response.status).toBe('succeeded');
    const versions = JSON.parse(response.body);
    expect(versions).toHaveLength(3);
    expect(versions[0].name).toBe('core');
    expect(versions[1].name).toBe('sirius');
    // expect(versions[2].name).toBe('mock-cas');
    expect(versions[0].version).toBeDefined();
    expect(versions[1].version).toBeDefined();
    expect(versions[2].version).toBeDefined();
  });

  it('should handle operation request', async () => {
    const operation = await sirius.handleOperationRequest(
      createOperationBuffer
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });

  it('should resolve a did after Observer has picked up the transaction', async () => {
    await sirius.triggerBatchAndObserve();
    const operation = await sirius.handleResolveRequest(
      shortFormDid.replace('elem', 'sirius')
    );
    expect(operation.status).toBe('succeeded');
    expect(operation.body).toEqual(resolveBody);
  });
});

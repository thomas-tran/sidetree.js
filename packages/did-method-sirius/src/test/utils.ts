/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

import { MongoDb } from '@sidetree/db';

// import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { MockCas } from '@sidetree/cas';
import Sirius from '../Sirius';
import { SiriusDriver, SiriusLedger } from '@sidetree/sirius-ledger';
import { Account, NetworkType } from 'tsjs-xpx-chain-sdk';
import config from './sirius-config.json';

const writeFixture = (filename: string, object: never): void => {
  fs.writeFileSync(
    path.resolve(__dirname, '../__fixtures__/', filename),
    JSON.stringify(object, null, 2)
  );
};

const resetDatabase = async () => {
  await MongoDb.resetDatabase(
    config.mongoDbConnectionString,
    config.databaseName!
  );
};

const anchoringAccount = Account.generateNewAccount(NetworkType.TEST_NET);

const getTestLedger = async () => {
  const siriusDriver = new SiriusDriver(
    config.siriusChainGatewayUrl,
    config.siriusChainGatewayNetwork,
    config.providerAccountPrivateKey,
    anchoringAccount.publicKey
  );

  const ledger = new SiriusLedger(siriusDriver);

  return ledger;
};

const getTestCas = async () => {
  // FIXME: IPFS has intermittent failures in tests so we will use MockCas until it's fixed
  // See: https://github.com/transmute-industries/sidetree.js/runs/2178633982#step:8:178
  // const cas = new IpfsCasWithCache(
  //   config.contentAddressableStoreServiceUri,
  //   config.mongoDbConnectionString,
  //   config.databaseName
  // );
  const cas = new MockCas();
  return cas;
};

const getTestSirius = async () => {
  resetDatabase();
  const ledger = await getTestLedger();
  const cas = await getTestCas();

  const sirius = new Sirius(config, config.versions, ledger, cas);
  await sirius.initialize(false, false);
  return sirius;
};

const replaceMethod = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  result: any,
  defaultMethod = 'sidetree',
  specificMethod = 'sirius'
): any => {
  // prevent mutation
  const _result = JSON.parse(JSON.stringify(result));
  _result.didDocument.id = _result.didDocument.id.replace(
    specificMethod,
    defaultMethod
  );
  // upstream sidetree sets controller incorrectly.
  _result.didDocument.publicKey[0].controller = '';
  if (_result.didDocument.publicKey[1]) {
    _result.didDocument.publicKey[1].controller = '';
  }
  _result.didDocument['@context'][2]['@base'] = _result.didDocument[
    '@context'
  ][2]['@base'].replace(specificMethod, defaultMethod);
  return _result;
};

export {
  resetDatabase,
  getTestLedger,
  getTestCas,
  getTestSirius,
  replaceMethod,
  writeFixture,
};

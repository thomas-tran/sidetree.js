/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs';
import path from 'path';

import { MongoDb } from '@sidetree/db';

//import { IpfsCasWithCache } from '@sidetree/cas-ipfs';
import { MockCas } from '@sidetree/cas';
import Sirius from '../Sirius';
import { SiriusDriver, SiriusLedger } from '@sidetree/sirius-ledger';
import { Account, NetworkType } from 'tsjs-xpx-chain-sdk';
import config from './sirius-config.json';
import { methods } from '@sidetree/wallet';
import { Encoder } from '@sidetree/common';
import { PublicKeyPurpose } from '@sidetree/common';
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
console.log(anchoringAccount.privateKey);
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
  /*const cas = new IpfsCasWithCache(
    config.contentAddressableStoreServiceUri,
    config.mongoDbConnectionString,
    config.databaseName
  );*/
  const cas = new MockCas();
  return cas;
};

const getTestSirius = async () => {
  await resetDatabase();
  const ledger = await getTestLedger();
  const cas = await getTestCas();

  const sirius = new Sirius(config, config.versions, ledger, cas);
  await sirius.initialize(false, false);
  return sirius;
};

const replaceMethod = (
  result: JSON,
  defaultMethod = 'did:elem',
  specificMethod = 'did:sirius'
): JSON => {
  const stringified = JSON.stringify(result);
  const updatedStringified = stringified.replace(
    new RegExp(defaultMethod, 'g'),
    specificMethod
  );
  const updateResult = JSON.parse(updatedStringified);
  return updateResult;
};

export const generateCreateOperation = async (publicKey: any): Promise<any> => {
  // We could generate the create operation like this
  /*
  const mnemonic = crypto.mnemonic.mnemonic[0];
  const createOperation = await methods.getCreateOperationForProfile(
    mnemonic,
    i
  );
  */
  // However this is too slow because it generates new keys for every create
  // operation which cause the tests to timeout for batch size larger than 1000

  // Therefore for the purpose of showing the we can process large batches
  // we will generate create operation for did documents that share the same key
  const documentModel = {
    public_keys: [
      {
        // id is random so that each id (and therefore each did) is different
        // id needs to be base64url encoded
        id: Encoder.encode(Math.random().toString()),
        type: 'JsonWebKey2020',
        jwk: publicKey,
        purpose: [PublicKeyPurpose.General],
      },
    ],
  };
  const createOperation = await methods.getCreatePayloadFromDocumentModel(
    documentModel,
    publicKey,
    publicKey
  );
  return createOperation;
};

export {
  resetDatabase,
  getTestLedger,
  getTestCas,
  getTestSirius,
  replaceMethod,
  writeFixture,
};

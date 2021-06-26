import { SiriusLedger } from '../SiriusLedger';
import { SiriusDriver } from '../SiriusDriver';
import testSuite from './TestSuite';
import { Account, NetworkType } from 'tsjs-xpx-chain-sdk';
const siriusChainGatewayUrl = 'https://bctestnet2.brimstone.xpxsirius.io';
const siriusChainGatewayNetwork = NetworkType.TEST_NET;
const providerAccountPK =
  '44BAD12E749DF4260917418A581F84522DE21F2CE6C2A3C346B1111E65C05330';

const anchoringAccount = Account.generateNewAccount(NetworkType.TEST_NET);
console.log(`Anchoring private key ${anchoringAccount.privateKey}`);

const siriusDriver = new SiriusDriver(
  siriusChainGatewayUrl,
  siriusChainGatewayNetwork,
  providerAccountPK,
  anchoringAccount.publicAccount
);

const ledger = new SiriusLedger(siriusDriver);

testSuite(ledger);

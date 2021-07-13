import { NetworkType, Account } from 'tsjs-xpx-chain-sdk';
import { SiriusDriver } from './SiriusDriver';

jest.setTimeout(10 * 25000);

describe('SiriusDriver', () => {
  let driver: SiriusDriver;
  const siriusChainGatewayUrl = 'https://api-1.testnet2.xpxsirius.io';
  const siriusChainGatewayNetwork = NetworkType.TEST_NET;
  const providerAccountPK =
    '44BAD12E749DF4260917418A581F84522DE21F2CE6C2A3C346B1111E65C05330';
  const sender = Account.createFromPrivateKey(
    providerAccountPK,
    NetworkType.TEST_NET
  );
  const anchoringAccount = Account.generateNewAccount(NetworkType.TEST_NET);
  beforeAll(async () => {
    driver = new SiriusDriver(
      siriusChainGatewayUrl,
      siriusChainGatewayNetwork,
      providerAccountPK,
      anchoringAccount.publicKey
    );
  });
  it('should get current block', async () => {
    const currentBlock = await driver.getCurrentBlock();
    expect(currentBlock.height.lower).toBeDefined();
    expect(currentBlock.height.higher).toBeDefined();
  });

  it('should get block by height', async () => {
    const currentBlock = await driver.getBlockByHeight(1);
    expect(currentBlock.height.lower).toBeDefined();
    expect(currentBlock.height.higher).toBeDefined();
  });

  it('should announce transaction', async () => {
    const payload = 'Test message';
    const fee = 10;
    const signedTx = await driver.signAndAnnounceTransaction(
      payload,
      fee,
      sender,
      anchoringAccount.publicAccount
    );

    expect(signedTx).toBeDefined();
  });

});

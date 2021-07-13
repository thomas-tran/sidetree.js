import { SiriusDriver } from './SiriusDriver';
import {
  BlockchainTimeModel,
  IBlockchain,
  ServiceVersionModel,
  AnchoredDataSerializer,
  TransactionModel,
  ValueTimeLockModel,
} from '@sidetree/common';
import { AnchorPayload } from 'types';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../package.json');

export class SiriusLedger implements IBlockchain {
  private cachedBlockchainTime: BlockchainTimeModel = { hash: '', time: 0 };

  private driver: SiriusDriver;

  constructor(driver: SiriusDriver) {
    this.driver = driver;
  }

  public getServiceVersion: () => ServiceVersionModel = () => {
    return {
      name: 'sirius',
      version,
    };
  };

  public get approximateTime(): BlockchainTimeModel {
    return this.cachedBlockchainTime;
  }

  public async getLatestTime(): Promise<BlockchainTimeModel> {
    const block = await this.driver.getCurrentBlock();

    const blockchainTime: BlockchainTimeModel = {
      time: block.timestamp.compact(),
      hash: block.hash,
    };

    this.cachedBlockchainTime = blockchainTime;
    return blockchainTime;
  }

  public async initialize(): Promise<void> {
    // Refresh cached block time
    await this.getLatestTime();
  }

  public async write(anchorString: string, fee: number): Promise<void> {
    console.debug(`Anchor string ${anchorString}`);
    const {
      anchorFileHash,
      numberOfOperations,
    } = AnchoredDataSerializer.deserialize(anchorString);

    const noOfTxs = (await this.driver.getTransactionBlocks()).length;

    const payload: AnchorPayload = {
      hash: anchorFileHash,
      noOps: numberOfOperations,
      type: 'Anchor',
      txNumber: noOfTxs + 1, //noOfTxs === 0 ? 1 : noOfTxs + 1,
    };

    try {
      const tx = await this.driver.anchorTransaction(payload, fee);
      console.debug(
        `Sirius transaction successful: ${this.driver.providerUrl}/transaction/${tx.hash}`
      );
    } catch (err) {
      console.debug(`Error occured ${err.message}`);
    }
  }

  public async read(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    const ats = await this.driver.getTransactionBlocks(
      //sinceTransactionNumber! - 1,
      sinceTransactionNumber,
      transactionTimeHash
    );

    return {
      moreTransactions: false,
      transactions: ats.sort(
        (a, b) => a.transactionNumber - b.transactionNumber
      ),
    };
  }

  public async getFirstValidTransaction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return Promise.resolve(undefined);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async getFee(_transactionTime: number): Promise<number> {
    return Promise.resolve(0);
  }

  public async getValueTimeLock(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _lockIdentifier: string
  ): Promise<ValueTimeLockModel | undefined> {
    return Promise.resolve(undefined);
  }

  public async getWriterValueTimeLock(): Promise<
    ValueTimeLockModel | undefined
  > {
    return Promise.resolve(undefined);
  }
}

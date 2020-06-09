import BlockchainTimeModel from '@sidetree/common/src/models/BlockchainTimeModel';
import IBlockchain from '@sidetree/common/src/interfaces/IBlockchain';
import TransactionModel from '@sidetree/common/src/models/TransactionModel';
import ValueTimeLockModel from '@sidetree/common/src/models/ValueTimeLockModel';

/**
 * Mock Blockchain class for testing.
 */
export default class MockBlockchain implements IBlockchain {
  /** Stores each hash given in write() method. */
  hashes: [string][] = [];

  public async write(anchorString: string): Promise<void> {
    this.hashes.push([anchorString]);
  }

  public async read(
    sinceTransactionNumber?: number,
    _transactionTimeHash?: string
  ): Promise<{ moreTransactions: boolean; transactions: TransactionModel[] }> {
    if (sinceTransactionNumber === undefined) {
      sinceTransactionNumber = -1;
    }

    let moreTransactions = false;
    if (
      this.hashes.length > 0 &&
      sinceTransactionNumber < this.hashes.length - 2
    ) {
      moreTransactions = true;
    }

    const transactions: TransactionModel[] = [];
    if (
      this.hashes.length > 0 &&
      sinceTransactionNumber < this.hashes.length - 1
    ) {
      const hashIndex = sinceTransactionNumber + 1;
      const transaction = {
        transactionNumber: hashIndex,
        transactionTime: hashIndex,
        transactionTimeHash: this.hashes[hashIndex][0],
        anchorString: this.hashes[hashIndex][0],
        writer: 'writer',
      };
      transactions.push(transaction);
    }

    return {
      moreTransactions: moreTransactions,
      transactions: transactions,
    };
  }

  public async getFirstValidTransaction(
    _transactions: TransactionModel[]
  ): Promise<TransactionModel | undefined> {
    return undefined;
  }

  private latestTime?: BlockchainTimeModel = {
    time: 500000,
    hash: 'dummyHash',
  };

  public get approximateTime(): BlockchainTimeModel {
    return this.latestTime!;
  }
  /**
   * Hardcodes the latest time to be returned.
   */
  public setLatestTime(time: BlockchainTimeModel) {
    this.latestTime = time;
  }

  public async getValueTimeLock(
    _lockIdentifer: string
  ): Promise<ValueTimeLockModel | undefined> {
    throw Error('Not implemented.');
  }

  public async getWriterValueTimeLock(): Promise<
    ValueTimeLockModel | undefined
  > {
    throw Error('Not implemented.');
  }
}

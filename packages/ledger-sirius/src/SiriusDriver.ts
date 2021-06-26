import {
  BlockHttp,
  BlockInfo,
  ChainHttp,
  SignedTransaction,
  Account,
  PlainMessage,
  TransferTransactionBuilder,
  Deadline,
  FeeCalculationStrategy,
  Mosaic,
  MosaicId,
  UInt64,
  TransactionHttp,
  TransferTransaction,
  AccountHttp,
  TransactionType,
  Transaction,
  MessageType,
  PublicAccount,
} from 'tsjs-xpx-chain-sdk';

import { concatMap, filter, toArray, mergeAll, map } from 'rxjs/operators';

import { AnchoredDataSerializer, TransactionModel } from '@sidetree/common';
import { SiriusOptions, AnchorPayload, AnchorTransaction } from './types';

export class SiriusDriver {
  private blockHttp: BlockHttp;
  private chainHttp: ChainHttp;
  private transactionHttp: TransactionHttp;
  private accountHttp: AccountHttp;
  private options: SiriusOptions;
  private providerAccount: Account;

  constructor(
    public providerUrl: string,
    public networkType: number,
    public accountPrivateKey: string,
    public recipientPublicAccount: PublicAccount,
    options?: SiriusOptions
  ) {
    this.blockHttp = new BlockHttp(providerUrl);
    this.chainHttp = new ChainHttp(providerUrl);
    this.accountHttp = new AccountHttp(providerUrl);
    this.transactionHttp = new TransactionHttp(providerUrl);
    this.providerAccount = Account.createFromPrivateKey(
      accountPrivateKey,
      networkType
    );
    this.options = options || {
      mosaicHex: '13bfc518e40549d7',
      feeCalculationStrategy: FeeCalculationStrategy.ZeroFeeCalculationStrategy,
    };
    this.recipientPublicAccount = recipientPublicAccount;
  }

  public getProviderAccount(): Account {
    return this.providerAccount;
  }

  public async getCurrentBlock(): Promise<BlockInfo> {
    const currentHeight = await this.chainHttp
      .getBlockchainHeight()
      .toPromise();

    const currentBlock = await this.blockHttp
      .getBlockByHeight(currentHeight.compact())
      .toPromise();
    return currentBlock;
  }

  public async getBlockByHeight(height: number): Promise<BlockInfo> {
    return new Promise((resolve, reject) => {
      this.blockHttp.getBlockByHeight(height).subscribe(
        (bi) => resolve(bi),
        (err) => reject(err)
      );
    });
  }

  public async anchorTransaction(
    payload: AnchorPayload,
    fee: number
  ): Promise<SignedTransaction> {
    return this.signAndAnnounceTransaction(
      JSON.stringify(payload),
      fee,
      this.providerAccount,
      this.recipientPublicAccount
    );
  }

  public async signAndAnnounceTransaction(
    payload: string,
    fee: number,
    sender: Account,
    recipient: PublicAccount
  ): Promise<SignedTransaction> {
    if (!sender) {
      throw new Error('The sender is required');
    }

    if (!payload) {
      throw new Error('The payload is required');
    }

    const nemesisBlock = await this.blockHttp.getBlockByHeight(1).toPromise();

    const generationHash = nemesisBlock.generationHash;

    const networkType = nemesisBlock.networkType;

    const message = PlainMessage.create(payload);

    const builder = new TransferTransactionBuilder()
      .deadline(Deadline.create())
      .generationHash(generationHash)
      .message(message)
      .networkType(networkType)
      .recipient(recipient.address)
      .feeCalculationStrategy(this.options.feeCalculationStrategy);

    if (fee > 0) {
      builder.mosaics([
        new Mosaic(new MosaicId(this.options.mosaicHex), UInt64.fromUint(fee)),
      ]);
    }

    const tx = builder.build();

    const signedTx = sender.sign(tx, generationHash);

    await this.transactionHttp.announce(signedTx).toPromise();

    return signedTx;
  }

  public async getTransactions(): Promise<TransferTransaction[]> {
    return new Promise((resolve, reject) => {
      this.accountHttp.transactions(this.recipientPublicAccount).subscribe(
        (txs) =>
          resolve(
            txs.filter(
              (t) => t.type === TransactionType.TRANSFER
            ) as TransferTransaction[]
          ),
        (err) => reject(err)
      );
    });
  }

  public async getTransactionBlocks(
    sinceTransactionNumber?: number,
    transactionTimeHash?: string
  ): Promise<TransactionModel[]> {
    const obTxs = this.accountHttp.transactions(this.recipientPublicAccount);

    const obATxs = obTxs.pipe(
      mergeAll(),
      filter(
        (txs) =>
          txs.type === TransactionType.TRANSFER &&
          (txs as TransferTransaction).message.type ===
            MessageType.PlainMessage &&
          this.safeJsonParse((txs as TransferTransaction).message.payload) &&
          (JSON.parse(
            (txs as TransferTransaction).message.payload
          ) as AnchorPayload).type === 'Anchor'
      ),
      concatMap((t) => {
        return (
          this.blockHttp
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .getBlockByHeight(t.transactionInfo!.height.compact())
            .pipe(
              map((b) => {
                const payload: AnchorPayload = JSON.parse(
                  (t as TransferTransaction).message.payload
                );
                const txNumber = payload.txNumber;
                const anchoredData = {
                  anchorFileHash: payload.hash,
                  numberOfOperations: payload.noOps,
                };
                const anchorString = AnchoredDataSerializer.serialize(
                  anchoredData
                );

                const tm: TransactionModel = {
                  transactionNumber: txNumber,
                  transactionTime: b.timestamp.compact(),
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  transactionHash: t.transactionInfo?.hash as string,
                  transactionTimeHash: b.hash,
                  anchorString,
                  transactionFeePaid: 0,
                  normalizedTransactionFee: 0,
                  writer: 'writer',
                };
                console.debug(`getTransactionBlocks ${JSON.stringify(tm)}`);
                return tm;
              })
            )
        );
      })
    );
    // if(sinceTransactionNumber) does not work because 0 evaluates to false
    // but 0 is a valid value of sinceTransactionNumber...
    if (sinceTransactionNumber !== undefined) {
      return obATxs
        .pipe(
          filter((t) => t.transactionNumber >= sinceTransactionNumber),
          toArray()
        )
        .toPromise();
    } else if (transactionTimeHash) {
      return obATxs
        .pipe(
          filter((t) => t.transactionTimeHash === transactionTimeHash),
          toArray()
        )
        .toPromise();
    } else {
      return obATxs.pipe(toArray()).toPromise();
    }
  }

  public async getAnchorTransaction(
    transaction: Transaction
  ): Promise<AnchorTransaction> {
    return new Promise((resolve, reject) => {
      this.blockHttp
        .getBlockByHeight(transaction.transactionInfo!.height.compact())
        .subscribe(
          (bi) => {
            const at: AnchorTransaction = {
              transferTransaction: transaction as TransferTransaction,
              block: bi,
            };
            resolve(at);
          },
          (err) => reject(err)
        );
    });
  }

  public async getAnchorTransactions(): Promise<TransactionModel[]> {
    const transferTxs = await this.getTransactions();
    const atxs: TransactionModel[] = [];
    transferTxs.forEach(async (t) => {
      const bl = await this.getBlockByHeight(
        t.transactionInfo!.height.compact()
      );
      const payload: AnchorPayload = JSON.parse(t.message.payload);
      const anchoredData = {
        anchorFileHash: payload.hash,
        numberOfOperations: payload.noOps,
      };
      const anchorString = AnchoredDataSerializer.serialize(anchoredData);

      const tm: TransactionModel = {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transactionNumber: payload.txNumber,
        transactionTime: bl.timestamp.compact(),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        transactionHash: t.transactionInfo?.hash as string,
        transactionTimeHash: bl.hash,
        anchorString,
        transactionFeePaid: 0,
        normalizedTransactionFee: 0,
        writer: 'writer',
      };
      atxs.push(tm);
    });

    return atxs;
  }

  private safeJsonParse(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}

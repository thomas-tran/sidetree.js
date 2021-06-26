import {
  BlockInfo,
  FeeCalculationStrategy,
  TransferTransaction,
} from 'tsjs-xpx-chain-sdk';

export interface SiriusOptions {
  mosaicHex: string;
  feeCalculationStrategy: FeeCalculationStrategy;
}

export interface AnchorPayload {
  type: string;
  hash: string;
  noOps: number;
  txNumber: number;
}

export interface AnchorTransaction {
  transferTransaction: TransferTransaction;
  block: BlockInfo;
}

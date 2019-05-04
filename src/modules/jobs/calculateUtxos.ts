import { UtxosDb } from './../../models/utxos';
import { TransactionOutput } from './../../models/transaction';
import logger from '../../services/logger';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';
import { BlockDb, Block } from '../../models/block';
import { getFullBlock } from '../../domain/block';
import { address } from '../../models/common';

class CalculateUtxosJob {

  static batchCount: number = 2000;

  private lastSafeHeight: number = -1;
  private blocksStream: NodeJS.ReadableStream;
  private currentHeight: number = 0;
  private topHeight: number = -1;
  private currentUtxos: Record<address, UtxosDb> = {};
  // private currentTxsOutputs: Record<string, TransactionOutput[]> = {};

  async run() {

    while (true) {

      try {

        this.lastSafeHeight = await levelDb.getLastUtxosHeight().catch(() => -1);
        this.currentHeight = this.lastSafeHeight + 1;

        await this.startProcessingUtxos();

      } catch (e) {

        logger.error(`Error processing utxos: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async startProcessingUtxos() {

    while (true) {

      try {

        this.topHeight = await levelDb.getLastBlockHeight().catch(() => -1);

        while (this.currentHeight <= this.topHeight) {

          await this.processUtxos(this.currentHeight, Math.min(this.topHeight + 1, this.currentHeight + CalculateUtxosJob.batchCount));

        }

        logger.debug(`Waiting ${config.jobs.blockTime} secs until next check`);
        await sleep(1000 * config.jobs.blockTime + 1);

      } catch (e) {

        logger.error(`Error processing utxos: ${e}`);
        logger.info(`Retrying in ${config.jobs.blockTime} sec...`);
        await sleep(1000 * config.jobs.blockTime);

      }

    }

  }

  async processUtxos(fromBlock: number, toBlock: number) {

    return new Promise(async (resolve, reject) => {

      if (this.blocksStream) {

        reject(new Error('Processing utxos process already in course'));

      } else {

        let currentHeight: number = fromBlock;
        let promiseQueue: Promise<any> = Promise.resolve();

        const errorFn = async (e: Error) => {

          try {

            this.removeBlocksStream();
            await promiseQueue;
            await this.saveBatchUtxos(currentHeight - 1);

          } finally {

            reject(e);

          }

        };

        // logger.info(`Processing utxos from [${fromBlock}] to [${toBlock}]`);

        this.blocksStream = (await levelDb.subscribeToBlocks({
          keys: true,
          values: true,
          gte: fromBlock,
          lt: toBlock
        }))
          .on('data', ({ key, value: blockDb }) => {

            promiseQueue = promiseQueue
              .then(() => new Promise(async (res, rej) => {

                try {

                  const k: number = parseInt(key);

                  if (k > currentHeight) {
                    throw (new Error('Non sequential block found'));
                  }

                  await this.processBlock(blockDb);

                  currentHeight++;

                  res();

                } catch (e) {

                  errorFn(e);
                  rej(e);

                }

              }));

          })
          .on('error', errorFn)
          .on('end', async () => {

            try {

              this.removeBlocksStream();
              await promiseQueue;
              await this.saveBatchUtxos(currentHeight - 1);
              resolve();

            } catch (e) {

              reject(e);

            }

          });
      }

    });

  }

  private removeBlocksStream() {

    if (this.blocksStream) {

      this.blocksStream.removeAllListeners();
      this.blocksStream = undefined as any;

    }

  }

  private async saveBatchUtxos(bestHeight: number) {

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New utxos best height: [${bestHeight}]`);

      await levelDb.putLastUtxosHeight(bestHeight);
      await levelDb.putBatchUtxos(this.currentUtxos);

      // TODO: Think a better way to improve performance
      this.currentUtxos = {};
      // this.currentTxsOutputs = {};

      this.lastSafeHeight = bestHeight;
      this.currentHeight = bestHeight + 1;

    }

  }

  private async processBlock(blockDb: BlockDb): Promise<any> {

    const block: Block = await getFullBlock(blockDb);

    for (let tx of block.transactions) {

      // const txAlias: string = `${tx.blockHeight}:${tx.hash.substr(0, 10)}`;
      // logger.debug(`--------> Processing tx: ${txAlias} | outputs:(${tx.outputs.length}) | inputs:(${tx.inputs.length})`);

      for (let i = 0; i < tx.outputs.length; i++) {

        const output = tx.outputs[i];
        const utxos = await this.getUtxos(output.address);

        utxos.push({
          fromHash: tx.hash,
          fromIndex: i,
          value: output.na,
          lockTime: output.lockTime
        });

      }

      for (let input of tx.inputs) {

        const txOutputs = await this.getTransactionOutputs(input.fromHash);
        const output = txOutputs[input.fromIndex];
        const utxos = await this.getUtxos(output.address);

        const i = utxos.findIndex((utxo) => utxo.fromHash === input.fromHash && utxo.fromIndex === input.fromIndex);

        if (i >= 0) {

          utxos.splice(i, 1);

        }

      }

    }

  }

  private async getUtxos(address: address): Promise<UtxosDb> {

    if (!this.currentUtxos[address]) {

      try {

        this.currentUtxos[address] = await levelDb.getUtxos(address);

      } catch (e) {

        this.currentUtxos[address] = [];

      }

    }

    return this.currentUtxos[address];

  }

  private async getTransactionOutputs(txHash: string): Promise<TransactionOutput[]> {

    return (await levelDb.getTransaction(txHash)).outputs;

    // if (!this.currentTxsOutputs[txHash]) {

    //   const tx = await levelDb.getTransaction(txHash);
    //   this.currentTxsOutputs[txHash] = tx.outputs;

    // }

    // return this.currentTxsOutputs[txHash];

  }
}

function run() {

  const job: CalculateUtxosJob = new CalculateUtxosJob();
  job.run();

}

export default run;

if (require.main === module) {

  (logger as any) = logger.child({
    pid: 'calculate-utxos'
  });

  run();

}

import { UtxosDb } from './../../models/utxos';
import { Transaction, TransactionDb } from './../../models/transaction';
import log from '../../services/logger';
import * as levelDb from '../../db/level';
import config from '../../services/config';
import { sleep } from './utils';
import { BlockDb, Block } from '../../models/block';
import { getFullBlock } from '../../domain/block';
import { address } from '../../models/common';

const logger = log.child({
  pid: 'calculate-utxos'
});

class CalculateUtxosJob {

  static batchCount: number = 5000;

  private lastSafeHeight: number = -1;
  private blocksStream: NodeJS.ReadableStream;
  private currentHeight: number = 0;
  private topHeight: number = -1;
  private currentUtxos: Record<address, UtxosDb> = {};
  private currentTxs: Record<string, Transaction> = {};

  async run() {

    // await levelDb.putLastUtxosHeight(-1);

    this.lastSafeHeight = await levelDb.getLastUtxosHeight().catch(() => -1);
    this.currentHeight = this.lastSafeHeight + 1;

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

          this.removeBlocksStream();
          await promiseQueue;
          await this.saveBatchBlocks(currentHeight - 1);
          reject(e);

        };

        logger.info(`Processing utxos from [${fromBlock}] to [${toBlock}]`);

        this.blocksStream = (await levelDb.subscribeToBlocks({
          keys: true,
          values: true,
          gte: fromBlock,
          lt: toBlock
        }))
          .on('data', ({ key, value: blockDb }) => {

            promiseQueue = promiseQueue.then(() => new Promise(async (res, rej) => {

              try {

                const k: number = parseInt(key);

                // logger.debug(` -------> ${k}`);

                if (k > currentHeight) {
                  throw (new Error('Non sequential block found'));
                }

                await this.processBlock(blockDb);

                currentHeight++;

                res();

              } catch (e) {

                rej(e);
                errorFn(e);

              }

            }));

          })
          .on('error', errorFn)
          .on('end', async () => {

            this.removeBlocksStream();
            await promiseQueue;
            await this.saveBatchBlocks(currentHeight - 1);
            resolve();

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

  private async saveBatchBlocks(bestHeight: number) {

    if (bestHeight > this.lastSafeHeight) {

      logger.info(`New utxos best height: [${bestHeight}]`);

      await levelDb.putLastUtxosHeight(bestHeight);
      await levelDb.putBatchUtxos(this.currentUtxos);

      // TODO: Think a better way to improve performance
      this.currentUtxos = {};
      // this.currentTxs = {};

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

        const outputTx = await this.getTransaction(input.fromHash);

        const output = outputTx.outputs[input.fromIndex];

        const utxos = await this.getUtxos(output.address);

        const i = utxos.findIndex((utxo) => utxo.fromHash === input.fromHash && utxo.fromIndex === input.fromIndex);

        if (i >= 0) {

          // this.currentUtxos[output.address].splice(i, 1);
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

  private async getTransaction(txHash: string): Promise<TransactionDb> {

    if (!this.currentTxs[txHash]) {

      this.currentTxs[txHash] = await levelDb.getTransaction(txHash);

    }

    return this.currentTxs[txHash];

  }
}

function run() {

  const job: CalculateUtxosJob = new CalculateUtxosJob();
  job.run();

}

export default run;

if (require.main === module) {
  run();
}

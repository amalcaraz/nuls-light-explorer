import { address } from './../../models/common';
import logger from '../../services/logger';
import * as levelDb from '../../db/level';
import { MessageType } from '.';
import { checkConsecutiveBlockHashes } from './utils';
import { BlockDb, UtxosDb, TransactionOutput, Block } from '../../models';
import { parseBlock, splitBlock, getFullBlockByHeight } from '../../domain/block';
import { fetchBlock } from '../../domain/blockBytes';
import { checkVersion } from '../../domain/utils';

class RollbackJob {

  private blockBytesFlag: boolean;
  private lastUtxosHeight: number;
  private currentUtxos: Record<address, UtxosDb> = {};

  async run(blockHeight?: string) {

    try {

      this.blockBytesFlag = await checkVersion();
      this.lastUtxosHeight = await levelDb.getLastUtxosHeight();

      if (!blockHeight || !Number.isInteger(parseInt(blockHeight))) {

        blockHeight = await this.checkBlocksHashes();

      }

      if (blockHeight) {

        logger.info(`Starting rollback from block [${blockHeight}]`);
        await this.rollbackBlocks(parseInt(blockHeight));

      }

      this.finishRollback();

    } catch (e) {

      logger.error(`Error doing rollback: ${e}`);

    }

  }

  private async rollbackBlocks(blockHeight: number) {

    let currentBlock: Block | BlockDb = await levelDb.getBlock(blockHeight);
    let prevBlock: Block = await getFullBlockByHeight(blockHeight - 1);

    while (prevBlock.hash !== currentBlock.preHash) {

      await this.rollbackBlock(prevBlock);

      const blockBytes = await fetchBlock(prevBlock.height, this.blockBytesFlag);
      const newBlock = await parseBlock(blockBytes);

      if (newBlock.hash !== currentBlock.preHash) {
        throw new Error(`The new block hash after the rollback of height [${newBlock.height}] is wrong`);
      }

      await this.saveBlock(newBlock);

      currentBlock = newBlock;
      prevBlock = await getFullBlockByHeight(prevBlock.height - 1);

    }

  }

  private async rollbackBlock(block: Block) {

    logger.debug(`Rollback block [${block.height}]`);

    // The order here is important to don't delete transactions
    // from the same block that appears as inputs
    await this.rollbackUtxos(block);
    await this.deleteBlock(block);

  }

  private async checkBlocksHashes(): Promise<string | undefined> {

    try {

      const topHeight = await levelDb.getLastBlockHeight().catch(() => -1);
      return await checkConsecutiveBlockHashes(0, topHeight + 1);

    } catch (e) {

      logger.error(`Error processing rollback: ${e}`);

    }

  }

  private async saveBlock(block: Block) {

    logger.debug(`Rollback save block [${block.height}]`);

    const { block: blockDb, transactions } = splitBlock(block);

    await Promise.all([
      levelDb.putBlock(blockDb),
      levelDb.putBatchTransactions(transactions)
    ]);

  }

  private async deleteBlock(block: Block) {

    logger.debug(`Rollback delete block [${block.height}]`);

    await Promise.all([
      levelDb.deleteBatchTransactions(block.transactions.map((tx) => tx.hash)),
      levelDb.deleteBlock(block as BlockDb),
      levelDb.deleteBlockBytes(block.height)
    ]);

  }


  /*** 
   * Undo the utxo changes done with the old block, and set 
   * the utxo job offset one block before this one to reprocess 
   * the new block at this height
   * */
  private async rollbackUtxos(block: Block) {

    // Only undo the utxo changes in the old block if we processed it before
    if (this.lastUtxosHeight < block.height) {
      return;
    }

    logger.debug(`Rollback uxtos block [${block.height}]`);

    for (let tx of block.transactions) {

      for (let i = 0; i < tx.outputs.length; i++) {

        const output = tx.outputs[i];
        const utxos = await this.getUtxos(output.address);

        const deleteIndex = utxos.findIndex((utxo) => utxo.fromHash === tx.hash && utxo.fromIndex === i);

        if (deleteIndex >= 0) {

          utxos.splice(deleteIndex, 1);

        }

      }

      for (let input of tx.inputs) {

        const txOutputs = await this.getTransactionOutputs(input.fromHash);
        const output = txOutputs[input.fromIndex];
        const utxos = await this.getUtxos(output.address);

        utxos.push({
          fromHash: input.fromHash,
          fromIndex: input.fromIndex,
          value: output.na,
          lockTime: output.lockTime
        });

      }

    }

    await this.saveUtxos(block.height - 1);

  }

  private async saveUtxos(bestHeight: number) {

    await Promise.all([
      levelDb.putLastUtxosHeight(bestHeight),
      levelDb.putBatchUtxos(this.currentUtxos)
    ]);

    this.currentUtxos = {};
    this.lastUtxosHeight = bestHeight;

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

  }

  private finishRollback() {

    logger.info(`Rollback completed`);

    if (process.send) {
      process.send({ type: MessageType.ROLLBACK_COMPLETED });
    }
  }

}

function run(blockHeight: string) {

  const job: RollbackJob = new RollbackJob();
  job.run(blockHeight);

}

export default run;

if (require.main === module) {

  (logger as any) = logger.child({
    pid: 'rollback'
  });

  //
  const blockHeight = process.argv[2];
  run(blockHeight);

}

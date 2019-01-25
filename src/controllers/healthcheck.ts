import { NextFunction, Request, Response } from 'express';
import * as nulsService from '../services/nuls';
import config from '../services/config';
import * as db from '../services/db';
import { error } from '../utils/error';

export async function healthCheckController(req: Request, res: Response, next: NextFunction) {

  let isNulsAlive: boolean = false;
  let isMongoAlive: boolean = false;
  let allOk: boolean = false;

  try {

    isNulsAlive = !!await nulsService.getLastHeight();
    isMongoAlive = !!await db.getClient();

    if (isNulsAlive && isMongoAlive) {

      allOk = true;

    }

  } catch (e) {

    throw error(e);

  }

  if (allOk) {

    res
      .status(200)
      .json({
        app: config.application,
        success: true,
      });

  } else {

    res
      .status(500)
      .json({
        success: false,
      });

    process.exit();

  }

}

import * as chalk from 'chalk';

import { Driver } from './Driver';

console.log(chalk.cyan('Starting server...'));

const driver: Driver = new Driver();
driver.main();


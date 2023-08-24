#! /usr/bin/env node
import fs from 'fs';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

function nmCleaner() {
  fs.readdir('./', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    const paths = [];

    for (let i = 0; i < stdout.length; i++) {
      const stat = fs.statSync('./' + stdout[i]);
      if (stat.isDirectory()) {
        const diretorios = fs.readdirSync(`./${stdout[i]}`);
        paths.push(
          `./${stdout[i]}/${diretorios.filter(
            (item) => item === 'node_modules'
          )}`
        );
      }
    }
    const pathsThatHaveNodeModules = paths.filter((path) =>
      path.includes('node_modules')
    );

    if (pathsThatHaveNodeModules.length == 0) {
      console.log(chalk.red('No node_modules found'));
    }

    const bar = new cliProgress.SingleBar({
      format:
        'CLI Progress |' +
        chalk.cyan('{bar}') +
        '| {percentage}% || {value}/{total} Chunks || Speed: {speed}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    bar.start(pathsThatHaveNodeModules.length, 0);
    for (let i = 0; i < pathsThatHaveNodeModules.length; i++) {
      fs.rm(
        pathsThatHaveNodeModules[i],
        { recursive: true, force: true },
        (err, stdout, stderr) => {
          if (err) {
            console.log(chalk.red(err.message));
            bar.stop();
          }
        }
      );
      bar.increment();
      bar.update();
    }
    bar.stop();
    console.log('\n node_modules deleted successfully');
  });
}

nmCleaner();

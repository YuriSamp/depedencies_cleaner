#! /usr/bin/env node
import fs from 'fs';
import cliProgress from 'cli-progress';
import chalk from 'chalk';

const filterHiddenFiles = (arr) =>
  arr.filter((item) => !/(^|\/)\.[^\/\.]/g.test(item));

const recursive = (dir, pathsThatWeHaveSeen) => {
  if (pathsThatWeHaveSeen.includes(dir)) {
    return;
  }

  try {
    const Allfiles = fs.readdirSync(dir);
    if (Allfiles.length === 0) {
      return '';
    }

    pathsThatWeHaveSeen.push(dir);
    const files = filterHiddenFiles(Allfiles);

    const paths = [];
    for (let i = 0; i < files.length; i++) {
      const stat = fs.statSync(`./${dir}/${files[i]}`);
      if (stat.isDirectory()) {
        if (files[i] === 'node_modules') {
          paths.push(`${dir}/node_modules`);
          continue;
        }
        paths.push(recursive(`${dir}/${files[i]}`, pathsThatWeHaveSeen));
      }
    }
    return paths.toString();
  } catch (error) {
    console.log(error);
  }
};

const cleaner = () => {
  fs.readdir('./', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    const files = filterHiddenFiles(stdout);

    const paths = [];
    const pathsThatWeHaveSeen = [];

    for (let i = 0; i < files.length; i++) {
      const stat = fs.statSync(`./${files[i]}`);
      if (stat.isDirectory()) {
        if (files[i] === 'node_modules') {
          paths.push('node_modules');
          continue;
        }
        paths.push(recursive(`${files[i].toString()}`, pathsThatWeHaveSeen));
      }
    }

    if (paths.length == 0) {
      console.log(chalk.red('No node_modules found'));
      return;
    }

    const cleanerPaths = paths.map((item) => item.replaceAll(',', '').trim());
    const bar = new cliProgress.SingleBar({
      format:
        'CLI Progress |' +
        chalk.cyan('{bar}') +
        '| {percentage}% || {value}/{total} Chunks',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true,
    });

    bar.start(cleanerPaths.length, 0);
    for (let i = 0; i < cleanerPaths.length; i++) {
      try {
        fs.rmSync(cleanerPaths[i], { recursive: true, force: true });
        bar.increment();
        bar.update();
      } catch (error) {
        console.log(error);
        bar.stop();
      }
    }
    bar.stop();
    console.log('\n node_modules deleted successfully');
    return;
  });
};

cleaner();

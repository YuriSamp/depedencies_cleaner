#! /usr/bin/env node
import fs from 'fs';

function nmCleaner() {
  fs.readdir('./', (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }

    for (let i = 0; i < stdout.length; i++) {
      const stat = fs.statSync('./' + stdout[i]);
      if (stat.isDirectory()) {
        fs.readdir(`./${stdout[i]}`, (err, stdoutChildren, stderr) => {
          if (err) {
            console.log(err);
            return;
          }

          if (stdoutChildren.includes('node_modules')) {
            fs.rm(
              `./${stdout[i]}/node_modules`,
              { recursive: true, force: true },
              (err, stdout, stderr) => {
                if (err) {
                  console.log(err);
                }
              }
            );
          }
        });
      }

      if (stdout[i] === 'node_modules') {
        fs.rm(
          './node_modules',
          { recursive: true, force: true },
          (err, stdout, stderr) => {
            if (err) {
              console.log(err);
            }
          }
        );
      }
    }
  });
}

nmCleaner();

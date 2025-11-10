import { exec } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

const successMessages = [
	'No linting errors found!',
	'Code looking squeaky clean!',
	'Flawless victory! No lint detected.',
	'Your code is pristine! ✨',
	'Zero issues. You\'re on fire! 🔥',
	'Lint-free zone achieved!',
	'Perfect score! No warnings, no errors.',
	'Clean as a whistle! 🎵',
	'Not a single bubble out of place!',
	'Immaculate code detected! 👌'
];

function getRandomSuccessMessage() {
    return successMessages[Math.floor(Math.random() * successMessages.length)];
}

try {
    const { stdout, stderr } = await execAsync('eslint . --ext .ts');

    if (stdout) {
        console.log(stdout);
    }

    console.log(`\n${chalk.bold.magenta('✓ ')} ${chalk.bold.green(getRandomSuccessMessage())}\n`);
	process.exit(0);
} catch (error) {
    if (error.stdout) {
        console.log(error.stdout);
    }
    if (error.stderr) {
        console.error(error.stderr);
    }
    process.exit(1);
}
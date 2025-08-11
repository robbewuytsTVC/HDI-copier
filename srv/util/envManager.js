const { execSync } = require('child_process');

function switchToEnv(org, space){
    try {
        console.log(`Targeting org: ${org}, space: ${space}`);
        execSync(`cf target -o ${org} -s ${space}`, { stdio: 'inherit' });
    } catch (err) {
        console.error(`Switch to org=${org}, space=${space} failed`);
        throw err;
    }
}

module.exports = { switchToEnv };

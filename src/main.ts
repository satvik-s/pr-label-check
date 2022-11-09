import * as core from '@actions/core';
import * as github from '@actions/github';

function run(): void {
    try {
        const { eventName } = github.context;
        core.info(`Event name: ${eventName}`);

        if (eventName !== 'pull_request') {
            core.setFailed(`Invalid event: ${eventName}`);
            return;
        }

        const pullRequestLabels: string[] =
            github.context.payload.pull_request?.labels?.map(
                (label: Record<string, unknown>) => label.name,
            );
        core.info(`PR title: ${pullRequestLabels}`);

        if (!pullRequestLabels || pullRequestLabels.length === 0) {
            core.setFailed('Pull Request labels not defined');
            return;
        }

        const inputLabels = core
            .getInput('labels', { required: true })
            .split(',');
        const inputType = core.getInput('type', { required: true });

        if (inputType === 'all_of') {
            const shouldPass = inputLabels.every((label) =>
                pullRequestLabels.includes(label),
            );

            if (!shouldPass) {
                core.setFailed('PR does not contain all the input labels');
            }
        }

        if (inputType === 'any_of') {
            const shouldPass = inputLabels.some((label) =>
                pullRequestLabels.includes(label),
            );

            if (!shouldPass) {
                core.setFailed('PR does not contain any of the input labels');
            }
        }

        if (inputType === 'one_of') {
            const labelsContained = inputLabels.filter((label) =>
                pullRequestLabels.includes(label),
            ).length;
            const shouldPass = labelsContained === 1;

            if (!shouldPass) {
                core.setFailed(
                    `PR contains ${labelsContained} labels from the input labels`,
                );
            }
        }

        if (inputType === 'none_of') {
            const shouldPass = inputLabels.every(
                (label) => !pullRequestLabels.includes(label),
            );

            if (!shouldPass) {
                core.setFailed('PR contains at least one input label');
            }
        }

        core.info('PR label check successful');
    } catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        } else {
            core.setFailed('unknown error');
        }
    }
}

run();

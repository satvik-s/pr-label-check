import * as core from '@actions/core';
import * as github from '@actions/github';

const LABEL_CHECK_TYPES = ['all_of', 'any_of', 'none_of', 'one_of'];

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
        core.info(`PR labels: ${pullRequestLabels}`);

        if (!pullRequestLabels || pullRequestLabels.length === 0) {
            core.setFailed('Pull Request labels not defined');
            return;
        }

        const inputLabels = core
            .getInput('labels', { required: true })
            .split(',');
        const inputLabelCheckType = core.getInput('type', { required: true });

        core.info(`Input labels: ${inputLabels}`);
        core.info(`Input type: ${inputLabelCheckType}`);

        if (!LABEL_CHECK_TYPES.includes(inputLabelCheckType)) {
            core.setFailed(`Input type (${inputLabelCheckType}) is not valid`);
            return;
        }

        if (inputLabelCheckType)
            if (inputLabelCheckType === 'all_of') {
                const shouldPass = inputLabels.every((label) =>
                    pullRequestLabels.includes(label),
                );

                if (!shouldPass) {
                    core.setFailed('PR does not contain all the input labels');
                    return;
                }
            }

        if (inputLabelCheckType === 'any_of') {
            const shouldPass = inputLabels.some((label) =>
                pullRequestLabels.includes(label),
            );

            if (!shouldPass) {
                core.setFailed('PR does not contain any of the input labels');
                return;
            }
        }

        if (inputLabelCheckType === 'none_of') {
            const shouldPass = inputLabels.every(
                (label) => !pullRequestLabels.includes(label),
            );

            if (!shouldPass) {
                core.setFailed('PR contains at least one input label');
                return;
            }
        }

        if (inputLabelCheckType === 'one_of') {
            const labelsContained = inputLabels.filter((label) =>
                pullRequestLabels.includes(label),
            ).length;
            const shouldPass = labelsContained === 1;

            if (!shouldPass) {
                core.setFailed(
                    `PR contains ${labelsContained} labels from the input labels`,
                );
                return;
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

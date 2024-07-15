import type { CommitType } from './config.js';

const MAX_COMMIT_LENGTH = 80;

const commitTypeFormats: Record<CommitType, string> = {
    '': '<commit message>',
    conventional: `<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]`,
    gitmoji: `:<emoji>:(<optional scope>): <description>

[optional body]

[optional footer(s)`,
};

const exampleCommitByType: Record<CommitType, string> = {
    '': '',
    conventional: `<type>(<optional scope>): <description>`,
    gitmoji: `:<emoji>: <description>`,
};

const specifyCommitFormat = (type: CommitType = 'conventional') => {
    if (type === '') {
        return '';
    }
    return `The commit message must be in format:\n${commitTypeFormats[type]}`;
};

/*
get from gitmoji.dev
[...document.getElementsByClassName("styles_gitmojiInfo__KXa8A")].map(data => {
    const key = data.querySelector("button").innerText;
    return { [`${key}`]: `${data.lastElementChild.textContent}` };
})
 */
const commitTypes: Record<CommitType, string> = {
    '': '',
    gitmoji: `\n${JSON.stringify(
        {
            ':art:': 'Improve structure / format of the code.',
            ':zap:': 'Improve performance.',
            ':fire:': 'Remove code or files.',
            ':bug:': 'Fix a bug.',
            ':ambulance:': 'Critical hotfix.',
            ':sparkles:': 'Introduce new features.',
            ':memo:': 'Add or update documentation.',
            ':rocket:': 'Deploy stuff.',
            ':lipstick:': 'Add or update the UI and style files.',
            ':tada:': 'Begin a project.',
            ':white_check_mark:': 'Add, update, or pass tests.',
            ':lock:': 'Fix security or privacy issues.',
            ':closed_lock_with_key:': 'Add or update secrets.',
            ':bookmark:': 'Release / Version tags.',
            ':rotating_light:': 'Fix compiler / linter warnings.',
            ':construction:': 'Work in progress.',
            ':green_heart:': 'Fix CI Build.',
            ':arrow_down:': 'Downgrade dependencies.',
            ':arrow_up:': 'Upgrade dependencies.',
            ':pushpin:': 'Pin dependencies to specific versions.',
            ':construction_worker:': 'Add or update CI build system.',
            ':chart_with_upwards_trend:': 'Add or update analytics or track code.',
            ':recycle:': 'Refactor code.',
            ':heavy_plus_sign:': 'Add a dependency.',
            ':heavy_minus_sign:': 'Remove a dependency.',
            ':wrench:': 'Add or update configuration files.',
            ':hammer:': 'Add or update development scripts.',
            ':globe_with_meridians:': 'Internationalization and localization.',
            ':pencil2:': 'Fix typos.',
            ':poop:': 'Write bad code that needs to be improved.',
            ':rewind:': 'Revert changes.',
            ':twisted_rightwards_arrows:': 'Merge branches.',
            ':package:': 'Add or update compiled files or packages.',
            ':alien:': 'Update code due to external API changes.',
            ':truck:': 'Move or rename resources (e.g.: files, paths, routes).',
            ':page_facing_up:': 'Add or update license.',
            ':boom:': 'Introduce breaking changes.',
            ':bento:': 'Add or update assets.',
            ':wheelchair:': 'Improve accessibility.',
            ':bulb:': 'Add or update comments in source code.',
            ':beers:': 'Write code drunkenly.',
            ':speech_balloon:': 'Add or update text and literals.',
            ':card_file_box:': 'Perform database related changes.',
            ':loud_sound:': 'Add or update logs.',
            ':mute:': 'Remove logs.',
            ':busts_in_silhouette:': 'Add or update contributor(s).',
            ':children_crossing:': 'Improve user experience / usability.',
            ':building_construction:': 'Make architectural changes.',
            ':iphone:': 'Work on responsive design.',
            ':clown_face:': 'Mock things.',
            ':egg:': 'Add or update an easter egg.',
            ':see_no_evil:': 'Add or update a .gitignore file.',
            ':camera_flash:': 'Add or update snapshots.',
            ':alembic:': 'Perform experiments.',
            ':mag:': 'Improve SEO.',
            ':label:': 'Add or update types.',
            ':seedling:': 'Add or update seed files.',
            ':triangular_flag_on_post:': 'Add, update, or remove feature flags.',
            ':goal_net:': 'Catch errors.',
            ':dizzy:': 'Add or update animations and transitions.',
            ':wastebasket:': 'Deprecate code that needs to be cleaned up.',
            ':passport_control:': 'Work on code related to authorization, roles and permissions.',
            ':adhesive_bandage:': 'Simple fix for a non-critical issue.',
            ':monocle_face:': 'Data exploration/inspection.',
            ':coffin:': 'Remove dead code.',
            ':test_tube:': 'Add a failing test.',
            ':necktie:': 'Add or update business logic.',
            ':stethoscope:': 'Add or update healthcheck.',
            ':bricks:': 'Infrastructure related changes.',
            ':technologist:': 'Improve developer experience.',
            ':money_with_wings:': 'Add sponsorships or money related infrastructure.',
            ':thread:': 'Add or update code related to multithreading or concurrency.',
            ':safety_vest:': 'Add or update code related to validation.',
        },
        null,
        2
    )}`,
    /**
     * References:
     * Commitlint:
     * https://github.com/conventional-changelog/commitlint/blob/18fbed7ea86ac0ec9d5449b4979b762ec4305a92/%40commitlint/config-conventional/index.js#L40-L100
     *
     * Conventional Changelog:
     * https://github.com/conventional-changelog/conventional-changelog/blob/d0e5d5926c8addba74bc962553dd8bcfba90e228/packages/conventional-changelog-conventionalcommits/writer-opts.js#L182-L193
     */
    conventional: `\n${JSON.stringify(
        {
            docs: 'Documentation only changes',
            style: 'Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)',
            refactor: 'A code change that neither fixes a bug nor adds a feature',
            perf: 'A code change that improves performance',
            test: 'Adding missing tests or correcting existing tests',
            build: 'Changes that affect the build system or external dependencies',
            ci: 'Changes to CI configuration files, scripts',
            chore: "Other changes that don't modify src or test files",
            revert: 'Reverts a previous commit',
            feat: 'A new feature',
            fix: 'A bug fix',
        },
        null,
        2
    )}`,
};

export const generateDefaultPrompt = (locale: string, maxLength: number, type: CommitType, additionalPrompts: string = '') =>
    [
        `You are an expert programmer trained to write professional git commit messages following the ${type} Commits specification. Generate concise and meaningful git commit messages based on the guidelines below:`,
        `1. Message language: ${locale}`,
        `2. Format: ${commitTypeFormats[type]}`,
        `3. Type: Choose the most appropriate type from the following list: ${commitTypes[type]}`,
        `4. Subject line(first line):
     - Maximum ${maxLength} characters
     - Written in imperative mood, present tense
     - No capitalization of first letter
     - No period at the end`,
        `5. Body(if needed):
     - Separated from subject by a blank line
     - Explain what and why, not how
     - Wrap at 72 characters
     - Use bullet points for multiple changes`,
        `6. Footer: Optional, for indicating breaking changes or referencing issues`,
        `7. Scope: Optional, can be anything specifying the place of the commit change`,
        `8. Description: A short summary of the code changes`,
        `${additionalPrompts}`,
        `Avoid unnecessary explanations or translations. Your response will be used directly in git commit messages, so ensure it follows the specified format precisely.`,
    ]
        .filter(Boolean)
        .join('\n');

export const extraPrompt = (generate: number, type: CommitType) => `Provide ${generate} commit messages in the following JSON array format:
 [
  {
    "message": "${exampleCommitByType[type]}",
    "body": "Detailed explanation if necessary"
  },
  {
    "message": "Another ${type} commit message",
    "body": "Another detailed explanation if necessary"
  }
]

Note: Your task is to create well-formatted, conventional commit messages for each requested commit. Ensure that the messages are diverse and showcase different types and formats.`;

export const isValidConventionalMessage = (message: string): boolean => {
    // TODO: check loosely for issue that message is not coming out
    // const conventionalReg =
    //     /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test){1}(\([\w\-]+\))?(!)?: .{1,80}(\n|\r\n){2}(.*(\n|\r\n)*)*$/;
    const conventionalReg = /(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.*\))?: .*$/;
    return conventionalReg.test(message);
};

export const isValidGitmojiMessage = (message: string): boolean => {
    const gitmojiCommitMessageRegex = /:\w*:/;
    return gitmojiCommitMessageRegex.test(message);
};

export const gitmojiTypes = [
    ':art:',
    ':zap:',
    ':fire:',
    ':bug:',
    ':ambulance:',
    ':sparkles:',
    ':memo:',
    ':rocket:',
    ':lipstick:',
    ':tada:',
    ':white_check_mark:',
    ':lock:',
    ':closed_lock_with_key:',
    ':bookmark:',
    ':rotating_light:',
    ':construction:',
    ':green_heart:',
    ':arrow_down:',
    ':arrow_up:',
    ':pushpin:',
    ':construction_worker:',
    ':chart_with_upwards_trend:',
    ':recycle:',
    ':heavy_plus_sign:',
    ':heavy_minus_sign:',
    ':wrench:',
    ':hammer:',
    ':globe_with_meridians:',
    ':pencil2:',
    ':poop:',
    ':rewind:',
    ':twisted_rightwards_arrows:',
    ':package:',
    ':alien:',
    ':truck:',
    ':page_facing_up:',
    ':boom:',
    ':bento:',
    ':wheelchair:',
    ':bulb:',
    ':beers:',
    ':speech_balloon:',
    ':card_file_box:',
    ':loud_sound:',
    ':mute:',
    ':busts_in_silhouette:',
    ':children_crossing:',
    ':building_construction:',
    ':iphone:',
    ':clown_face:',
    ':egg:',
    ':see_no_evil:',
    ':camera_flash:',
    ':alembic:',
    ':mag:',
    ':label:',
    ':seedling:',
    ':triangular_flag_on_post:',
    ':goal_net:',
    ':dizzy:',
    ':wastebasket:',
    ':passport_control:',
    ':adhesive_bandage:',
    ':monocle_face:',
    ':coffin:',
    ':test_tube:',
    ':necktie:',
    ':stethoscope:',
    ':bricks:',
    ':technologist:',
    ':money_with_wings:',
    ':thread:',
    ':safety_vest:',
];

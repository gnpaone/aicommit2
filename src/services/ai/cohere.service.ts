import chalk from 'chalk';
import { CohereClient, CohereError, CohereTimeoutError } from 'cohere-ai';
import { ReactiveListChoice } from 'inquirer-reactive-list-prompt';
import { Observable, catchError, concatMap, from, map, of } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';

import { AIResponse, AIService, AIServiceParams } from './ai.service.js';
import { KnownError } from '../../utils/error.js';
import { createLogResponse } from '../../utils/log.js';
import { CODE_REVIEW_PROMPT, DEFAULT_PROMPT_OPTIONS, PromptOptions, generatePrompt } from '../../utils/prompt.js';
import { getRandomNumber } from '../../utils/utils.js';

export class CohereService extends AIService {
    private cohere: CohereClient;

    constructor(private readonly params: AIServiceParams) {
        super(params);
        this.colors = {
            primary: '#D18EE2',
            secondary: '#fff',
        };
        this.serviceName = chalk.bgHex(this.colors.primary).hex(this.colors.secondary).bold('[Cohere]');
        this.errorPrefix = chalk.red.bold(`[Cohere]`);
        this.cohere = new CohereClient({
            token: this.params.config.key,
        });
    }

    generateCommitMessage$(): Observable<ReactiveListChoice> {
        return fromPromise(this.generateMessage()).pipe(
            concatMap(messages => from(messages)),
            map(data => ({
                name: `${this.serviceName} ${data.title}`,
                short: data.title,
                value: this.params.config.includeBody ? data.value : data.title,
                description: this.params.config.includeBody ? data.value : '',
                isError: false,
            })),
            catchError(this.handleError$)
        );
    }

    generateCodeReview$(): Observable<ReactiveListChoice> {
        return fromPromise(this.generateCodeReview()).pipe(
            concatMap(messages => from(messages)),
            map(data => ({
                name: `${this.serviceName} ${data.title}`,
                short: data.title,
                value: data.value,
                description: data.value,
                isError: false,
            })),
            catchError(this.handleError$)
        );
    }

    private async generateCodeReview(): Promise<AIResponse[]> {
        try {
            const diff = this.params.stagedDiff.diff;
            const { systemPrompt, systemPromptPath, logging, locale, temperature, generate, type, maxLength } = this.params.config;
            const promptOptions: PromptOptions = {
                ...DEFAULT_PROMPT_OPTIONS,
                locale,
                maxLength,
                type,
                generate,
                systemPrompt,
                systemPromptPath,
            };
            const generatedSystemPrompt = CODE_REVIEW_PROMPT;
            const maxTokens = this.params.config.maxTokens;

            const prediction = await this.cohere.chat({
                chatHistory: generatedSystemPrompt ? [{ role: 'SYSTEM', message: generatedSystemPrompt }] : [],
                message: `Here is the diff: ${diff}`,
                connectors: [{ id: 'web-search' }],
                maxTokens,
                temperature,
                model: this.params.config.model,
                seed: getRandomNumber(10, 1000),
                p: this.params.config.topP,
            });

            logging && createLogResponse('Cohere Review', diff, generatedSystemPrompt, prediction.text);
            return this.sanitizeResponse(prediction.text);
        } catch (error) {
            const errorAsAny = error as any;
            if (errorAsAny instanceof CohereTimeoutError) {
                throw new KnownError(`Request timed out error!`);
            }
            throw errorAsAny;
        }
    }

    private async generateMessage(): Promise<AIResponse[]> {
        try {
            const diff = this.params.stagedDiff.diff;
            const { systemPrompt, systemPromptPath, logging, locale, temperature, generate, type, maxLength } = this.params.config;
            const promptOptions: PromptOptions = {
                ...DEFAULT_PROMPT_OPTIONS,
                locale,
                maxLength,
                type,
                generate,
                systemPrompt,
                systemPromptPath,
            };
            const generatedSystemPrompt = generatePrompt(promptOptions);
            const maxTokens = this.params.config.maxTokens;

            const prediction = await this.cohere.chat({
                chatHistory: generatedSystemPrompt ? [{ role: 'SYSTEM', message: generatedSystemPrompt }] : [],
                message: `Here is the diff: ${diff}`,
                connectors: [{ id: 'web-search' }],
                maxTokens,
                temperature,
                model: this.params.config.model,
                seed: getRandomNumber(10, 1000),
                p: this.params.config.topP,
            });

            logging && createLogResponse('Cohere', diff, generatedSystemPrompt, prediction.text);
            return this.parseMessage(prediction.text, type, generate);
        } catch (error) {
            const errorAsAny = error as any;
            if (errorAsAny instanceof CohereTimeoutError) {
                throw new KnownError(`Request timed out error!`);
            }
            throw errorAsAny;
        }
    }

    handleError$ = (error: CohereError) => {
        const regex = /"message":\s*"([^"]*)"/;
        const match = error.message.match(regex);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        let simpleMessage = error?.body?.message;
        if (match && match[1]) {
            simpleMessage = match[1];
        }
        const message = `${error.statusCode} ${simpleMessage}`;
        return of({
            name: `${this.errorPrefix} ${message}`,
            value: simpleMessage,
            isError: true,
            disabled: true,
        });
    };
}

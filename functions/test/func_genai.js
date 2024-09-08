/**
 * Online tests
 */
const { cfg, debug, projroot } = require("./commonTest")

// const GS_URL_PREFIX = 'https://storage.googleapis.com/run-pix.appspot.com/'
const { assert } = require('chai')

// // const { firebaseConfig } = require('firebase-functions');
// const functions = require('firebase-functions');
// const { storageBucket } = require('firebase-functions/params');
// const test = require('firebase-functions-test')(cfg.firebaseConfig,
//     cfg.service_account);
// const firestore = require("../firebaseUser")

const { generate } = require(`@genkit-ai/ai`)
const { gemini15Flash, claude3Sonnet, llama31 } = require('@genkit-ai/vertexai');
// const { gpt4o } = require('genkitx-openai');


describe('Virtual Races', function () {
    // this.timeout(10000)
    this.timeout(10000);
    it('gen AI basic', async () => {
        // Use the same API to generate content from many models
        const result = await generate({
            model: llama31,//gemini15Flash, // Or use claude3Sonnet, llama31, gpt4o
            prompt: 'What makes you the best LLM out there?',

        });
        debug(result)
    })
})
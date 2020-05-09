const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBaundaryDetection = require('sbd');

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const watsonApiKey = require('../credentials/nlu-watson.json').apiKey;

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/',
});

const state = require('./state');

async function robot() {
  const content = state.load();

  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntroSentences(content);
  limitMaximumSentences(content);
  await fetchKeyWordsOfAllSentences(content);

  state.save(content);

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAlthenticated = algorithmia(algorithmiaKey);
    const wikipediaAlgorithm = algorithmiaAlthenticated.algo(
      'web/WikipediaParser/0.1.2'
    );

    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponse.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }
  function sanitizeContent(content) {
    const { sourceContentOriginal } = content;
    const withoutBlankLinesAndMarkdawns = removeBlankLinesAndMarkdawns(
      sourceContentOriginal
    );
    const withoutDatesInParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarkdawns
    );

    function removeBlankLinesAndMarkdawns(text) {
      const allLines = text.split('\n');
      const withoutBlankLinesAndMarkdawns = allLines.filter((line) => {
        if (line.trim().length === 0 || line.trim().startsWith('=')) {
          return false;
        }
        return true;
      });
      return withoutBlankLinesAndMarkdawns.join(' ');
    }
    function removeDatesInParentheses(text) {
      return text
        .replace(/\((?:\([^()]*\)|[^()])*\)/gm, '')
        .replace(/  /g, ' ');
    }

    content.sourceContentSanitized = withoutDatesInParentheses;
  }
  function breakContentIntroSentences(content) {
    content.sentences = [];
    const sentences = sentenceBaundaryDetection.sentences(
      content.sourceContentSanitized
    );
    sentences.forEach((sentence) => {
      content.sentences.push({
        text: sentence,
        keywords: [],
        images: [],
      });
    });
  }
  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }
  async function fetchKeyWordsOfAllSentences(content) {
    for (const sentence of content.sentences) {
      sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
    }
  }
  async function fetchWatsonAndReturnKeywords(sentence) {
    try {
      const response = await nlu.analyze({
        text: sentence,
        features: {
          keywords: {},
        },
      });
      const keywords = response.result.keywords.map((keyword) => keyword.text);
      return keywords;
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = robot;

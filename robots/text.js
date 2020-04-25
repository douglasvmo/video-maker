const algorithmia = require('algorithmia');
const algorithmiaKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBaundaryDetection = require('sbd');

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntroSentences(content);

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
}

module.exports = robot;

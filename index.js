const readline = require('readline-sync');

function start() {
  const content = {};

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm() {
    return readline.question('Type a Wikipedia search term:  ');
  }
  function askAndReturnPrefix() {
    const prefix = ['who is', 'What is', 'The history of'];
    const selectedPrefixIndex = readline.keyInSelect(prefix);
    const selectedPrefixText = prefix[selectedPrefixIndex];
    return selectedPrefixText;
  }
  console.log(content);
}

start();

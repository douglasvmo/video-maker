const robots = {
  input: require('./robots/input'),
  text: require('./robots/text'),
};
const state = require('./robots/state');

async function start() {
  robots.input();
  await robots.text();

  const content = state.load();
  console.dir(content, { depth: null });
}

start();

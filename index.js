const robots = {
  input: require('./robots/input'),
  text: require('./robots/text'),
  image: require('./robots/image'),
};
const state = require('./robots/state');

async function start() {
  robots.input();
  await robots.text();
  await robots.image();

  const content = state.load();
  console.dir(content, { depth: null });
}

start();

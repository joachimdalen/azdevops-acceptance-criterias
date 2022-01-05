const modules = [
  {
    name: 'admin-hub',
    entry: './src/admin-hub/module',
    root: 'admin-hub-container',
    generate: true
  },
  {
    name: 'work-hub',
    entry: './src/work-hub/module',
    root: 'work-hub-container',
    generate: true
  },
  {
    name: 'criteria-panel',
    entry: './src/criteria-panel/module',
    root: 'criteria-panel-container',
    generate: true
  },
  {
    name: 'wi-control',
    entry: './src/wi-control/module',
    root: 'wi-control-container',
    generate: true
  }
];

const entries = modules.reduce(
  (obj, item) => ({
    ...obj,
    [item.name]: item.entry
  }),
  {}
);

module.exports = {
  modules,
  entries
};

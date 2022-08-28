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
    generate: true,
    assets: [
      { source: './src/work-hub/assets/hub-icon-dark.png', dest: 'assets/hub-icon-dark.png' },
      { source: './src/work-hub/assets/hub-icon-light.png', dest: 'assets/hub-icon-light.png' },
      { source: './hub-group-icon.png', dest: 'assets/hub-group-icon.png' }
    ]
  },
  {
    name: 'analytics-hub',
    entry: './src/analytics-hub/module',
    root: 'analytics-hub-container',
    generate: true
  },
  {
    name: 'criteria-template-panel',
    entry: './src/criteria-template-panel/module',
    root: 'criteria-template-panel-container',
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
  },
  {
    name: 'confirmation-dialog',
    entry: './src/confirmation-dialog/module',
    root: 'confirmation-dialog-container',
    generate: true
  },
  {
    name: 'progress-control',
    entry: './src/progress-control/module',
    root: 'progress-control-container',
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

# Changelog

## 1.3.0 (2022-08-XX)

### 📣 Enhancements (3)

#### `admin-hub@1.2.0`

- Redesigned the configuration view. Moved from tabs to dedicated pages.
  - Improved in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

#### `criteria-panel@1.3.0`

- Moved the type dropdown to the top of the panel

  - Improved in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

- Make scenario description optional instead of required
  - Suggested in [GH#43 - Make scenario description an optional field](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/43)
  - Improved in [PR#47 - Make scenario description optional](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/47)

### 🚀 Features (3)

#### `admin-hub@1.2.0`

- Added support for creating templates
  - Suggested in [GH#37 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/37)
  - Added in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

#### `criteria-template-panel@1.0.0`

- Added panel for creating templates
  - Suggested in [GH#37 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/37)
  - Added in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

#### `wi-control@1.1.0`

- Added support for creating criterias from a template
  - Suggested in [GH#37 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/37)
  - Added in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

### 🛠️ Maintenance (1)

#### `criteria-panel@1.3.0`

- Internal refactoring to improve flows
  - Changed in [PR#41 - Criteria templates](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/41)

### 🐛 Fixes (2)

#### `criteria-panel@1.3.0`

- Fix text being truncated in panel view
  - Reported in [GH#51 - Enable text overflow when viewing criteria](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/51)
  - Fixed in [PR#53 - Fix text being truncted in view mode](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/53)

#### `wi-control@1.1.0`

- Fixed 'Save the work item to start adding acceptance criterias' showing even after the work item has been saved
  - Reported in [GH#45 - Can not add criterias on a newly created work item](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/45)
  - Fixed in [PR#46 - Fix unable to create on new work item](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/46)

## 🌟 Contributors

Thank you to the following for contributing to the latest release

- [@trevonmckay](https://github.com/trevonmckay)

---

## 1.2.0 (2022-05-22)

### 🛠️ Maintenance (1)

- Fix ci pipeline setting the wrong extension version
  - Scheduled in [GH#22 - Build sets the wrong extension version in scripts when setting the version manually](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/22)
  - Changed in [PR#24 - Fix pipeline setting wrong extension version when defined manually](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/24)

### 📝 Documentation (1)

- Update README with correct features
  - Changed in [PR#23 - Update readme with correct features](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/23)

## 📦 Module changes

### 📣 Enhancements (1)

#### `admin-hub@1.1.0`

- Redesigned and cleaned up the configuration view
  - Suggested in [GH#30 - Reset all settings does not reset the admin view](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/30)
  - Improved in [PR#32 - Redesign and fixes to Admin Hub](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/32)

### 🚀 Features (3)

#### `criteria-panel@1.2.0`

- Add key board shortcuts. See the [documentation](https://devops-extensions.dev/docs/extensions/acceptance-criterias/shortcuts) for details.
  - Suggested in [GH#25 - Add keyboard shortcuts for improved navigation and UX](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/25)
  - Added in [PR#29 - Add keyboard shortcuts](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/29)

#### `admin-hub@1.1.0`

- Update documentation urls
  - Added in [PR#29 - Add keyboard shortcuts](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/29)

#### `work-hub@1.1.0`

- Add buttons to open documentation
  - Added in [PR#29 - Add keyboard shortcuts](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/29)

### 🐛 Fixes (6)

#### `criteria-panel@1.2.0`

- Fixed validation messages not showing for checklist items

  - Reported in [GH#26 - Checklist is missing validation messages on items](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/26)
  - Fixed in [PR#27 - Fix missing validation for checklist items](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/27)

- Fixed some missing colors when in light mode
  - Reported in [GH#28 - Fix colors in lightmode](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/28)
  - Fixed in [PR#31 - Fix some missing colors when using a light mode theme](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/31)

#### `admin-hub@1.1.0`

- Fixed an issue where pressing 'Reset all settings' would not reset the view
  - Reported in [GH#30 - Reset all settings does not reset the admin view](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/30)
  - Fixed in [PR#32 - Redesign and fixes to Admin Hub](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/32)

#### `work-hub@1.1.0`

- Fixed some missing colors when in light mode

  - Reported in [GH#28 - Fix colors in lightmode](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/28)
  - Fixed in [PR#31 - Fix some missing colors when using a light mode theme](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/31)

- Fixed free text search being case sensitive

  - Reported in [GH#33 - Filter should be case-insensitive](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/33)
  - Fixed in [PR#34 - Fix filter issues](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/34)

- Fixed an issue that could lead to the browser window crashing when working with a large amount of criterias and filters
  - Reported in [GH#33 - Filter should be case-insensitive](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/33)
  - Fixed in [PR#34 - Fix filter issues](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/34)

## 🌟 Contributors

Thank you to the following for contributing to the latest release

- [@xperiandri](https://github.com/xperiandri)

---

## 1.1.0 (2022-05-16)

### 🐛 Fixes (1)

- Fixed an issue that could cause an error to show when performing multiple processing actions without closing the panel
  - Fixed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

## 📦 Module changes

### 🚀 Features (2)

#### `criteria-panel@1.1.0`

- Added processing history. See [history](https://devops-extensions.dev/docs/extensions/acceptance-criterias/processing/history)

  - Suggested in [GH#3 - Processing history](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/3)
  - Added in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

- Added processing comments. See [approvals and rejections](https://devops-extensions.dev/docs/extensions/acceptance-criterias/processing#approvals-and-rejections)
  - Suggested in [GH#4 - Approval / Rejection comments](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/4)
  - Added in [PR#21 - Add processing comment](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/21)

### 🛠️ Maintenance (2)

#### `work-hub@1.0.3`

- Remove unused setting from settings view
  - Changed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

#### `wi-control@1.0.1`

- Remove unused code
  - Changed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

### 🐛 Fixes (2)

#### `criteria-panel@1.1.0`

- Fixed an issue where you could uncheck checklist items while waiting for approval

  - Fixed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

- Fixed an issue where the checklist would be out of sync when performing multiple processing actions without closing the panel
  - Fixed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

### 📝 Documentation (1)

#### `admin-hub@1.0.1`

- Update documentation url
  - Changed in [PR#19 - Refactor and introduce base history](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/19)

---

## 1.0.2 (2022-05-01)

### 🛠️ Maintenance (1)

- Fix cyclical reference in pipeline
  - Changed in [PR#18 - Fix cyclical reference](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/18)

## 📦 Module changes

### 🐛 Fixes (1)

#### `work-hub@1.0.2`

- Fix criterias not showing their icon in the list
  - Reported in [GH#16 - Criteria rows does not show icons](https://github.com/joachimdalen/azdevops-acceptance-criterias/issues/16)
  - Fixed in [PR#17 - Fix criteria icons not showing](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/17)

---

## 1.0.1 (2022-05-01)

### 🐛 Fixes (1)

#### `work-hub@1.0.1`

- Fix wrong title on work hub
  - Fixed in [PR#14 - Fix work hub title](https://github.com/joachimdalen/azdevops-acceptance-criterias/pull/14)

---

## 1.0.0 (2022-05-01)

**✏️ Release summary**

Initial release

---

---

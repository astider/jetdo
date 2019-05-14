const ruleModel = require('./ruleModel');

const getRuleModel = () => Immutable.fromJS(ruleModel).toJS(); // => return object

class rule {
  static init() {
    this.rules = getRuleModel();
  }

  /**
   * activate
   * @param {{name: String, priority?: Number}[]} list [{ name: 'onHit', priority: 0 }, { name: 'onDie', priority: 1 }]
   */
  static activate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (!Array.isArray(list)) throw Error('Parameter must be array');
    
    for (let i = 0; i < list.length; i += 1) {
      if (this.rules[list[i].name] === undefined) continue;
      if (list[i].priority !== undefined) this.rules[list[i].name].priority = list[i].priority;
      this.rules[list[i].name].activated = true;
    }
  }

  static activateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.rules).forEach((key) => {
      this.rules[key].activated = true;
    });
  }

  /**
   * deactivate
   * @param {String[]} list the list of rule name
   */
  static deactivate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (!Array.isArray(list)) throw Error('Parameter must be array');

    for (let i = 0; i < list.length; i += 1) {
      if (this.rules[list[i]] === undefined) continue;
      this.rules[list[i]] = getRuleModel()[list[i]];
    }
  }

  static deactivateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.rules).forEach((key) => {
      this.rules[key] = getRuleModel()[key];
    });
  }

  static getAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules);
  }

  static getActivated() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules).filter(ruleName => this.rules[ruleName].activated);
  }

  static getMatched() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.keys(this.rules).filter(ruleName => this.rules[ruleName].matched);
  }

  static isActivated(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return false;
    return this.rules[ruleName].activated;
  }

  /**
   * check
   * @param {String[]} list the list of rule name
   */
  static check(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    const rules = [];
    for (let i = 0; i < list.length; i += 1) {
      const ruleName = list[i];
      if (this.rules[ruleName] === undefined) rules.push({});
      rules.push({
        name: ruleName,
        passed: this.rules[ruleName].check(),
        activated: this.rules[ruleName].activated,
      });
    }
    return rules
  }

  static checkAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.entries(this.rules)
      .sort((ruleA, ruleB) => ruleA[1].priority - ruleB[1].priority)
      .map(([key, rule]) => ({
        name: key,
        passed: rule.check(),
        activated: rule.activated,
      }));
  }

  /**
   * validate
   * @param {String[]} list the list of rule name
   */
  static validate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    for (let i = 0; i < list.length; i += 1) {
      const ruleName = list[i];
      if (this.rules[ruleName] === undefined) continue;
      if (!this.rules[ruleName].activated) continue;
      if (this.rules[ruleName].check()) {
        this.rules[ruleName].matched = true;
      } else {
        this.rules[ruleName].matched = false;
      }
    }
  }

  static validateAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    Object.entries(this.rules)
      .filter(([, rule]) => rule.activated)
      .sort((ruleA, ruleB) => ruleA[1].priority - ruleB[1].priority)
      .forEach(([key, rule]) => {
        if (rule.check()) {
          this.rules[key].matched = true;
        } else {
          this.rules[key].matched = false;
        }
      });
  }
}

module.exports = rule;

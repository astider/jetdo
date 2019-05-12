const data = require('../data');

const ruleModels = {
  onHit: {
    priority: 0,
    activated: false,
    matched: false,
    check: () => {},
  },
  onDie: {
    priority: 0,
    activated: false,
    matched: false,
    check: () => {},
  }
}

class rule {
  static init() {
    this.rules = ruleModels;
  }

  /**
   * activate
   * @param {object[]} list [{ name: 'onHit', priority: 0 }]
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

  /**
   * deactivate
   * @param {array} list the list of rule name
   */
  static deactivate(list) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (!Array.isArray(list)) throw Error('Parameter must be array');

    for (let i = 0; i < list.length; i += 1) {
      if (this.rules[list[i]] === undefined) continue;
      this.rules[list[i]] = ruleModels[list[i]];
    }
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

  static check(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return {};
    return {
      name: ruleName,
      passed: this.rules[ruleName].check(),
      activated: this.rules[ruleName].activated,
    };
  }

  static checkAll() {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    return Object.entries(this.rules)
      .sort((ruleA, ruleB) => ruleA[1].priority - ruleB[1].priority)
      .map(([key, rule]) => ({
        name: key,
        passed: rule.check(),
        activated: rule.activated,
      }))
  }

  static validate(ruleName) {
    if (this.rules === undefined) throw Error('Please setup by running "init" method');
    if (this.rules[ruleName] === undefined) return;
    if (this.rules[ruleName].activated !== true) return;

    if (this.rules[ruleName].check()) {
      this.rules[ruleName].matched = true;
    } else {
      this.rules[ruleName].matched = false;
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

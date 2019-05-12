class event {
  static init() {
    this.eventList = {};
  }

  /**
   * add an event listener
   * @param {String} eventType e.g. keyup, keydown
   * @param {String} eventName unique name
   * @param {number} keyCode
   * @param {Function} func
   */
  static add(eventType, eventName, keyCode, func) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    if (Object.keys(this.eventList).indexOf(eventName) !== -1) throw Error('Duplicate event name');
    this.eventList[eventName] = {
      type: eventType,
      code: keyCode,
      func: (e) => {
        if (e.keyCode === keyCode || e.which === keyCode) func(e);
      } };
    document.addEventListener(eventType, this.eventList[eventName].func);
  }

  static remove(eventName) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    if (Object.keys(this.eventList).indexOf(eventName) === -1) throw Error('Event not found');
    document.removeEventListener(this.eventList[eventName].type, this.eventList[eventName].func);
    delete this.eventList[eventName];
  }

  static clear(eventType) {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.eventList).forEach(eventName => {
      if (this.eventList[eventName].type === eventType) {
        document.removeEventListener(eventType, this.eventList[eventName].func);
        delete this.eventList[eventName];
      }
    });
  }

  static clearAll() {
    if (this.eventList === undefined) throw Error('Please setup by running "init" method');
    Object.keys(this.eventList).forEach(eventName => {
      document.removeEventListener(this.eventList.type, this.eventList[eventName].func);
      delete this.eventList[eventName];
    });
  }

  getEventList() {
    return this.eventList;
  }
}

module.exports = event;

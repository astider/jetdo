const isObject = (v) => (!Array.isArray(v) && v !== null && typeof v === 'object');

/**
 * assocPath
 * @example
 * assocPath(['a','b','c'], 'new', {a: {b: {c: 'old'}}}) // => {a: {b: {c: 'new'}}}
 * assocPath(['a','b','c'], 'new', {a: {b: {c: 'old', d: 'old'}}}) // => {a: {b: {c: 'new', d: 'old'}}}
 */
const assocPath = (path, val, obj) => {
  if (!Array.isArray(path)) throw Error('the first parameter must be array');

  const idx = path[0];

  if (path.length > 1) {
    const nextObj = (obj !== undefined) ? obj[idx] : {};
    val = assocPath(path.slice(1), val, nextObj);
  }

  if (!isObject(obj)) return {[idx]: val};

  let result = {};

  for (let key in obj) {
    result[key] = obj[key];
  }
  result[idx] = val;

  return result;
}

/**
 * findDeep
 * @example
 * findDeep(['a', 'b'], { a: { b: 'value' } }) // => 'value'
 * findDeep(['a', 'c'], { a: { b: 'value' } }) // => undefined
 */
const findDeep = (keys, obj) => {
  if (!Array.isArray(keys)) throw Error('the first parameter must be array');

  let accumulator = obj;

  for (let i = 0; i < keys.length; i += 1) {
    accumulator = accumulator[keys[i]];
    if (i === keys.length - 1) return accumulator;
    if (typeof accumulator !== 'object' || Array.isArray(accumulator) === true || accumulator === null) break;
  }
  return undefined;
};

module.exports = {
  findDeep,
  assocPath
};

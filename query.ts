const DEFAULT_SEP = '&';
const DEFAULT_EQ = '=';
function parse(queryString: string, sep: string=DEFAULT_SEP, eq: string=DEFAULT_EQ): object {
  const pairs = queryString.replace(/^\?/, '').split(sep);
  return pairs.reduce((r, pair) => {
    const [key, value=''] = pair.split(eq);
    if (key) {
      r[key] = !r[key] ? decodeURIComponent(value) : [].concat(r[key], decodeURIComponent(value));
    }
    return r;
  }, {});
};

function stringify (obj: object, sep: string=DEFAULT_SEP, eq: string=DEFAULT_EQ): string {
  let pairs = [];
  for(let [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value.length) {
      pairs.push(toValuesString(key, value, sep));
    } else {
      pairs.push(`${key}${eq}${encodeURIComponent(value.toString())}`);
    }
  }

  return pairs.join(sep);
};

function toValuesString(key: string, values: Array<string|number>, sep: string=DEFAULT_SEP, eq: string=DEFAULT_EQ): string {
    return values.map(value => `${key}${eq}${encodeURIComponent(value.toString())}`).join(sep);
}

export default { parse, stringify };

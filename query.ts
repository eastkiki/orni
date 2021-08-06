const DEFAULT_SEP: string = '&';
const DEFAULT_EQ: string = '=';

import { StringDictionary } from "./types.ts";

type QueryDictionary = StringDictionary;

function parse(queryString: string, sep: string=DEFAULT_SEP, eq: string=DEFAULT_EQ): QueryDictionary {
  const pairs = queryString.replace(/^\?/, '').split(sep);
  const r:QueryDictionary = {};
  pairs.forEach((pair) => {
    const [key, value=''] = pair.split(eq);
    if (key) {
      if (!r[key]) {
        r[key] = decodeURIComponent(value);
      } else {
        const arr: Array<string> = [];
        r[key] = arr.concat(r[key], decodeURIComponent(value));
      }
    }
  });
  return r;
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

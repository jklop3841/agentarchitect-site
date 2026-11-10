// Figure extraction and comparison for ClaimCheck. Isomorphic, no dependencies.
//
// A figure is normalised to a canonical string: "1200", "-5", "30%", "5 kg". Digits, Chinese
// numerals and English number words all normalise to the same form, so "three hundred
// million", "300 million" and the Chinese equivalent compare equal. The comparison is
// deliberately strict: a claim is only "supported" when every one of its figures is found.

const ZH_TEN_THOUSAND = "万";
const ZH_HUNDRED_MILLION = "亿";
const YEN_SIGN = "¥";
const ZH_YUAN = "元";

export type NumberToken = { canon: string; index: number };

const unitAliases: Record<string, string> = {
  kg: "kg", kgs: "kg", kilogram: "kg", kilograms: "kg", 公斤: "kg", 千克: "kg",
  g: "g", gram: "g", grams: "g", 克: "g",
  t: "tonne", ton: "tonne", tons: "tonne", tonne: "tonne", tonnes: "tonne", 吨: "tonne",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb", 磅: "lb",
  km: "km", kilometer: "km", kilometers: "km", kilometre: "km", kilometres: "km", 公里: "km", 千米: "km",
  m: "m", meter: "m", meters: "m", metre: "m", metres: "m", 米: "m",
  cm: "cm", centimeter: "cm", centimeters: "cm", centimetre: "cm", centimetres: "cm", 厘米: "cm",
  mm: "mm", millimeter: "mm", millimeters: "mm", millimetre: "mm", millimetres: "mm", 毫米: "mm",
  mile: "mile", miles: "mile", 英里: "mile",
  l: "l", liter: "l", liters: "l", litre: "l", litres: "l", 升: "l",
  usd: "usd", dollar: "usd", dollars: "usd", 美元: "usd",
  eur: "eur", euro: "eur", euros: "eur", 欧元: "eur",
  gbp: "gbp", 英镑: "gbp",
  cny: "cny", rmb: "cny", yuan: "cny", 人民币: "cny", [ZH_YUAN]: "cny",
};
const currencySymbols: Record<string, string> = { $: "usd", "€": "eur", "£": "gbp", [YEN_SIGN]: "cny" };

function unitAfter(rest: string): string | null {
  const latin = /^\s{0,2}([A-Za-z]{1,12})\b/.exec(rest);
  if (latin) return unitAliases[latin[1].toLowerCase()] ?? null;
  const cjk = /^\s{0,1}([一-鿿]{1,3})/.exec(rest);
  if (cjk) {
    for (let length = Math.min(3, cjk[1].length); length >= 1; length -= 1) {
      const unit = unitAliases[cjk[1].slice(0, length)];
      if (unit) return unit;
    }
  }
  return null;
}

function canonicalValue(value: number): string {
  return String(Number(value.toPrecision(15)));
}

function finish(sign: string, value: string, percent: boolean, unit: string | null) {
  return `${sign}${value}${percent ? "%" : unit ? ` ${unit}` : ""}`;
}

function digitTokens(text: string, out: NumberToken[]) {
  for (const match of text.matchAll(/\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:\.\d+)?/g)) {
    const start = match.index;
    let rest = text.slice(start + match[0].length, start + match[0].length + 28);
    let before = text.slice(Math.max(0, start - 2), start);
    let unit: string | null = null;
    const symbol = before.slice(-1);
    if (currencySymbols[symbol]) {
      unit = currencySymbols[symbol];
      before = before.slice(0, -1);
    }
    const signChar = before.slice(-1);
    const beforeSign = before.slice(-2, -1);
    const negative = (signChar === "-" || signChar === "−") && (beforeSign === "" || /[\s(（:：=]/.test(beforeSign));

    const raw = match[0].replace(/,/g, "");
    let multiplier = 1;
    const attached = /^(k|K|M|bn|B)\b/.exec(rest) ?? (unit ? /^(m)\b/.exec(rest) : null);
    if (attached) {
      multiplier = attached[1].toLowerCase() === "k" ? 1e3 : attached[1].toLowerCase() === "m" ? 1e6 : 1e9;
      rest = rest.slice(attached[0].length);
    }
    const word = /^\s{0,2}(thousand|million|billion|trillion)\b/i.exec(rest);
    if (word) {
      multiplier *= { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 }[word[1].toLowerCase() as "thousand"]!;
      rest = rest.slice(word[0].length);
    } else {
      const zh = new RegExp(`^\\s{0,1}([千百]?)(${ZH_TEN_THOUSAND}|${ZH_HUNDRED_MILLION})?`).exec(rest);
      if (zh && (zh[1] || zh[2])) {
        if (zh[1] === "千") multiplier *= 1e3;
        if (zh[1] === "百") multiplier *= 1e2;
        if (zh[2] === ZH_TEN_THOUSAND) multiplier *= 1e4;
        if (zh[2] === ZH_HUNDRED_MILLION) multiplier *= 1e8;
        rest = rest.slice(zh[0].length);
      }
    }
    const percent = /^\s{0,2}(%|％|percent\b)/i.test(rest);
    if (!unit && !percent) unit = unitAfter(rest);

    // Plain integers keep every digit (no floating point), so long identifiers and large
    // counts that differ in the last digit stay different.
    const value = multiplier === 1 && !raw.includes(".") ? raw.replace(/^0+(?=\d)/, "") : canonicalValue(Number(raw) * multiplier);
    out.push({ canon: finish(negative ? "-" : "", value, percent, unit), index: start });
  }
}

const zhDigits: Record<string, number> = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };

function zhSection(section: string): number {
  let total = 0;
  let current = 0;
  for (const char of section) {
    if (char in zhDigits) current = zhDigits[char];
    else if (char === "十") {
      total += (current || 1) * 10;
      current = 0;
    } else if (char === "百") {
      total += current * 100;
      current = 0;
    } else if (char === "千") {
      total += current * 1000;
      current = 0;
    }
  }
  return total + current;
}

export function parseZhNumeral(run: string): number {
  let value = 0;
  let rest = run;
  const yi = rest.indexOf(ZH_HUNDRED_MILLION);
  if (yi >= 0) {
    value += (zhSection(rest.slice(0, yi)) || 1) * 1e8;
    rest = rest.slice(yi + 1);
  }
  const wan = rest.indexOf(ZH_TEN_THOUSAND);
  if (wan >= 0) {
    value += (zhSection(rest.slice(0, wan)) || 1) * 1e4;
    rest = rest.slice(wan + 1);
  }
  return value + zhSection(rest);
}

const zhCounters = "个名人次倍成吨米元年月日天岁件条家台辆位只项起例%％";

function zhTokens(text: string, out: NumberToken[]) {
  const pattern = new RegExp(`[零〇一二两三四五六七八九十百千]+(?:[${ZH_TEN_THOUSAND}${ZH_HUNDRED_MILLION}][零〇一二两三四五六七八九十百千]*)*`, "g");
  for (const match of text.matchAll(pattern)) {
    const run = match[0];
    const start = match.index;
    // A numeral glued to an Arabic number ("5千") is that number's multiplier, handled above.
    if (start > 0 && /[\d.]/.test(text[start - 1])) continue;
    const after = text.slice(start + run.length, start + run.length + 4);
    // A lone numeral character is usually part of a word, not a quantity, unless a counter follows.
    if (run.length === 1 && !(run !== "一" && after && zhCounters.includes(after[0]))) continue;
    const value = parseZhNumeral(run);
    if (!Number.isFinite(value) || value === 0) continue;
    const percent = /^\s{0,1}[%％]/.test(after);
    out.push({ canon: finish("", canonicalValue(value), percent, percent ? null : unitAfter(after)), index: start });
  }
}

const enUnits: Record<string, number> = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13,
  fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  seventy: 70, eighty: 80, ninety: 90,
};
const enScales: Record<string, number> = { thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 };
const enWord = [...Object.keys(enUnits), "hundred", ...Object.keys(enScales)].join("|");

function wordTokens(text: string, out: NumberToken[]) {
  const pattern = new RegExp(`\\b(?:${enWord})(?:(?:[ -]| and )(?:${enWord}))*\\b`, "gi");
  for (const match of text.matchAll(pattern)) {
    const words = match[0].toLowerCase().split(/[ -]/).filter((word) => word !== "and");
    if (words.length === 1 && (words[0] === "one" || words[0] === "zero")) continue;
    // "1.2 thousand": the scale word belongs to the Arabic number before it, handled above.
    if (/[\d.]\s{0,2}$/.test(text.slice(Math.max(0, match.index - 3), match.index))) continue;
    let total = 0;
    let current = 0;
    for (const word of words) {
      if (word in enUnits) current += enUnits[word];
      else if (word === "hundred") current = (current || 1) * 100;
      else {
        total += (current || 1) * enScales[word];
        current = 0;
      }
    }
    const rest = text.slice(match.index + match[0].length, match.index + match[0].length + 20);
    const percent = /^\s{0,2}(percent\b|%)/i.test(rest);
    out.push({ canon: finish("", canonicalValue(total + current), percent, percent ? null : unitAfter(rest)), index: match.index });
  }
}

export function numberTokens(text: string): NumberToken[] {
  const out: NumberToken[] = [];
  digitTokens(text, out);
  zhTokens(text, out);
  wordTokens(text, out);
  return out.sort((a, b) => a.index - b.index);
}

// Unique canonical figures in order of first appearance.
export function extractNumbers(text: string): string[] {
  return [...new Set(numberTokens(text).map((token) => token.canon))];
}

function split(canon: string): { value: string; unit: string } {
  if (canon.endsWith("%")) return { value: canon.slice(0, -1), unit: "%" };
  const space = canon.indexOf(" ");
  return space < 0 ? { value: canon, unit: "" } : { value: canon.slice(0, space), unit: canon.slice(space + 1) };
}

// Same value, and the same unit when both sides state one. A percentage never equals a bare number.
export function numbersMatch(left: string, right: string): boolean {
  if (left === right) return true;
  const a = split(left);
  const b = split(right);
  if (a.value !== b.value) return false;
  if (a.unit === b.unit) return true;
  if (a.unit === "%" || b.unit === "%") return false;
  return a.unit === "" || b.unit === "";
}

export type NumberComparison = {
  // every figure in the claim was found in the evidence sentence
  allFound: boolean;
  // the evidence gives figures of its own where the claim's are missing: same point, different numbers
  conflict: boolean;
  // figures of the same kind appear in a different order (e.g. swapped between two subjects)
  reordered: boolean;
};

export function compareNumbers(claim: NumberToken[], evidence: NumberToken[]): NumberComparison {
  const claimSet = [...new Set(claim.map((token) => token.canon))];
  const evidenceSet = [...new Set(evidence.map((token) => token.canon))];
  const unmatchedClaim = claimSet.filter((value) => !evidenceSet.some((other) => numbersMatch(value, other)));
  const unmatchedEvidence = evidenceSet.filter((value) => !claimSet.some((other) => numbersMatch(value, other)));
  const allFound = unmatchedClaim.length === 0;
  let reordered = false;
  if (allFound && claimSet.length >= 2) {
    // Within each unit, the claim's figures must appear in the evidence in the same order.
    const byUnit = new Map<string, string[]>();
    for (const value of claimSet) {
      const unit = split(value).unit;
      byUnit.set(unit, [...(byUnit.get(unit) ?? []), value]);
    }
    for (const group of byUnit.values()) {
      if (group.length < 2) continue;
      const positions = group.map((value) => evidence.find((token) => numbersMatch(value, token.canon))?.index ?? -1);
      if (positions.some((position, index) => index > 0 && position < positions[index - 1])) reordered = true;
    }
  }
  return { allFound, conflict: unmatchedClaim.length > 0 && unmatchedEvidence.length > 0, reordered };
}

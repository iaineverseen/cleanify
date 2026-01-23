const CommentRemover = {
  removeLuaComments(code) {
    let result = '';
    let i = 0;
    const len = code.length;

    while (i < len) {
      const char = code[i];

      if (char !== '-' && char !== '"' && char !== "'" && char !== '[') {
        result += char;
        i++;
        continue;
      }

      const nextChar = code[i + 1] || '';

      if (char === '"' || char === "'") {
        const r = this._parseStringFast(code, i, char, len);
        result += r.content;
        i = r.endIndex;
        continue;
      }

      if (char === '[') {
        const lb = this._matchLongBracketFast(code, i, false, len);
        if (lb) {
          result += lb.content;
          i = lb.endIndex;
          continue;
        }
        result += char;
        i++;
        continue;
      }

      if (char === '-' && nextChar === '-') {
        const after = i + 2;
        if (code[after] === '[') {
          const lb = this._matchLongBracketFast(code, after, true, len);
          if (lb) {
            i = lb.endIndex;
            if (code[i] === '\n') result += '\n', i++;
            continue;
          }
        }
        while (i < len && code[i] !== '\n') i++;
        if (code[i] === '\n') result += '\n', i++;
        continue;
      }

      result += char;
      i++;
    }
    return result;
  },

  _parseStringFast(code, start, quote, len) {
    let out = code[start];
    let i = start + 1;

    while (i < len) {
      const c = code[i];
      if (c === quote) {
        out += c;
        i++;
        break;
      }
      if (c === '\\' && i + 1 < len) {
        out += c + code[i + 1];
        i += 2;
        continue;
      }
      out += c;
      i++;
    }

    return { content: out, endIndex: i };
  },

  _matchLongBracketFast(code, start, isComment, len) {
    if (code[start] !== '[') return null;
    let i = start + 1;
    let eq = 0;

    while (code[i] === '=') eq++, i++;
    if (code[i] !== '[') return null;
    i++;

    const close = ']' + '='.repeat(eq) + ']';
    const end = code.indexOf(close, i);
    if (end === -1) return null;

    return {
      content: isComment ? '' : code.slice(start, end + close.length),
      endIndex: end + close.length
    };
  }
};
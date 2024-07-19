export function markedHighlight(options) {
  if (typeof options === 'function') {
    options = {
      highlight: options,
    }
  }

  if (!options || typeof options.highlight !== 'function')
    throw new Error('Must provide highlight function')

  if (typeof options.langPrefix !== 'string')
    options.langPrefix = 'language-'

  return {
    async: !!options.async,
    walkTokens(token) {
      if (token.type !== 'code')
        return

      const lang = getLang(token)

      if (options.async)
        return Promise.resolve(options.highlight(token.text, lang)).then(updateToken(token))

      const code = options.highlight(token.text, lang)
      updateToken(token)(code)
    },
    renderer: {
      code(code, infoString, escaped) {
        const lang = (infoString || '').match(/\S*/)[0]
        const classAttr = lang
          ? ` class="${options.langPrefix}${escape(lang)}"`
          : ''
        code = code.replace(/\n$/, '')
        const parsedCode = `<div class="hljs-code"><div class="pre-header"><span class="lang-info">${lang || 'plaintext'}</span><svg aria-hidden="true" class="svg-icon icon-copy"><use xlink:href="#icon-copy" fill="currentColor"></use></svg></div><pre class="syntax-pre"><code${classAttr}">${escaped ? code : escape(code, true)}\n</code></pre></div>`
        return parsedCode
      },
    },
  }
}

function getLang(token) {
  return (token.lang || '').match(/\S*/)[0]
}

function updateToken(token) {
  return (code) => {
    if (typeof code === 'string' && code !== token.text) {
      token.escaped = true
      token.text = code
    }
  }
}

// copied from marked helpers
const escapeTest = /[&<>"']/
const escapeReplace = new RegExp(escapeTest.source, 'g')
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g')
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&#39;',
}
const getEscapeReplacement = ch => escapeReplacements[ch]
function escape(html, encode) {
  if (encode) {
    if (escapeTest.test(html))
      return html.replace(escapeReplace, getEscapeReplacement)
  }
  else {
    if (escapeTestNoEncode.test(html))
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement)
  }

  return html
}

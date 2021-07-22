const rewire = require('rewire');
const wiki = rewire('../../src/wiki.js');

const sanitizeHTML = wiki.__get__('sanitizeHTML');

test('Test sanitizeHTML() in src/wiki.js', () => {
    let test_case = `<b>bold</b>, <strong>bold</strong>
<i>italic</i>, <em>italic</em>
<u>underline</u>, <ins>underline</ins>
<s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>
<b>bold <i>italic bold <s>italic bold strikethrough</s> <u>underline italic bold</u></i> bold</b>
<a href="http://www.example.com/">inline URL</a>
<a href="tg://user?id=123456789">inline mention of a user</a>
<code>inline fixed-width code</code>
<pre>pre-formatted fixed-width code block</pre>
<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>
The followings are unsupported:
<p>paragraph</p>
<div>division</div>
<span>span</span>
<ul>
  <li>unordered list item</li>
</ul>
<ol>
  <li>ordered list item</li>
</ol>`;
    let expected = `<b>bold</b>, <strong>bold</strong>
<i>italic</i>, <em>italic</em>
<u>underline</u>, <ins>underline</ins>
<s>strikethrough</s>, <strike>strikethrough</strike>, <del>strikethrough</del>
<b>bold <i>italic bold <s>italic bold strikethrough</s> <u>underline italic bold</u></i> bold</b>
<a href="http://www.example.com/">inline URL</a>
<a href="tg://user?id=123456789">inline mention of a user</a>
<code>inline fixed-width code</code>
<pre>pre-formatted fixed-width code block</pre>
<pre><code class="language-python">pre-formatted fixed-width code block written in the Python programming language</code></pre>
The followings are unsupported:
paragraph
division
span
  unordered list item
  ordered list item
`;
    expect(sanitizeHTML(test_case)).toBe(expected);
});
/* global $, Prism, marked, MathJax */

$.get('../linalg.js', function(code) {
  var blockIsComment = false;
  code.split(/\/\*|\*\//).forEach(function(block) {
    if (blockIsComment) {
      $('<div class="fancy-comment">').appendTo('body').html(marked(block.replace(/^\s*/mg, '').replace(/\\/g, "\\\\")));
    } else {
      $('<pre class="language-javascript">').appendTo('body').append($('<code>').text(block));
    }
    blockIsComment = !blockIsComment;
  });
  Prism.highlightAll();
  MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
});

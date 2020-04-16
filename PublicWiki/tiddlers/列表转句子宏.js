/*\

Macro to convert a list to Japanese comma saparated string

<<列表转句子宏 text:"* List to be converted" >>

<$macrocall $name=列表转句子宏 text={{我的奇妙清单}} />

\*/


exports.name = '列表转句子宏';

exports.params = [{ name: 'text', defalue: '' }];

exports.run = text => text
  .split(/\s?[*#]\s/)
  .filter(it => it)
  .join('、');



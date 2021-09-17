const BaseCodeBlockWidget = require('$:/core/modules/widgets/codeblock.js').codeblock;

// Hijack core codeblock widget render()
BaseCodeBlockWidget.prototype.render = function (parent, nextSibling) {
  this.parentDomNode = parent;
  this.computeAttributes();
  this.execute();
  const codeElement = this.document.createElement('code');
  const preElement = this.document.createElement('pre');
  codeElement.appendChild(this.document.createTextNode(this.getAttribute('code')));
  preElement.appendChild(codeElement);

  const language = this.getAttribute('language');
  const outputElement = this.document.createElement('pre');
  outputElement.style.display = 'none';
  if (['md', 'js', 'javascript', 'ts', 'typescript', 'bash', 'shell', 'sh', 'zsh'].includes(language)) {
    const executeButtonElement = this.document.createElement('button');
    executeButtonElement.innerText = 'ZX';
    executeButtonElement.className = 'code-block-zx-script-execution-button';
    executeButtonElement.addEventListener('click', () => {
      let fileName = 'tmp';
      let fileContent = this.getAttribute('code');
      switch (language) {
        case 'md': {
          fileName += '.md';
          break;
        }
        case 'js':
        case 'javascript': {
          fileName += '.mjs';
          break;
        }
        case 'ts':
        case 'typescript': {
          fileName += '.ts';
          break;
        }
        case 'bash':
        case 'zsh':
        case 'shell':
        case 'sh': {
          fileName += '.mjs';
          fileContent = fileContent
            .split('\n')
            .map((line) => `await \$\`${line.trim()}\`;`)
            .join('\n');
          break;
        }
        default: {
          outputElement.innerText = `ZX don't execute ${language}`;
          return;
        }
      }

      outputElement.innerText = '';
      outputElement.style.display = 'flex';
      window.observables.native
        .executeZxScript$({
          fileContent,
          fileName,
        })
        .subscribe((output) => {
          const prevText = outputElement.innerText;
          outputElement.innerText = `${prevText}${prevText ? '\n' : ''}${output ?? ''}`;
        });
    });

    parent.insertBefore(executeButtonElement, nextSibling);
  }

  parent.insertBefore(preElement, nextSibling);
  parent.insertBefore(outputElement, nextSibling);
  this.domNodes.push(preElement);
  if (this.postRender) {
    this.postRender();
  }
};

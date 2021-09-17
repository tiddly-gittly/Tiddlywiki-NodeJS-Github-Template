(function () {
  const Widget = require('$:/core/modules/widgets/widget.js').widget;

  class ZXExecuteButtonWidget extends Widget {
    /**
     * Lifecycle method: call this.initialise and super
     */
    constructor(parseTreeNode, options) {
      super(parseTreeNode, options);
      this.initialise(parseTreeNode, options);
    }

    /**
     * Lifecycle method: Render this widget into the DOM
     */
    render(parent, nextSibling) {
      this.parentDomNode = parent;
      this.computeAttributes();
      const importButton = this.document.createElement('button');
      importButton.classList.add('tc-btn-invisible');
      importButton.innerHTML = `${$tw.wiki.getTiddlerText(
        '$:/plugins/linonetwo/zx-script/zx-icon',
      )}<span class="tc-btn-text tc-button-zx-script-caption">${$tw.wiki.getTiddlerText('$:/plugins/linonetwo/zx-script/zx-button-caption')}</span>`;
      importButton.onclick = this.onExecuteButtonClick.bind(this);
      importButton.title = importButton.ariaLabel = 'ZX';
      parent.insertBefore(importButton, nextSibling);
      this.domNodes.push(importButton);
    }

    /**
     * Event listener of button
     */
    async onExecuteButtonClick() {
      const title = this.getAttribute('title');
      if (!title) return;
      const type = this.getAttribute('type') || 'text/vnd.tiddlywiki';
      const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${title}`;
      let fileName = title;
      let fileContent = this.getAttribute('content', '');
      // add mjs or md to the end
      if (!fileName.endsWith('.mjs') && !fileName.endsWith('.js') && !fileName.endsWith('.md')) {
        switch (type) {
          // try fit everything that may have ```js block into md
          case 'text/vnd.tiddlywiki':
          case 'text/plain':
          case 'text/markdown':
          case 'text/x-markdown':
          case 'text/html': {
            fileName += '.md';
            break;
          }
          case 'application/javascript':
          default: {
            fileName += '.mjs';
            break;
          }
        }
      }

      $tw.wiki.setText(stateTiddlerTitle, 'text', undefined, '');
      window.observables.native
        .executeZxScript$({
          fileContent,
          fileName,
        })
        .subscribe((output) => {
          const prevText = $tw.wiki.getTiddlerText(stateTiddlerTitle);
          $tw.wiki.setText(stateTiddlerTitle, 'text', undefined, `${prevText ?? ''}\n${output ?? ''}`);
        });
    }
  }

  exports['execute-zx-script'] = ZXExecuteButtonWidget;
})();

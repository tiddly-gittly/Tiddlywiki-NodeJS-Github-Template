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
      importButton.innerHTML = $tw.wiki.getTiddlerText('$:/plugins/linonetwo/zx-script/zx-icon.svg');
      importButton.onclick = this.onExecuteButtonClick.bind(this);
      importButton.title = importButton.ariaLabel = 'ZX';
      parent.insertBefore(importButton, nextSibling);
      this.domNodes.push(importButton);
    }

    /**
     * Event listener of button
     */
    async onExecuteButtonClick() {
      const title = this.getAttribute('title', 'aaa.mjs');
      const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${title}`;
      let fileName = title;
      let fileContent = this.getAttribute('content', '');
      if (!fileName.endsWith('.mjs') && !fileName.endsWith('.md')) {
        fileName += '.mjs';
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

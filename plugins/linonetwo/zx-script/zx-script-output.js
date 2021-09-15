(function () {
  const Widget = require('$:/core/modules/widgets/widget.js').widget;

  class ZXOutputWidget extends Widget {
    /**
     * Lifecycle method: call this.initialise and super
     */
    constructor(parseTreeNode, options) {
      super(parseTreeNode, options);
      this.initialise(parseTreeNode, options);
    }

    get stateTiddlerTitle() {
      const title = this.getAttribute('title', 'aaa.mjs');
      const stateTiddlerTitle = `$:/state/linonetwo/zx-script/output/${title}`;
      return stateTiddlerTitle;
    }

    /**
     * Lifecycle method: Render this widget into the DOM
     */
    render(parent, nextSibling) {
      this.parentDomNode = parent;
      this.computeAttributes();

      const outputElement = this.document.createElement('article');
      outputElement.innerHTML = ($tw.wiki.getTiddlerText(this.stateTiddlerTitle) ?? '')
        .split('\n')
        .map((line) => `<div>${line}</div>`)
        .join('');
      parent.insertBefore(outputElement, nextSibling);
      this.domNodes.push(outputElement);
    }

    refresh(changedTiddlers) {
      if (this.stateTiddlerTitle in changedTiddlers && changedTiddlers[this.stateTiddlerTitle]?.modified) {
        this.refreshSelf();
        return true;
      }
      return false;
    }
  }

  exports['zx-script-output'] = ZXOutputWidget;
})();

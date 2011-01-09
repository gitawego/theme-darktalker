/**
 * @module darktalker-modules
 * @namespace Darktalker.modules
 */
dojo.provide("Darktalker.modules.SearchList");
dojo.require("dijit._Widget");
dojo.require("dojox.dtl._DomTemplated");
/**
 * parse fetched search data, and generate a domNode
 * <pre class="brush:js">
 * var searchDtl = new Darktalker.modules.SearchList({
 *                   storeData:result
 *               }, node);
 * </pre>
 * @class SearchList
 * @constructor
 * @param {Object} storeData
 * @extends dojox.dtl._DomTemplated
 * @see <a href="http://dojocampus.org/content/2009/04/17/dojo-dtl-basics/">dojox.dtl</a>
 */
dojo.declare("Darktalker.modules.SearchList",
        [dijit._Widget, dojox.dtl._DomTemplated],
{
    /**
     * @config templatePath
     */
    templatePath: dojo.moduleUrl("Darktalker.modules.resources", "SearchList.html"),
    /**
     * set/renew store data
     * @method setData
     * @param {Object} data
     * @param {Boolean} autoBuild
     */
    setData:function(data,autoBuild){
        this.storeData = data;
        if(autoBuild){
            this.domNode.innerHTML = "";
            this.buildRendering();
        }
    }
});
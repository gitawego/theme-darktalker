/**
 * @module helpers
 */
dojo.provide("Darktalker.helpers._base");
/**
 * @namespace Darktalker
 * @class helpers
 */
dojo.mixin(Darktalker.helpers, {
    /**
     * get an object length
     * @method size
     * @param obj
     */
    size:function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    namespace:function(parts, create, context) {
        parts = parts.split(".");
        var obj = context || window;
        for (var i = 0, p; obj && (p = parts[i]); i++) {
            obj = p in obj ? obj[p] : create ? (obj[p] = {}) : undefined;
        }
        return obj;
    },
    keys: function(obj) {
        var keys_array = [];
        for (var property_name in obj) {
            if (!obj.hasOwnProperty(property_name)) {
                continue;
            }
            keys_array.push(property_name);
        }
        return keys_array;
    },
    /**
     * scrollTo animation, specific for darktalker theme of yuidoc
     * @method scrollTo
     * @param id
     * @param type
     * @param domNode
     */
    scrollTo:function(id, type, domNode) {
        var node;
        domNode = domNode || dojo.doc;
        type = type || "id";
        if (type == "id") {
            node = dojo.byId(id);
        }
        if (type == "name") {
            node = dojo.query("*[name='" + id + "']", domNode)[0];
        }
        var block = dojo.query("*[resource='#" + id + "']", domNode)[0];
        var anim1 = dojox.fx.smoothScroll({
            node:node,
            win:domNode,
            duration:400
        });
        var anim2 = dojox.fx.highlight({
            node:block,
            duration:1000
        });
        dojo.fx.chain([anim1,anim2]).play();
    },
    /**
     * Performs parameterized substitutions on a string. Throws an
     * exception if any parameter is unmatched.
     * @method substitute
     * @see <a href="http://dojotoolkit.org/api/1.5/dojo/string/substitute">dojo.string.substitute</a>
     * @param {string} template
     * @param {Object|Array} map
     * @param {Function} transform optional
     * @param {Object} thisObject optional
     * @param {Array} customTags optional template symbol,start tag, end tag.
     */
    substitute: function(template, map, transform, thisObject, customTags) {
        customTags = customTags || ["$","{","}"];
        thisObject = thisObject || dojo.global;
        transform = transform ?
                dojo.hitch(thisObject, transform) : function(v) {
            return v;
        };
        var reg = new RegExp('\\' + customTags[0] + '\\' + customTags[1] + '([\^\s\\:\\}]+)(?:\\:([^\\s\\:\\' + customTags[2] + ']+))?\\}', "g");
        try {
            return template.replace(reg,
                                   function(match, key, format) {
                                       var value = dojo.getObject(key, false, map);
                                       if (format) {
                                           value = dojo.getObject(format, false, thisObject).call(thisObject, value, key);
                                       }
                                       return transform(value, key).toString();
                                   }); // String
        } catch(e) {
            console.error("substitute error", e);
        }

    },
    isArray:function(v) {
        return Object.prototype.toString.apply(v) === '[object Array]';
    },
    isObject:function() {
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    },
    sortByKeyName:function(obj) {
        if (dojo.isArray(obj)) {
            return obj.sort();
        }
        var dlf = dojox.lang.functional;
        var sortedKeys = dlf.keys(obj).sort();
        var newObj = {};
        dojo.forEach(sortedKeys, function(key) {
            newObj[key] = obj[key];
        });
        return newObj;
    }
});
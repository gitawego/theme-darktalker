/**
 * darktalker ajax theme for yuidoc
 * @module darktalker
 */
dojo.provide("Darktalker");
dojo.require("dijit.dijit"); // optimize: load dijit layer

dojo.require("dojox.layout.ExpandoPane");
dojo.require("dojo.data.ItemFileWriteStore");
//dojo.require("dijit.form.ComboBox");
dojo.require("dijit.Tree");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.form.ComboBox");
//dojo.require("dojox.layout.FloatingPane");
dojo.require("dojo.fx.easing");
//dojo.require("dojox.rpc.Service");
dojo.require("dojox.lang.functional");
dojo.require("dojox.lang.utils");
dojo.require('dojox.fx.scroll');
dojo.require('dojox.fx');
dojo.require("dojox.json.query");


(function(){
	var pathName = window.location.pathname.split('/');
	if(pathName[pathName.length-1].split('\.').length>1){
		pathName.pop();
	}
	console.log(pathName);
	pathName = pathName.join('/');
	dojo.registerModulePath("Darktalker", pathName + "/assets/darktalker");
})();
//dojo.require("dojo.io.script");

//var Darktalker;
(function() {

    var win = window;
    var doc = document;
    /**
     * @class Darktalker
     */
    Darktalker = {
        /**
         * @config config
         */
        config:{
            //locale:"en-us",
            extraLocale:["fr-fr","zh-cn"],
            tplTag:["@","{","}"]
        },
        /**
         * @type object widgets
         */
        widgets:{},
        /**
         * initialize basic view
         * @method init
         *
         */
        init:function() {
            var $this = this;
            dojo.locale = (function() {
                var params = dojo.queryToObject(window.location.href.split('?').pop());
                return params.lang || ($this.config.locale || dojo.locale);
            })();
            dojo.byId("container").innerHTML = "";
            this.widgets.borderContainer = new dijit.layout.BorderContainer({
                id: "borderContainer",
                design: "horizontal",
                selected:true
            },dojo.byId("container"));

            this.widgets.center = new dijit.layout.ContentPane({
                id: "center",
                region: "center",
                content:"<div id='centerTabs'><\/div>"
            }).placeAt(this.widgets.borderContainer);

            this.widgets.left = new dojox.layout.ExpandoPane({
                id: "left",
                title: this.dic("API_DOC"),
                region: "left",
                splitter:true,
                content:"<div id='menuTabs'>" + this.dic("LOADING") + "<\/div>",
                style: "width: 25%; height: 100%;"
            }).placeAt(this.widgets.borderContainer);

            dojo.xhrGet({
                url:"raw.json",
                handleAs:"json"
            }).then(function(data) {
                $this.data = $this.sortData(data);
                $this.initLayout();
            });
        },
        /**
         * sort raw data before generate tree
         * @param {Object} data
         * @return Object
         */
        sortData:function(data) {
            var $this = this;
            var dlf = dojox.lang.functional;
            var rootKeys = ["classmap","filemap","modules"];
            var newObj = {};
            dojo.forEach(rootKeys, function(rootKey) {
                var subItems = $this.helpers.sortByKeyName(data[rootKey]);
                dlf.forEach(subItems, function(subItem, subKey) {
                    if (dojo.isObject(subItem)) {
                        subItems[subKey] = $this._sortData(subItem);
                    }
                });
                newObj[rootKey] = subItems;
            });
            return newObj;
        },
        /**
         * @method _sortData
         * @private
         * @param {Object} items
         * @return Object
         */
        _sortData:function(items) {
            var dlf = dojox.lang.functional;
            dlf.forEach(items, function(item, key) {
                if (dojo.isObject(item)) {
                    items[key] = this.helpers.sortByKeyName(item);
                    items[key] = this._sortData(items[key]);
                }
            }, this);
            return items;
        },
        /**
         * get translation from dictionary
         * @method dic
         * @param {String} tag
         * @param {String} language
         * @param {String|Object} config
         * @return {String}
         */
        dic:function(tag, language, config) {
            return this._dicPkg(language, config)[tag] || "[" + tag + "]";
        },
        /**
         * get dictionary package
         * @method _dicPkg
         * @private
         * @param {String} language
         * @param {String|Object} config
         * @return {Mixed} object or null
         */
        _dicPkg:function(language, config) {
            var dlu = dojox.lang.utils;
            language = language || dojo.locale;
            if (!config) {
                return dlu.merge(dojo.i18n.getLocalization("Darktalker", "base", "en"), dojo.i18n.getLocalization("Darktalker", "base", language));
            }
            if (typeof config == "object") {
                return dlu.merge(dojo.i18n.getLocalization(config.pkg, config.bundle, "en"), dojo.i18n.getLocalization(config.pkg, config.bundle, language));
            }
            return dlu.merge(dojo.i18n.getLocalization("Darktalker", config, "en"), dojo.i18n.getLocalization("Darktalker", config, language));
        },
        /**
         * initialize layout, build left menu and center body
         * @method initLayout
         */
        initLayout:function() {
            console.log(this.data);
            dojo.byId('menuTabs').innerHTML = "";
            this.buildLeftMenu();
            this.buildContentContainer();
            this.widgets.borderContainer.startup();
        },
        /**
         * @method buildLeftMenu
         */
        buildLeftMenu:function() {
            var dlf = dojox.lang.functional,$this = this;
            this.widgets.leftMenu = new dijit.layout.TabContainer({
                style:'height:100%;width:100%;',
                tabStrip:true,
                tabPosition:"top"
            }, dojo.byId('menuTabs'));
            dlf.forEach(this.data, function(item, key) {
                if (['classmap','modules','filemap'].indexOf(key) == -1) {
                    return;
                }
                this.widgets[key] = this[key + "Builder"](item);
                this.widgets.leftMenu.addChild(this.widgets[key]);
            }, this);
            this.widgets.leftMenu.startup();
        },
        /**
         * add search function into the welcome tab
         * @method addSearch
         */
        addSearch:function() {
            if (this.widgets.searchCombo) {
                return;
            }
            var $this = this;
            var comboInput = doc.createElement("input");
            comboInput.id = "searchCombo";
            var searchInputBlock = dojo.create("div", {
                className:"searchInputBlock",
                innerHTML:"<label for='" + comboInput.id + "'>" + this.dic("SEARCH") + " : <\/label>"
            });
            searchInputBlock.appendChild(comboInput);
            dojo.create("div", {
                id:"welcomeContainer",
                innerHTML:"<div id='welcomeHeader'><\/div><div id='welcomeBody'><\/div><div id='welcomeFooter'><\/div>"
            }, this.welcomeTab.domNode, "last");
            dojo.byId("welcomeHeader").appendChild(searchInputBlock);
            var searchContainer = doc.createElement("div");
            searchContainer.id = "searchContainer";
            dojo.byId("welcomeBody").appendChild(searchContainer);

            this.widgets.searchCombo = new dijit.form.ComboBox({
                id: comboInput.id,
                name: "searchCombo",
                value: "",
                store: this.modulesStore.store.store,
                onChange:function(value) {

                    $this.genSearchList(value, searchContainer);
                },
                query:{
                    type:/class|method|event|config|property|module/i
                },
                searchAttr: "label"
            }, comboInput);
        },
        /**
         * generate search result
         * @method genSearchList
         * @param {String} label
         * @param {HTMLElement} node
         * @uses Darktalker.modules.SearchList
         * @uses dojox.json.query
         */
        genSearchList:function(label, node) {
            var result = dojox.json.query("$..[?label='" + label + "']", this.moduleOriginalStore);
            if (this.searchDtl) {
                this.searchDtl.setData(result, true);
            } else {
                this.searchDtl = new Darktalker.modules.SearchList({
                    storeData:result
                }, node);
            }
            this.parseLinks(this.searchDtl);
        },
        /**
         * @event onClickModuleTree
         * @param {dojo.data.ItemFileWriteStore} node an item of store
         * @param {dijit.Tree} treeModel
         * @param {dojo.data.ItemFileWriteStore} store
         * @param {Event} evt
         */
        onClickModuleTree:function(node, treeModel, store, evt) {
            if (store.getValue(node, 'type') == "folder") {
                return;
            }
            var cls = store.getValue(node, "class") || store.getValue(node, "link");
            var fileName = cls + ".html",panel,$this = this;
            var type = store.getValue(node, 'type');
            if (type == "module") {
                fileName = "module_" + fileName;
            }
            this.openTab({
                id:fileName,
                title:cls,
                href:fileName,
                iconClass:["class","method","event","config","property"].indexOf(type) != -1 ? "icon class" : (type == "module" ? "icon module" : "dijitIcon"),
                closable:true,
                selected:true
            }, function(panel) {
                if (store.getValue(node, 'class')) {
                    $this.helpers.scrollTo(type + "_" + store.getValue(node, 'link'), "name", panel.domNode);
                }
            });
        },
        /**
         * build modules tab
         * @method modulesBuilder
         * @param {Object} config
         */
        modulesBuilder:function(config) {
            var $this = this;
            var treeContainerId = "modules_treeContainer";
            return new dijit.layout.ContentPane({
                title: this.dic("MODULES"),
                selected:true,
                content:"<div id='" + treeContainerId + "'><\/div>",
                onShow:function() {
                    if (!$this.modulesStore) {
                        $this.modulesStore = {
                            id:treeContainerId,
                            store:$this._buildModulesStore(config)
                        };
                        $this.buildModulesTree();
                    }

                    $this.addSearch();
                }
            });
        },
        /**
         * @method buildModulesTree
         */
        buildModulesTree:function() {
            var widgetId = "treeModel_" + this.modulesStore.id,$this = this;
            var store = this.modulesStore.store.store;
            this.widgets[widgetId] = this.widgets[widgetId] || new dijit.Tree({
                showRoot:false,
                model: this.modulesStore.store,
                onClick:function(node, treeModel, evt) {
                    $this.onClickModuleTree(node, treeModel, store, evt)
                },
                getIconClass:function(node, opened) {
                    var cls;
                    if (this.model.mayHaveChildren(node)) {
                        cls = opened ? "dijitFolderOpened" : "dijitFolderClosed";
                        if (!node.root) {
                            if (store.getValue(node, "type") == "module") {
                                cls = "icon module";
                            }
                            if (store.getValue(node, "type") == "class") {
                                cls = "icon class";
                            }
                            if (store.getValue(node, "type") == "folder") {
                                cls = "icon brick";
                                if (store.hasAttribute(node, "contentType")) {
                                    cls = "icon " + store.getValue(node, "contentType") + "_folder" + (opened ? "_open" : "");
                                }

                            }
                        }

                    } else {
                        cls = "dijitLeaf";
                        var type = store.getValue(node, "type");
                        if (['method','property'].indexOf(type) != -1) {
                            cls = "icon " + type;
                            if (store.getValue(node, "static")) {
                                cls = "icon ${type}Static";
                            }
                            if (store.getValue(node, "private")) {
                                cls = "icon ${type}Private";
                            }
                            if (store.getValue(node, "protected")) {
                                cls = "icon ${type}Protected";
                            }
                            cls = dojo.string.substitute(cls, {
                                type:type
                            });
                        }
                        if (store.getValue(node, "type") == "config") {
                            cls = "icon config";
                        }
                        if (store.getValue(node, "type") == "event") {
                            cls = "icon event";
                        }
                        if (store.getValue(node, "type") == "class") {
                            cls = "icon class";
                        }

                    }
                    return !node || cls;
                }
            }, dojo.byId(this.modulesStore.id));
        },
        /**
         * @method _buildModulesStore
         * @private
         * @param {Object} config
         */
        _buildModulesStore:function(config) {
            var dlf = dojox.lang.functional;
            var store = {
                identifier:"id",
                label:"label",
                items:[]
            };
            dlf.forEach(config, function(module, mName) {
                var mIdx = store.items.push({
                    id:"module_" + mName,
                    label:mName,
                    description:module.description,
                    link:module.name,
                    type:"module",
                    children:[]
                });

                dojo.forEach(['classlist','filelist','submodules'], function(listType) {
                    if (module[listType].length > 0) {
                        var idx = store.items[mIdx - 1].children.push({
                            id:mName + "/" + listType,
                            label:this.dic(listType.toUpperCase()),
                            type:"folder",
                            children:[]
                        });
                        var typeChild = store.items[mIdx - 1].children[idx - 1].children;
                        dojo.forEach(module[listType], function(typeName) {
                            var link = typeName,classStoreItems,type,description;
                            switch (listType) {
                                case "classlist":
                                    type = "class";
                                    link = this.data.classmap[typeName].name;
                                    description = this.data.classmap[typeName].description;
                                    classStoreItems = this._buildClassmapStore(this.data.classmap, true, {
                                        storeClsName:typeName,
                                        moduleName:mName
                                    });
                                    break;
                                case "filelist":
                                    type = "file";
                                    break;
                                case "submodules":
                                    type = "submodule";
                                    link = module.subdata[typeName].name;
                                    break;
                            }
                            var typeConfig = {
                                id:mName + "/" + listType + "/" + typeName,
                                label:typeName,
                                link:link,
                                type:type
                            };
                            if (description) {
                                typeConfig.description = description;
                            }
                            if (classStoreItems && classStoreItems.children) {

                                typeConfig.children = classStoreItems.children;
                            }
                            typeChild.push(typeConfig);
                        }, this);
                    }
                }, this);
            }, this);
            this.moduleOriginalStore = this.moduleOriginalStore || dojo.clone(store);
            var dataStore = new dojo.data.ItemFileWriteStore({
                data:store
            });
            return new dijit.tree.ForestStoreModel({
                store: dataStore,
                query:{
                    id:"*"
                },
                //rootId: "root",
                rootLabel: this.dic("MODULESLIST"),
                childrenAttrs: ["children"]
            });
        },
        /**
         * @method classmapBuilder
         * @param {Object} config
         */
        classmapBuilder:function(config) {
            var dlf = dojox.lang.functional;
            var $this = this;
            var treeContainerId = "classmap_treeContainer";

            return new dijit.layout.ContentPane({
                title: this.dic("CLASSES"),
                content:"<div id='" + treeContainerId + "'><\/div>",
                onShow:function() {
                    console.log("show class");
                    if ($this.classmapStore) {
                        return;
                    }
                    $this.classmapStore = {
                        id:treeContainerId,
                        store:$this._buildClassmapStore(config)
                    };
                    $this.buildClassmapTree();
                }
            });
        },
        /**
         * @method buildClassmapTree
         */
        buildClassmapTree:function() {
            var widgetId = "treeModel_" + this.classmapStore.id,$this = this;
            var store = this.classmapStore.store.store;
            this.widgets[widgetId] = this.widgets[widgetId] || new dijit.Tree({
                showRoot:false,
                model: this.classmapStore.store,
                onClick:function(node, treeModel, evt) {
                    $this.onClickClassTree(node, treeModel, store, evt)
                },
                getIconClass:function(node, opened) {
                    var cls;
                    if (this.model.mayHaveChildren(node)) {
                        cls = opened ? "dijitFolderOpened" : "dijitFolderClosed";
                        if (!node.root) {
                            if (store.getValue(node, "type") == "class") {
                                cls = "icon class";
                            }
                            if (store.getValue(node, "type") == "folder") {
                                cls = "icon brick";
                                if(store.hasAttribute(node, "contentType")){
                                    cls = "icon " + store.getValue(node, "contentType") + "_folder" + (opened ? "_open" : "");
                                }
                            }
                        }

                    } else {
                        cls = "dijitLeaf";
                        var type = store.getValue(node, "type");
                        if (['method','property'].indexOf(type) != -1) {
                            cls = "icon " + type;
                            if (store.getValue(node, "static")) {
                                cls = "icon ${type}Static";
                            }
                            if (store.getValue(node, "private")) {
                                cls = "icon ${type}Private";
                            }
                            if (store.getValue(node, "protected")) {
                                cls = "icon ${type}Protected";
                            }
                            cls = dojo.string.substitute(cls, {
                                type:type
                            });
                        }
                        if (['config','event','class'].indexOf(type) != -1) {
                            cls = "icon " + type;
                        }

                    }
                    return !node || cls;
                }
            }, dojo.byId(this.classmapStore.id));

        },
        /**
         * @event onClickClassTree
         * @param {dojo.data.ItemFileWriteStore} node an item of store
         * @param {dijit.Tree} treeModel
         * @param {dojo.data.ItemFileWriteStore} store
         * @param {Event} evt
         */
        onClickClassTree:function(node, treeModel, store, evt) {
            if (store.getValue(node, 'type') == "folder") {
                return;
            }
            var cls = store.getValue(node, "class") || store.getValue(node, "link");
            var fileName = cls + ".html",panel,$this = this;
            var type = store.getValue(node, 'type');
            this.openTab({
                id:fileName,
                title:cls,
                href:fileName,
                iconClass:["class","method","event","config","property"].indexOf(type) != -1 ? "icon class" : "dijitIcon",
                closable:true,
                selected:true
            }, function(panel) {
                if (store.getValue(node, 'class')) {

                    $this.helpers.scrollTo(type + "_" + store.getValue(node, 'link'), "name", panel.domNode);
                }
            });
        },
        /**
         * @method _buildClassmapStore
         * @private
         * @param {Object} config
         * @param {Boolean} onlyStore
         * @param {Object} storeClsConfig
         * @return {ojo.data.ItemFileWriteStore|dijit.tree.ForestStoreModel}
         */
        _buildClassmapStore:function(config, onlyStore, storeClsConfig) {
            var store,clsStore;
            storeClsConfig = storeClsConfig || {};
            var prefix = storeClsConfig.moduleName ? storeClsConfig.moduleName + "/classlist/" : "";
            var fetchItemInStore = dojo.hitch(this, function() {
                var item = dojox.json.query('$..[?id="'+(prefix + storeClsConfig.storeClsName)+'"]',this.classOriginalStore.items)[0];
                return dojo.clone(item);
            });
            
            if (onlyStore && this.classOriginalStore) {
                return fetchItemInStore();
            }
            
            store = this._buildClassmapStoreOnly(config, onlyStore, storeClsConfig);
            
            if (onlyStore) {
                return fetchItemInStore();
            }

            var dataStore = new dojo.data.ItemFileWriteStore({
                data:this._buildClassLayoutStore(store,config)
            });
            return new dijit.tree.ForestStoreModel({
                store: dataStore,
                //rootId: "root",
                rootLabel: this.dic("CLASSLIST"),
                childrenAttrs: ["children"]
            });
        },
        _buildClassLayoutStore:function(store,config){
            var _store = {
                identifier:"id",
                label:"label",
                items:[]
            },dlf = dojox.lang.functional,clsKeys = this.helpers.keys(config);
            var stru = {};
            dojo.forEach(clsKeys,function(clsKey){
                this._namespace(clsKey,true,_store,store);
            },this);
            console.log(_store);
            return _store;
        },
        _namespace:function(parts, create, store,originalStore) {
            parts = parts.split(".");
            var obj = store.items,result,idx;
            var _getItem = function(ns){
                 var item = dojox.json.query("$..[?fullNS='" + ns.join(".") + "']", originalStore.items)[0];
                 item = dojo.clone(item);
                 item.label = parts[parts.length-1];
                 return item;
            };
            for (var i = 0, p; obj && (p = parts[i]); i++) {
                //obj = p in obj ? obj[p] : create ? (obj[p] = {}) : undefined;

                var results = dojox.json.query("$..[?label='"+p+"']",store.items),_item;
                if(results.length == 0){
                    if (i == 0) {
                        _item = i == parts.length - 1 ? _getItem(parts) : {
                            id:"classNode_" + parts.join(".") + i,
                            label:p,
                            type:"folder",
                            children:[]
                        };
                        idx = obj.push(_item);
                        obj = obj[idx-1];
                        continue;
                    }
                    _item = i == parts.length - 1 ? _getItem(parts) : {
                        id:"classNode_" + parts.join(".") + i,
                        label:p,
                        type:"folder",
                        children:[]
                    };
                    idx = obj.children.push(_item);
                    obj = obj.children[idx-1];
                    continue;
                }
                obj = results[0];
            }
            return obj;
        },
        _buildClassmapStoreOnly:function(config, onlyStore, storeClsConfig){
            var store = {
                identifier:"id",
                label:"label",
                items:[]
            },dlf = dojox.lang.functional;
            
            storeClsConfig = storeClsConfig || {};

            dlf.forEach(config, function(cls, clsName) {
                var prefix = cls.module ? cls.module + "/classlist/" : "";
                var classPrefix = prefix + clsName;
                var idx = store.items.push({
                    id:classPrefix,
                    link:clsName,
                    fullNS:clsName,
                    label:clsName,
                    type:"class"
                });
                var _idx;
                if (this.helpers.size(cls.methods) > 0) {
                    store.items[idx - 1].children = [];
                    _idx = store.items[idx - 1].children.push({
                        id:classPrefix + "/methods",
                        label:this.dic("METHODS"),
                        contentType:"method",
                        type:"folder",
                        children:[]
                    });
                    var methodChild = store.items[idx - 1].children[_idx - 1].children;
                    dlf.forEach(cls.methods, function(method, methodName) {
                        methodChild.push({
                            id:classPrefix + "/methods/" + methodName,
                            label:methodName,
                            link:methodName,
                            description:method.description,
                            type:"method",
                            "protected":"protected" in method,
                            "static":"static" in method,
                            "private":"private" in method,
                            "class":clsName
                        });
                    });
                }
                if (this.helpers.size(cls.configs) > 0) {
                    store.items[idx - 1].children = store.items[idx - 1].children || [];
                    _idx = store.items[idx - 1].children.push({
                        id:classPrefix + "/configs",
                        label:this.dic("CONFIGS"),
                        contentType:"config",
                        type:"folder",
                        children:[]
                    });
                    var configChild = store.items[idx - 1].children[_idx - 1].children;
                    dlf.forEach(cls.configs, function(config, configName) {
                        configChild.push({
                            id:classPrefix + "/configs/" + configName,
                            label:configName,
                            description:config.description,
                            link:configName,
                            type:"config",
                            "class":clsName
                        });
                    });
                }
                if (this.helpers.size(cls.events) > 0) {
                    store.items[idx - 1].children = store.items[idx - 1].children || [];
                    _idx = store.items[idx - 1].children.push({
                        id:classPrefix + "/events",
                        label:this.dic("EVENTS"),
                        contentType:"event",
                        type:"folder",
                        children:[]
                    });
                    var eventChild = store.items[idx - 1].children[_idx - 1].children;
                    dlf.forEach(cls.events, function(e, eName) {
                        eventChild.push({
                            id:classPrefix + "/events/" + eName,
                            label:eName,
                            description:e.description,
                            link:eName,
                            type:"event",
                            "class":clsName
                        });
                    });
                }
                if (this.helpers.size(cls.properties) > 0) {
                    store.items[idx - 1].children = store.items[idx - 1].children || [];
                    _idx = store.items[idx - 1].children.push({
                        id:classPrefix + "/properties",
                        label:this.dic("PROPERTIES"),
                        contentType:"property",
                        type:"folder",
                        children:[]
                    });
                    var propertyChild = store.items[idx - 1].children[_idx - 1].children;
                    dlf.forEach(cls.properties, function(property, propertyName) {
                        propertyChild.push({
                            id:classPrefix + "/properties/" + propertyName,
                            label:propertyName,
                            link:propertyName,
                            description:property.description,
                            type:"property",
                            "protected":"protected" in property,
                            "static":"static" in property,
                            "private":"private" in property,
                            "class":clsName
                        });
                    });
                }
            }, this);
            this.classOriginalStore = dojo.clone(store);
            return store;
        },
        /**
         * @method filemapBuilder
         * @param {Object} config
         * @return dijit.layout.ContentPane
         */
        filemapBuilder:function(config) {
            var treeContainerId = "filemap_treeContainer",$this = this;

            return new dijit.layout.ContentPane({
                title: this.dic("FILES"),
                content:"<div id='" + treeContainerId + "'><\/div>",
                onShow:function() {
                    if($this.filemapStore){
                        return;
                    }
                    $this.filemapStore = {
                        id:treeContainerId,
                        store:$this._buildFilemapStore(config)
                    };
                    $this.buildFilemapTree();
                }
            });
        },
        /**
         * @method buildFilemapTree
         */
        buildFilemapTree:function() {
            var widgetId = "treeModel_" + this.filemapStore.id,$this = this;
            this.widgets[widgetId] = this.widgets[widgetId] || new dijit.Tree({
                showRoot:false,
                model: this.filemapStore.store,
                onClick:function(node, treeModel, evt) {
                    $this.onClickFileTree(node, treeModel, $this.filemapStore.store.store, evt)
                }
            }, dojo.byId(this.filemapStore.id));
        },
        /**
         * @event onClickFileTree
         * @param {dojo.data.ItemFileWriteStore} node an item of store
         * @param {dijit.Tree} treeModel
         * @param {dojo.data.ItemFileWriteStore} store
         * @param {Event} evt
         */
        onClickFileTree:function(node, treeModel, store, evt) {
            var type = store.getValue(node, "type");
            if (type == "folder") {
                return;
            }
            var fileName = store.getValue(node, "link") + ".html";
            this.openTab({
                id:fileName,
                title:store.getValue(node, "label"),
                href:fileName,
                closable:true,
                selected:true
            });
        },
        /**
         * @method _buildFilemapStore
         * @private
         * @param config
         * @return dijit.tree.ForestStoreModel
         */
        _buildFilemapStore:function(config) {
            var dlf = dojox.lang.functional;
            var store = {
                identifier:"id",
                label:"label",
                items:[]
            };
            dlf.forEach(config, function(file, fileName) {
                var idx = store.items.push({
                    id:fileName,
                    label:fileName,
                    link:file.name,
                    type:"file",
                    children:[]
                });
                if (file.classlist.length > 0) {
                    var _idx = store.items[idx - 1].children.push({
                        id:fileName + "_classlist",
                        label:this.dic("CLASSES"),
                        type:"folder",
                        children:[]
                    });
                    var classChild = store.items[idx - 1].children[_idx - 1].children;
                    dojo.forEach(file.classlist, function(cls) {
                        classChild.push({
                            type:"class",
                            label:cls,
                            id:fileName + "_" + cls,
                            link:cls
                        });
                    });
                }
                store.items[idx - 1].children.push({
                    id:fileName + "_module",
                    label:file.module,
                    link:file.module,
                    type:"module"
                });
            }, this);
            var dataStore = new dojo.data.ItemFileWriteStore({
                data:store
            });
            return new dijit.tree.ForestStoreModel({
                store: dataStore,
                //rootId: "root",
                rootLabel: this.dic("FILELIST"),
                childrenAttrs: ["children"]
            });
        },
        /**
         * @method buildContentContainer
         */
        buildContentContainer:function() {
            this.widgets.contentContainer = new dijit.layout.TabContainer({
                style:'height:100%;width:100%;',
                tabPosition:"top"
            }, dojo.byId('centerTabs'));
            this.welcomeTab = new dijit.layout.ContentPane({
                title:this.dic("WELCOME")
            });
            this.widgets.contentContainer.addChild(this.welcomeTab);
            this.widgets.contentContainer.startup();
        },
        /**
         * @method postLoad
         * @param {dijit.layout.ContentPanel} panel
         */
        postLoad:function(panel) {
            this.parseLinks(panel);
            this.showTypes(panel);
			SyntaxHighlighter.defaults['smart-tabs'] = true;
            SyntaxHighlighter.highlight({});
        },
        /**
         * toggler private,protected and deprecated variables
         * @method showTypes
         * @param {dijit.layout.ContentPanel} panel
         */
        showTypes:function(panel) {
            dojo.query("input[type='checkbox'][name^='show_']", panel.domNode).forEach(function(node) {
                var showType = node.name.substr(5);
                if (dojo.cookie(node.name)) {
                    dojo.query("div." + showType).style({
                        display:dojo.cookie(node.name)
                    });
                    node.checked = dojo.cookie(node.name) == "block" ? true : false;
                }
                dojo.connect(node, "onclick", this, function(evt) {
                    dojo.cookie(node.name, node.checked ? "block" : "none");
                    dojo.query("div." + showType).style({
                        display:node.checked ? "block" : "none"
                    });
                })
            })
        },
        /**
         * attach event on links to create tabs onclick
         * @method parseLinks
         * @param {dijit.layout.ContentPanel} panel
         */
        parseLinks:function(panel) {
            dojo.query("a[href]", panel.domNode).forEach(function(node) {
                dojo.connect(node, "onclick", this, function(evt) {
                    if (!node.href.match(window.location.hostname)) {
                        dojo.stopEvent(evt);
                        return window.open(node.href);
                    }
                    dojo.stopEvent(evt);
                    var href = node.href.split("/").pop();

                    var complexConfig = this.getComplexLinkConfig(href, panel);
                    if (!complexConfig) {
                        this.openTab({
                            id:href,
                            title:node.innerHTML,
                            href:href,
                            closable:true,
                            selected:true
                        });
                        return;
                    }
                    if (complexConfig.isCurrentPanel) {
                        return this.helpers.scrollTo(complexConfig.anchor, "name", panel.domNode);
                    }
                    var title = complexConfig.href.split(".");
                    title.pop();
                    title = title.join(".");
                    this.openTab({
                        id:complexConfig.href,
                        title:title,
                        href:complexConfig.href,
                        closable:true,
                        selected:true
                    }, complexConfig.callback);
                });
            }, this);
        },
        /**
         * @method getComplexLinkConfig
         * @private
         * @param href
         * @param currentPanel
         */
        getComplexLinkConfig:function(href, currentPanel) {
            var $this = this;
            var parts = href.split("#"),config = {
                isCurrentPanel:false
            };
            if (parts.length == 1) {
                return null;
            }
            config.anchor = parts.pop();
            if (parts == currentPanel.id || parts == "./" || parts == "") {
                config.isCurrentPanel = true;
            } else {
                config.href = parts.pop();
            }
            config.callback = function(panel) {
                $this.helpers.scrollTo(config.anchor, "name", panel.domNode);
            };
            return config;

        },
        /**
         * @method openTab
         * @param {Object} args
         * @param {Function} callback
         */
        openTab:function(args, callback) {
            args.id = args.id.split(/[\~\|\*\>\<\?\:\"\'\\\/]/i).join("-");
            var panel,hasCallback = typeof callback == "function",$this = this;
            if (panel = dijit.byId(args.id)) {
                if (!panel.selected) {
                    this.widgets.contentContainer.selectChild(panel);
                }
                if (hasCallback) {
                    callback(panel);
                }
                return;
            }
            var params = dojo.mixin({
                ioArgs:{
                    load:function(html) {
                        try {
                            return $this.helpers.substitute(html, $this._dicPkg(null, "template"), null, null, $this.config.tplTag);
                        } catch(e) {
                            console.dir(e);
                        }

                    }
                },
                onLoad:function() {
                    if (hasCallback) {
                        callback(panel);
                    }
                    $this.postLoad(panel);
                }
            }, args);
            panel = new dijit.layout.ContentPane(params);
            this.widgets.contentContainer.addChild(panel);
            this.widgets.contentContainer.selectChild(panel);
        }
    };
    dojo.addOnLoad(function() {
        dojo.require("Darktalker.helpers");
        dojo.require("Darktalker.modules.SearchList");
        dojo.requireLocalization("Darktalker", "base", null, Darktalker.config.extraLocale.join(","));
        dojo.requireLocalization("Darktalker", "template", null, Darktalker.config.extraLocale.join(","));

        Darktalker.init();
    })
})();
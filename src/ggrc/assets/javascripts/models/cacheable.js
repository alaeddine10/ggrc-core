/*
 * Copyright (C) 2013 Google Inc., authors, and contributors <see AUTHORS file>
 * Licensed under http://www.apache.org/licenses/LICENSE-2.0 <see LICENSE file>
 * Created By:
 * Maintained By:
 */

//= require can.jquery-all

(function(can) {
can.Model("can.Model.Cacheable", {

  init : function() {
    this.bind("created", function(ev, new_obj) {
      if(new_obj.id) {
        can.getObject("cache", new_obj.constructor, true)[new_obj.id] = new_obj;
      }
    });
    this.bind("destroyed", function(ev, old_obj) {
      delete can.getObject("cache", old_obj.constructor, true)[old_obj.id];
    });
    //can.getObject("cache", this, true);

    var _update = this.update;
    this.update = function(id, params) {
      var ret = _update.call(this, id, this.process_args(params)).fail(function(status) {
        if(status === 409) {
          //handle conflict.
        }
      });
      delete ret.hasFailCallback;
      return ret;
    };

    var _create = this.create;
    this.create = function(params) {
      var ret = _create.call(this, this.process_args(params));
      delete ret.hasFailCallback;
      return ret;
    };


  }

  , findInCacheById : function(id) {
    return can.getObject("cache", this, true)[id];
  }

  , newInstance : function(args) {
    var cache = can.getObject("cache", this, true);
    if(args && args.id && cache[args.id]) {
      //cache[args.id].attr(args, false); //CanJS has bugs in recursive merging 
                                          // (merging -- adding properties from an object without removing existing ones 
                                          //  -- doesn't work in nested objects).  So we're just going to not merge properties.
      return cache[args.id];
    } else {
      return can.Model.Cacheable.prototype.__proto__.constructor.newInstance.apply(this, arguments);
    }
  }
  , process_args : function(args, names) {
    var pargs = {
      etag : args.etag
      , "last-modified" : args["last-modified"]
    };
    var obj = pargs;
    if(this.root_object) {
      obj = pargs[this.root_object] = {};
    }
    var src = args.serialize ? args.serialize() : args;
    var go_names = (!names || names.not) ? Object.keys(src) : names;
    for(var i = 0 ; i < (go_names.length || 0) ; i++) {
      obj[go_names[i]] = src[go_names[i]];
    }
    if(names && names.not) {
      var not_names = names.not;
      for(i = 0 ; i < (not_names.length || 0) ; i++) {
        delete obj[not_names[i]];
      }
    }
    return pargs;
  }
  , findRelated : function(params) {
    return $.ajax({
      url : "/relationships/related_objects.json"
      , data : {
        oid : params.id
        , otype : params.otype || this.shortName
        , related_model : typeof params.related_model === "string" ? params.related_model : params.related_model.shortName
      }
    });
  }
  , models : function(params) {
    if(params[this.root_collection + "_collection"]) {
      params = params[this.root_collection + "_collection"]
    }
    if(params[this.root_collection]) {
      params = params[this.root_collection];
    }
    return this._super(params);
  }
  , model : function(params) {
    var m;
    var obj_name = this.root_object;
    if(typeof obj_name !== "undefined" && params[obj_name]) {
        for(var i in params[obj_name]) {
          if(params[obj_name].hasOwnProperty(i)) {
            params.attr 
            ? params.attr(i, params[obj_name][i]) 
            : (params[i] = params[obj_name][i]);
          }
        }
        if(params.removeAttr) {
          params.removeAttr(obj_name);
        } else {
          delete params[obj_name];
        }
    }
    if(m = this.findInCacheById(params.id)) {
      m.attr(params);
    } else {
      m = this._super(params);
    }
    return m;
  }
  , tree_view_options : {}
}, {
  init : function() {
    var obj_name = this.constructor.root_object;
    if(typeof obj_name !== "undefined" && this[obj_name]) {
        for(var i in this[obj_name].serialize()) {
          if(this[obj_name].hasOwnProperty(i)) {
            this.attr(i, this[obj_name][i]);
          }
        }
        this.removeAttr(obj_name);
    }

    var cache = can.getObject("cache", this.constructor, true);
    cache[this.id] = this;

    var that = this;
    this.attr("computed_errors", can.compute(function() {
      return that.errors();
    }));
  }
  , addElementToChildList : function(attrName, new_element) {
    this[attrName].push(new_element);
    this._triggerChange(attrName, "set", this[attrName], this[attrName].slice(0, this[attrName].length - 1));
  }
  , removeElementFromChildList : function(attrName, old_element, all_instances) {
    for(var i = this[attrName].length - 1 ; i >= 0; i--) {
      if(this[attrName][i]===old_element) {
        this[attrName].splice(i, 1);
        if(!all_instances) break;
      }
    }
    this._triggerChange(attrName, "set", this[attrName], this[attrName].slice(0, this[attrName].length - 1));
  }
  , refresh : function() {
    return $.ajax({
      url : this.selfLink
      , type : "get"
      , dataType : "json"
    })
    .then(function(data, status, xhr) {
      data.etag = xhr.getResponseHeader("ETag");
      data['last-modified'] = xhr.getResponseHeader("Last-Modified");
    })
    .then(can.proxy(this.constructor, "model"));
  }
});

})(window.can);
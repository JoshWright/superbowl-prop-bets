
(function($){
    $.extend({
        makeClass: function(){
            var hasSuper = $.isFunction(arguments[0]);
            var parent = hasSuper ? arguments[0] : null;
            var properties = [];
            for(var i=(hasSuper ? 1 : 0); i<arguments.length; i++)
                properties.push(arguments[i]);
            function klass(){
                this.init.apply(this, arguments);
            }
            klass.superclass = parent;
            klass.subclasses = [];

            if(parent){
                var subclass = function(){ };
                subclass.prototype = parent.prototype;
                klass.prototype = new subclass;
                parent.subclasses.push(klass);
            }

            for (var i = 0; i < properties.length; i++)
                $.addMethods(klass, properties[i]);

            if(!klass.prototype.init)
                klass.prototype.init = function(){ };

            klass.prototype.constructor = klass;
            return klass;
        },
        addMethods: function(target, source) {
            var ancestor   = target.superclass && target.superclass.prototype;
            var properties = $.keys(source);

            for (var i = 0, length = properties.length; i < length; i++) {
              var property = properties[i];
              var value = source[property];
              if (ancestor && $.isFunction(value) && $.argumentNames(value).length && $.argumentNames(value)[0] == "$super") {
                var method = value;
                value = (function(m) {
                  return function() { return ancestor[m].apply(this, arguments) };
                })(property).wrap(method);
              }
              target.prototype[property] = value;
            }

            return target;
        },
        keys: function(object) {
            var keys = [];
            for (var property in object)
              keys.push(property);
            return keys;
        },
        argumentNames: function(fun) {
            var names = fun.toString().match(/^[\s\(]*function[^(]*\(([^\)]*)\)/)[1].replace(/\s+/g, '').split(',');
            return names.length == 1 && !names[0] ? [] : names;
        }
    });

    $.extend(Function.prototype, {
        as: function(){
            var _$A = function(a){return Array.prototype.slice.call(a);}
            if(arguments.length < 2 && (typeof arguments[0] == "undefined")) return this;
            var __method = this, args = _$A(arguments), object = args.shift();
            return function() {
              return __method.apply(object, args.concat(_$A(arguments)));
            }
        },
        wrap: function(wrapper) {
            var __method = this;
            return function() {
              return wrapper.apply(this, [__method.as(this)].concat($A(arguments)));
            }
        }
    });

    $.extend(String.prototype, {
        evalJSON: function(){
            return eval('(' + this + ')');
        }
    });

}(jQuery));

function $A(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length || 0, results = new Array(length);
  while (length--) results[length] = iterable[length];
  return results;
}

var Observer = $.makeClass({
    init: function(){
       this.fns = [];
    },
    subscribe: function(fn){
        this.fns.push(fn);
    },
    fire : function() {
        for(var i=0; i<this.fns.length; i++){
            try
            {
                this.fns[i].apply(this, arguments);
            }
            catch(error) { }
        }
    }
});
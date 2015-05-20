/*
 Base.js, version 1.1a
 Copyright 2006-2010, Dean Edwards
 License: http://www.opensource.org/licenses/mit-license.php
 */
/*
 *  GraVITas Premier League <gravitaspremierleague@gmail.com>
 *  Copyright (C) 2014  IEEE Computer Society - VIT Student Chapter <ieeecs@vit.ac.in>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
var Base = function ()
{
    // dummy
};

Base.extend = function (_instance, _static)
{ // subclass

    "use strict";

    var extend = Base.prototype.extend;

    // build the prototype
    Base._prototyping = true;

    var proto = new this();

    extend.call(proto, _instance);

    proto.base = function ()
    {
        // call this method from any other method to invoke that method's ancestor
    };

    delete Base._prototyping;

    // create the wrapper for the constructor function
    //var constructor = proto.constructor.valueOf(); //-dean
    var constructor = proto.constructor;
    var klass = proto.constructor = function ()
    {
        if (!Base._prototyping)
        {
            if (this._constructing || this.constructor == klass)
            { // instantiation
                this._constructing = true;
                constructor.apply(this, arguments);
                delete this._constructing;
            }
            else if (arguments[0] !== null)
            { // casting
                return (arguments[0].extend || extend).call(arguments[0], proto);
            }
        }
    };

    // build the class interface
    klass.ancestor = this;
    klass.extend = this.extend;
    klass.forEach = this.forEach;
    klass.implement = this.implement;
    klass.prototype = proto;
    klass.toString = this.toString;
    klass.valueOf = function (type)
    {
        //return (type == "object") ? klass : constructor; //-dean
        return (type == "object") ? klass : constructor.valueOf();
    };
    extend.call(klass, _static);
    // class initialisation
    if (typeof klass.init == "function") klass.init();
    return klass;
};

Base.prototype = {
    extend: function (source, value)
    {
        if (arguments.length > 1)
        { // extending with a name/value pair
            var ancestor = this[source];
            if (ancestor && (typeof value == "function") && // overriding a method?
                    // the valueOf() comparison is to avoid circular references
                (!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
                /\bbase\b/.test(value))
            {
                // get the underlying method
                var method = value.valueOf();
                // override
                value = function ()
                {
                    var previous = this.base || Base.prototype.base;
                    this.base = ancestor;
                    var returnValue = method.apply(this, arguments);
                    this.base = previous;
                    return returnValue;
                };
                // point to the underlying method
                value.valueOf = function (type)
                {
                    return (type == "object") ? value : method;
                };
                value.toString = Base.toString;
            }
            this[source] = value;
        }
        else if (source)
        { // extending with an object literal
            var extend = Base.prototype.extend;
            // if this object has a customised extend method then use it
            if (!Base._prototyping && typeof this != "function")
            {
                extend = this.extend || extend;
            }
            var proto = {toSource: null};
            // do the "toString" and other methods manually
            var hidden = ["constructor", "toString", "valueOf"];
            // if we are prototyping then include the constructor
            var i = Base._prototyping ? 0 : 1;
            while (key = hidden[i++])
            {
                if (source[key] != proto[key])
                {
                    extend.call(this, key, source[key]);

                }
            }
            // copy each of the source object's properties to this object
            for (var key in source)
            {
                if (!proto[key]) extend.call(this, key, source[key]);
            }
        }
        return this;
    }
};

// initialise
Base = Base.extend({
                       constructor: function ()
                       {
                           this.extend(arguments[0]);
                       }
                   }, {
                       ancestor: Object,
                       version: "1.1",

                       forEach: function (object, block, context)
                       {
                           for (var key in object)
                           {
                               if (this.prototype[key] === undefined)
                               {
                                   block.call(context, object[key], key, object);
                               }
                           }
                       },

                       implement: function ()
                       {
                           for (var i = 0; i < arguments.length; i++)
                           {
                               if (typeof arguments[i] == "function")
                               {
                                   // if it's a function, call it
                                   arguments[i](this.prototype);
                               }
                               else
                               {
                                   // add the interface using the extend method
                                   this.prototype.extend(arguments[i]);
                               }
                           }
                           return this;
                       },

                       toString: function ()
                       {
                           return String(this.valueOf());
                       }
                   });
/*jshint smarttabs:true */

var FlipClock;

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function ($)
{

    "use strict";

    /**
     * FlipFlock Helper
     *
     * @param  object  A jQuery object or CSS select
     * @param  int     An integer used to start the clock (no. seconds)
     * @param  object  An object of properties to override the default
     */

    FlipClock = function (obj, digit, options)
    {
        if (typeof digit == "object")
        {
            options = digit;
            digit = 0;
        }

        return new FlipClock.Factory(obj, digit, options);
    };

    /**
     * The global FlipClock.Lang object
     */

    FlipClock.Lang = {};

    /**
     * The Base FlipClock class is used to extend all other FlipFlock
     * classes. It handles the callbacks and the basic setters/getters
     *
     * @param    object  An object of the default properties
     * @param    object  An object of properties to override the default
     */

    FlipClock.Base = Base.extend({

                                     /**
                                      * Build Date
                                      */

                                     buildDate: '2014-06-03',

                                     /**
                                      * Version
                                      */

                                     version: '0.5.5',

                                     /**
                                      * Sets the default options
                                      *
                                      * @param    object    The default options
                                      * @param    object    The override options
                                      */

                                     constructor: function (_default, options)
                                     {
                                         if (typeof _default !== "object")
                                         {
                                             _default = {};
                                         }
                                         if (typeof options !== "object")
                                         {
                                             options = {};
                                         }
                                         this.setOptions($.extend(true, {}, _default, options));
                                     },

                                     /**
                                      * Delegates the callback to the defined method
                                      *
                                      * @param    object    The default options
                                      * @param    object    The override options
                                      */

                                     callback: function (method)
                                     {
                                         if (typeof method === "function")
                                         {
                                             var args = [];

                                             for (var x = 1; x <= arguments.length; x++)
                                             {
                                                 if (arguments[x])
                                                 {
                                                     args.push(arguments[x]);
                                                 }
                                             }

                                             method.apply(this, args);
                                         }
                                     },

                                     /**
                                      * Log a string into the console if it exists
                                      *
                                      * @param    string    The name of the option
                                      * @return    mixed
                                      */

                                     log: function (str)
                                     {
                                         if (window.console && console.log)
                                         {
                                             console.log(str);
                                         }
                                     },

                                     /**
                                      * Get an single option value. Returns false if option does not exist
                                      *
                                      * @param    string    The name of the option
                                      * @return    mixed
                                      */

                                     getOption: function (index)
                                     {
                                         if (this[index])
                                         {
                                             return this[index];
                                         }
                                         return false;
                                     },

                                     /**
                                      * Get all options
                                      *
                                      * @return    bool
                                      */

                                     getOptions: function ()
                                     {
                                         return this;
                                     },

                                     /**
                                      * Set a single option value
                                      *
                                      * @param    string    The name of the option
                                      * @param    mixed    The value of the option
                                      */

                                     setOption: function (index, value)
                                     {
                                         this[index] = value;
                                     },

                                     /**
                                      * Set a multiple options by passing a JSON object
                                      *
                                      * @param    object    The object with the options
                                      * @param    mixed    The value of the option
                                      */

                                     setOptions: function (options)
                                     {
                                         for (var key in options)
                                         {
                                             if (typeof options[key] !== "undefined")
                                             {
                                                 this.setOption(key, options[key]);
                                             }
                                         }
                                     }

                                 });

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function ($)
{

    "use strict";

    /**
     * The FlipClock Face class is the base class in which to extend
     * all other FlockClock.Face classes.
     *
     * @param    object  The parent FlipClock.Factory object
     * @param    object  An object of properties to override the default
     */

    FlipClock.Face = FlipClock.Base.extend({

                                               /**
                                                * An array of jQuery objects used for the dividers (the colons)
                                                */

                                               dividers: [],

                                               /**
                                                * An array of FlipClock.List objects
                                                */

                                               factory: false,

                                               /**
                                                * An array of FlipClock.List objects
                                                */

                                               lists: [],

                                               /**
                                                * Constructor
                                                *
                                                * @param    object  The parent FlipClock.Factory object
                                                * @param    object  An object of properties to override the default
                                                */

                                               constructor: function (factory, options)
                                               {
                                                   this.dividers = [];
                                                   this.lists = [];
                                                   this.base(options);
                                                   this.factory = factory;
                                               },

                                               /**
                                                * Build the clock face
                                                */

                                               build: function ()
                                               {
                                               },

                                               /**
                                                * Creates a jQuery object used for the digit divider
                                                *
                                                * @param    mixed    The divider label text
                                                * @param    mixed    Set true to exclude the dots in the divider.
                                                *                    If not set, is false.
                                                */

                                               createDivider: function (label, css, excludeDots)
                                               {

                                                   if (typeof css == "boolean" || !css)
                                                   {
                                                       excludeDots = css;
                                                       css = label;
                                                   }

                                                   var dots = [
                                                           '<span class="' + this.factory.classes.dot + ' top"></span>',
                                                           '<span class="' + this.factory.classes.dot + ' bottom"></span>'
                                                   ].join('');

                                                   if (excludeDots)
                                                   {
                                                       dots = '';
                                                   }

                                                   label = this.factory.localize(label);

                                                   var html = [
                                                           '<span class="' + this.factory.classes.divider + ' ' + (css ? css : '').toLowerCase() + '">',
                                                           '<span class="' + this.factory.classes.label + '">' + (label ? label : '') + '</span>',
                                                           dots,
                                                           '</span>'
                                                   ];

                                                   return $(html.join(''));
                                               },

                                               /**
                                                * Creates a FlipClock.List object and appends it to the DOM
                                                *
                                                * @param    mixed    The digit to select in the list
                                                * @param    object  An object to override the default properties
                                                */

                                               createList: function (digit, options)
                                               {
                                                   if (typeof digit === "object")
                                                   {
                                                       options = digit;
                                                       digit = 0;
                                                   }

                                                   var obj = new FlipClock.List(this.factory, digit, options);

                                                   this.lists.push(obj);

                                                   return obj;
                                               },

                                               /**
                                                * Triggers when the clock is reset
                                                */

                                               reset: function ()
                                               {
                                                   this.factory.time = new FlipClock.Time(
                                                       this.factor,
                                                       this.factory.original ? Math.round(this.factory.original) : 0
                                                   );
                                                   this.flip(this.factory.original, false);
                                               },

                                               /**
                                                * Sets the clock time (deprecated, duplicate method)
                                                *

                                                setTime: function(time) {
			this.flip();		
		},
                                                */

                                               /**
                                                * Sets the clock time
                                                */

                                               addDigit: function (digit)
                                               {
                                                   var obj = this.createList(digit, {
                                                       classes: {
                                                           active: this.factory.classes.active,
                                                           before: this.factory.classes.before,
                                                           flip: this.factory.classes.flip
                                                       }
                                                   });

                                                   obj.$el.append(this.factory.lists[this.factory.lists.length - 1].$obj);

                                                   //this.factory.lists.unshift(obj);
                                               },

                                               /**
                                                * Triggers when the clock is started
                                                */

                                               start: function ()
                                               {
                                               },

                                               /**
                                                * Triggers when the time on the clock stops
                                                */

                                               stop: function ()
                                               {
                                               },

                                               /**
                                                * Auto increments/decrements the value of the clock face
                                                */

                                               autoIncrement: function ()
                                               {
                                                   if (!(this.factory.time.time instanceof Date))
                                                   {
                                                       if (!this.factory.countdown)
                                                       {
                                                           this.increment();
                                                       }
                                                       else
                                                       {
                                                           this.decrement();
                                                       }
                                                   }
                                               },

                                               /**
                                                * Increments the value of the clock face
                                                */

                                               increment: function ()
                                               {
                                                   this.factory.time.addSecond();
                                               },

                                               /**
                                                * Decrements the value of the clock face
                                                */

                                               decrement: function ()
                                               {
                                                   if (this.factory.time.getTimeSeconds() == 0)
                                                   {
                                                       this.factory.stop()
                                                   }
                                                   else
                                                   {
                                                       this.factory.time.subSecond();
                                                   }
                                               },

                                               /**
                                                * Triggers when the numbers on the clock flip
                                                */

                                               flip: function (time, doNotAddPlayClass)
                                               {
                                                   var t = this;

                                                   /*
                                                    if (!(this.factory.time.time instanceof Date)) {
                                                    if(!this.factory.countdown) {
                                                    this.increment();
                                                    }
                                                    else {
                                                    this.decrement();
                                                    }
                                                    }
                                                    */

                                                   $.each(time, function (i, digit)
                                                   {
                                                       var list = t.lists[i];

                                                       if (list)
                                                       {
                                                           if (!doNotAddPlayClass && digit != list.digit)
                                                           {
                                                               list.play();
                                                           }

                                                           list.select(digit);
                                                       }
                                                       else
                                                       {
                                                           t.addDigit(digit);
                                                       }
                                                   });

                                                   /*
                                                    DELETE PENDING - Legacy flip code that was replaced with the
                                                    much more simple logic above.

                                                    var offset = t.factory.lists.length - time.length;

                                                    if(offset < 0) {
                                                    offset = 0;
                                                    }

                                                    $.each(time, function(i, digit) {
                                                    i += offset;

                                                    var list = t.factory.lists[i];

                                                    console.log()

                                                    if(list) {
                                                    list.select(digit);

                                                    if(!doNotAddPlayClass) {
                                                    list.play();
                                                    }
                                                    }
                                                    else {
                                                    t.addDigit(digit);
                                                    }
                                                    });

                                                    for(var x = 0; x < time.length; x++) {
                                                    if(x >= offset && t.factory.lists[x].digit != time[x]) {
                                                    t.factory.lists[x].select(time[x]);
                                                    }
                                                    }
                                                    */
                                               }

                                           });

}(jQuery));

(function ($)
{

    "use strict";

    /**
     * The FlipClock Factory class is used to build the clock and manage
     * all the public methods.
     *
     * @param    object  A jQuery object or CSS selector used to fetch
     the wrapping DOM nodes
     * @param    mixed   This is the digit used to set the clock. If an
     object is passed, 0 will be used.
     * @param    object  An object of properties to override the default
     */

    FlipClock.Factory = FlipClock.Base.extend({

                                                  /**
                                                   * Auto start the clock on page load (True|False)
                                                   */

                                                  autoStart: true,

                                                  /**
                                                   * The callback methods
                                                   */

                                                  callbacks: {
                                                      destroy: false,
                                                      create: false,
                                                      init: false,
                                                      interval: false,
                                                      start: false,
                                                      stop: false,
                                                      reset: false
                                                  },


                                                  classes: {
                                                      active: 'flip-clock-active',
                                                      before: 'flip-clock-before',
                                                      divider: 'flip-clock-divider',
                                                      dot: 'flip-clock-dot',
                                                      label: 'flip-clock-label',
                                                      flip: 'flip',
                                                      play: 'play',
                                                      wrapper: 'flip-clock-wrapper'
                                                  },

                                                  clockFace: 'HourlyCounter',


                                                  countdown: false,
                                                  defaultLanguage: 'english',


                                                  language: 'english',


                                                  lang: false,


                                                  original: false,


                                                  face: true,

                                                  running: false,
                                                  time: false,

                                                  timer: false,


                                                  lists: [],


                                                  $el: false,

                                                  $wrapper: false,


                                                  constructor: function (obj, digit, options)
                                                  {

                                                      if (!options)
                                                      {
                                                          options = {};
                                                      }

                                                      this.lists = [];
                                                      this.running = false;
                                                      this.base(options);

                                                      this.$el = $(obj).addClass(this.classes.wrapper);

                                                      // Depcrated support of the $wrapper property.
                                                      this.$wrapper = this.$el;

                                                      this.original = (digit instanceof Date) ? digit : (digit ? Math.round(digit) : 0);

                                                      this.time = new FlipClock.Time(this, this.original, {
                                                          minimumDigits: options.minimumDigits ? options.minimumDigits : 0,
                                                          animationRate: options.animationRate ? options.animationRate : 1000
                                                      });

                                                      this.timer = new FlipClock.Timer(this, options);

                                                      this.lang = this.loadLanguage(this.language);

                                                      this.face = this.loadClockFace(this.clockFace, options);

                                                      if (this.autoStart)
                                                      {
                                                          this.start();
                                                      }
                                                  },


                                                  loadClockFace: function (name, options)
                                                  {
                                                      var face, suffix = 'Face';

                                                      name = name.ucfirst() + suffix;

                                                      if (FlipClock[name])
                                                      {
                                                          face = new FlipClock[name](this, options);
                                                      }
                                                      else
                                                      {
                                                          face = new FlipClock[this.defaultClockFace + suffix](this, options);
                                                      }

                                                      face.build();

                                                      return face;
                                                  },


                                                  /**
                                                   * Load the FlipClock.Lang object
                                                   *
                                                   * @param    object  The name of the language to load
                                                   */

                                                  loadLanguage: function (name)
                                                  {
                                                      var lang;

                                                      if (FlipClock.Lang[name.ucfirst()])
                                                      {
                                                          lang = FlipClock.Lang[name.ucfirst()];
                                                      }
                                                      else if (FlipClock.Lang[name])
                                                      {
                                                          lang = FlipClock.Lang[name];
                                                      }
                                                      else
                                                      {
                                                          lang = FlipClock.Lang[this.defaultLanguage];
                                                      }

                                                      return lang;
                                                  },


                                                  localize: function (index, obj)
                                                  {
                                                      var lang = this.lang;

                                                      if (!index)
                                                      {
                                                          return null;
                                                      }

                                                      var lindex = index.toLowerCase();

                                                      if (typeof obj == "object")
                                                      {
                                                          lang = obj;
                                                      }

                                                      if (lang && lang[lindex])
                                                      {
                                                          return lang[lindex];
                                                      }

                                                      return index;
                                                  },


                                                  /**
                                                   * Starts the clock
                                                   */

                                                  start: function (callback)
                                                  {
                                                      var t = this;

                                                      if (!t.running && (!t.countdown || t.countdown && t.time.time > 0))
                                                      {

                                                          t.face.start(t.time);
                                                          t.timer.start(function ()
                                                                        {
                                                                            t.flip();

                                                                            if (typeof callback === "function")
                                                                            {
                                                                                callback();
                                                                            }
                                                                        });
                                                      }
                                                      else
                                                      {
                                                          t.log('Trying to start timer when countdown already at 0');
                                                      }
                                                  },


                                                  stop: function (callback)
                                                  {
                                                      this.face.stop();
                                                      this.timer.stop(callback);

                                                      for (var x in this.lists)
                                                      {
                                                          if (this.lists.hasOwnProperty(x))
                                                          {
                                                              this.lists[x].stop();
                                                          }
                                                      }
                                                  },

                                                  /**
                                                   * Reset the clock
                                                   */

                                                  reset: function (callback)
                                                  {
                                                      this.timer.reset(callback);
                                                      this.face.reset();
                                                  },

                                                  /**
                                                   * Sets the clock time
                                                   */

                                                  setTime: function (time)
                                                  {
                                                      this.time.time = time;
                                                      this.flip(true);
                                                  },


                                                  getTime: function (time)
                                                  {
                                                      return this.time;
                                                  },


                                                  setCountdown: function (value)
                                                  {
                                                      var running = this.running;

                                                      this.countdown = value ? true : false;

                                                      if (running)
                                                      {
                                                          this.stop();
                                                          this.start();
                                                      }
                                                  },

                                                  flip: function (doNotAddPlayClass)
                                                  {
                                                      this.face.flip(false, doNotAddPlayClass);
                                                  }

                                              });

}(jQuery));


(function ($)
{

    "use strict";


    FlipClock.List = FlipClock.Base.extend({


                                               digit: 0,


                                               classes: {
                                                   active: 'flip-clock-active',
                                                   before: 'flip-clock-before',
                                                   flip: 'flip'
                                               },

                                               /**
                                                * The parent FlipClock.Factory object
                                                */

                                               factory: false,

                                               /**
                                                * The jQuery object
                                                */

                                               $el: false,

                                               /**
                                                * The jQuery object (deprecated)
                                                */

                                               $obj: false,


                                               items: [],

                                               lastDigit: 0,


                                               minimumDigits: 0,

                                               constructor: function (factory, digit, options)
                                               {
                                                   this.factory = factory;
                                                   this.digit = digit;
                                                   this.lastDigit = digit;
                                                   this.$el = this.createList();

                                                   this.$wrapper = this.$el;

                                                   if (digit > 0)
                                                   {
                                                       this.select(digit);
                                                   }

                                                   this.factory.$el.append(this.$el);
                                               },

                                               /**
                                                * Select the digit in the list
                                                *
                                                * @param  int  A digit 0-9
                                                */

                                               select: function (digit)
                                               {
                                                   if (typeof digit === "undefined")
                                                   {
                                                       digit = this.digit;
                                                   }
                                                   else
                                                   {
                                                       this.digit = digit;
                                                   }

                                                   if (this.digit != this.lastDigit)
                                                   {
                                                       var $delete = this.$el.find('.' + this.classes.before).removeClass(this.classes.before);

                                                       this.$el.find('.' + this.classes.active).removeClass(this.classes.active)
                                                           .addClass(this.classes.before);

                                                       this.appendListItem(this.classes.active, this.digit);

                                                       $delete.remove();

                                                       this.lastDigit = this.digit;
                                                   }

                                               },


                                               play: function ()
                                               {
                                                   this.$el.addClass(this.factory.classes.play);
                                               },


                                               stop: function ()
                                               {
                                                   var t = this;

                                                   setTimeout(function ()
                                                              {
                                                                  t.$el.removeClass(t.factory.classes.play);
                                                              }, this.factory.timer.interval);
                                               },

                                               createListItem: function (css, value)
                                               {
                                                   return [
                                                           '<li class="' + (css ? css : '') + '">',
                                                           '<a href="#">',
                                                           '<div class="up">',
                                                           '<div class="shadow"></div>',
                                                           '<div class="inn">' + (value ? value : '') + '</div>',
                                                           '</div>',
                                                           '<div class="down">',
                                                           '<div class="shadow"></div>',
                                                           '<div class="inn">' + (value ? value : '') + '</div>',
                                                           '</div>',
                                                           '</a>',
                                                           '</li>'
                                                   ].join('');
                                               },

                                               appendListItem: function (css, value)
                                               {
                                                   var html = this.createListItem(css, value);

                                                   this.$el.append(html);
                                               },

                                               /**
                                                * Create the list of digits and appends it to the DOM object
                                                */

                                               createList: function ()
                                               {

                                                   var lastDigit = this.getPrevDigit() ? this.getPrevDigit() : this.digit;

                                                   var html = $([
                                                                        '<ul class="' + this.classes.flip + ' ' + (this.factory.running ? this.factory.classes.play : '') + '">',
                                                                        this.createListItem(this.classes.before, lastDigit),
                                                                        this.createListItem(this.classes.active, this.digit),
                                                                        '</ul>'
                                                                ].join(''));

                                                   /*
                                                    DELETE PENDING - Replace with the more simple logic above.
                                                    This should reduce the load on the some GPU's by having
                                                    signifantly fewing DOM nodes in memory.

                                                    for(var x = 0; x < 2; x++) {
                                                    var item = $([
                                                    '<li data-digit="'+x+'">',
                                                    '<a href="#">',
                                                    '<div class="up">',
                                                    '<div class="shadow"></div>',
                                                    '<div class="inn">'+x+'</div>',
                                                    '</div>',
                                                    '<div class="down">',
                                                    '<div class="shadow"></div>',
                                                    '<div class="inn">'+x+'</div>',
                                                    '</div>',
                                                    '</a>',
                                                    '</li>'].join(''));

                                                    this.items.push(item);

                                                    html.append(item);
                                                    }
                                                    */

                                                   return html;
                                               },

                                               getNextDigit: function ()
                                               {
                                                   return this.digit == 9 ? 0 : this.digit + 1;
                                               },

                                               getPrevDigit: function ()
                                               {
                                                   return this.digit == 0 ? 9 : this.digit - 1;
                                               }

                                               /*
                                                setActiveDigit: function(digit) {
                                                var $obj = this.$el.find('.'+this.classes.active);

                                                $obj.find('.inn').html(digit);
                                                $obj.removeClass(this.classes.active).addClass(this.classes.active);
                                                },

                                                setActiveDigit: function(digit) {
                                                this.$el.find('.'+this.classes.before).find('.inn').html(digit);
                                                }
                                                */

                                           });


}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function ($)
{

    "use strict";

    /**
     * Capitalize the first letter in a string
     *
     * @return string
     */

    String.prototype.ucfirst = function ()
    {
        return this.substr(0, 1).toUpperCase() + this.substr(1);
    };

    /**
     * jQuery helper method
     *
     * @param  int     An integer used to start the clock (no. seconds)
     * @param  object  An object of properties to override the default
     */

    $.fn.FlipClock = function (digit, options)
    {
        if (typeof digit == "object")
        {
            options = digit;
            digit = 0;
        }
        return new FlipClock($(this), digit, options);
    };

    /**
     * jQuery helper method
     *
     * @param  int     An integer used to start the clock (no. seconds)
     * @param  object  An object of properties to override the default
     */

    $.fn.flipClock = function (digit, options)
    {
        return $.fn.FlipClock(digit, options);
    };

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function ($)
{

    "use strict";


    FlipClock.Time = FlipClock.Base.extend({

                                               time: 0,

                                               factory: false,

                                               minimumDigits: 0,

                                               constructor: function (factory, time, options)
                                               {
                                                   this.base(options);
                                                   this.factory = factory;

                                                   if (time)
                                                   {
                                                       this.time = time;
                                                   }
                                               },


                                               convertDigitsToArray: function (str)
                                               {
                                                   var data = [];

                                                   str = str.toString();

                                                   for (var x = 0; x < str.length; x++)
                                                   {
                                                       if (str[x].match(/^\d*$/g))
                                                       {
                                                           data.push(str[x]);
                                                       }
                                                   }

                                                   return data;
                                               },


                                               digit: function (i)
                                               {
                                                   var timeStr = this.toString();
                                                   var length = timeStr.length;

                                                   if (timeStr[length - i])
                                                   {
                                                       return timeStr[length - i];
                                                   }

                                                   return false;
                                               },


                                               digitize: function (obj)
                                               {
                                                   var data = [];

                                                   $.each(obj, function (i, value)
                                                   {
                                                       value = value.toString();

                                                       if (value.length == 1)
                                                       {
                                                           value = '0' + value;
                                                       }

                                                       for (var x = 0; x < value.length; x++)
                                                       {
                                                           data.push(value.charAt(x));
                                                       }
                                                   });

                                                   if (data.length > this.minimumDigits)
                                                   {
                                                       this.minimumDigits = data.length;
                                                   }

                                                   if (this.minimumDigits > data.length)
                                                   {
                                                       for (var x = data.length; x < this.minimumDigits; x++)
                                                       {
                                                           data.unshift('0');
                                                       }
                                                   }

                                                   return data;
                                               },

                                               /**
                                                * Gets a daily breakdown
                                                *
                                                * @return  object  Returns a digitized object
                                                */

                                               getDayCounter: function (includeSeconds)
                                               {
                                                   var digits = [
                                                       this.getDays(),
                                                       this.getHours(true),
                                                       this.getMinutes(true)
                                                   ];

                                                   if (includeSeconds)
                                                   {
                                                       digits.push(this.getSeconds(true));
                                                   }

                                                   return this.digitize(digits);
                                               },

                                               /**
                                                * Gets number of days
                                                *
                                                * @param   bool  Should perform a modulus? If not sent, then no.
                                                * @return  int   Retuns a floored integer
                                                */

                                               getDays: function (mod)
                                               {
                                                   var days = this.getTimeSeconds() / 60 / 60 / 24;

                                                   if (mod)
                                                   {
                                                       days = days % 7;
                                                   }

                                                   return Math.floor(days);
                                               },

                                               /**
                                                * Gets an hourly breakdown
                                                *
                                                * @return  object  Returns a digitized object
                                                */

                                               getHourCounter: function ()
                                               {
                                                   var obj = this.digitize([
                                                                               this.getHours(),
                                                                               this.getMinutes(true),
                                                                               this.getSeconds(true)
                                                                           ]);

                                                   return obj;
                                               },

                                               /**
                                                * Gets an hourly breakdown
                                                *
                                                * @return  object  Returns a digitized object
                                                */

                                               getHourly: function ()
                                               {
                                                   return this.getHourCounter();
                                               },

                                               /**
                                                * Gets number of hours
                                                *
                                                * @param   bool  Should perform a modulus? If not sent, then no.
                                                * @return  int   Retuns a floored integer
                                                */

                                               getHours: function (mod)
                                               {
                                                   var hours = this.getTimeSeconds() / 60 / 60;

                                                   if (mod)
                                                   {
                                                       hours = hours % 24;
                                                   }

                                                   return Math.floor(hours);
                                               },

                                               /**
                                                * Gets the twenty-four hour time
                                                *
                                                * @return  object  returns a digitized object
                                                */

                                               getMilitaryTime: function ()
                                               {
                                                   var date = new Date();
                                                   var obj = this.digitize([
                                                                               date.getHours(),
                                                                               date.getMinutes(),
                                                                               date.getSeconds()
                                                                           ]);

                                                   return obj;
                                               },

                                               /**
                                                * Gets number of minutes
                                                *
                                                * @param   bool  Should perform a modulus? If not sent, then no.
                                                * @return  int   Retuns a floored integer
                                                */

                                               getMinutes: function (mod)
                                               {
                                                   var minutes = this.getTimeSeconds() / 60;

                                                   if (mod)
                                                   {
                                                       minutes = minutes % 60;
                                                   }

                                                   return Math.floor(minutes);
                                               },

                                               /**
                                                * Gets a minute breakdown
                                                */

                                               getMinuteCounter: function ()
                                               {
                                                   var obj = this.digitize([
                                                                               this.getMinutes(),
                                                                               this.getSeconds(true)
                                                                           ]);

                                                   return obj;
                                               },

                                               /**
                                                * Gets time count in seconds regardless of if targetting date or not.
                                                *
                                                * @return  int   Returns a floored integer
                                                */

                                               getTimeSeconds: function (mod)
                                               {
                                                   if (this.time instanceof Date)
                                                   {
                                                       if (this.factory.countdown)
                                                       {
                                                           if ((new Date()).getTime() > this.time.getTime())
                                                           {
                                                               this.factory.stop();
                                                           }
                                                           return Math.max(this.time.getTime() / 1000 - (new Date()).getTime() / 1000, 0);
                                                       }
                                                       else
                                                       {
                                                           return (new Date()).getTime() / 1000 - this.time.getTime() / 1000;
                                                       }
                                                   }
                                                   else
                                                   {
                                                       return this.time;
                                                   }
                                               },

                                               /**
                                                * Gets number of seconds
                                                *
                                                * @param   bool  Should perform a modulus? If not sent, then no.
                                                * @return  int   Retuns a ceiled integer
                                                */

                                               getSeconds: function (mod)
                                               {
                                                   var seconds = this.getTimeSeconds();

                                                   if (mod)
                                                   {
                                                       if (seconds == 60)
                                                       {
                                                           seconds = 0;
                                                       }
                                                       else
                                                       {
                                                           seconds = seconds % 60;
                                                       }
                                                   }

                                                   return Math.ceil(seconds);
                                               },

                                               /**
                                                * Gets the current twelve hour time
                                                *
                                                * @return  object  Returns a digitized object
                                                */

                                               getTime: function ()
                                               {
                                                   var date = new Date();
                                                   var hours = date.getHours();
                                                   var merid = hours > 12 ? 'PM' : 'AM';
                                                   var obj = this.digitize([
                                                                                   hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours),
                                                                                   date.getMinutes(),
                                                                                   date.getSeconds()
                                                                           ]);

                                                   return obj;
                                               },

                                               /**
                                                * Gets number of weeks
                                                *
                                                * @param   bool  Should perform a modulus? If not sent, then no.
                                                * @return  int   Retuns a floored integer
                                                */

                                               getWeeks: function ()
                                               {
                                                   var weeks = this.getTimeSeconds() / 60 / 60 / 24 / 7;

                                                   if (mod)
                                                   {
                                                       weeks = weeks % 52;
                                                   }

                                                   return Math.floor(weeks);
                                               },


                                               removeLeadingZeros: function (totalDigits, digits)
                                               {
                                                   var total = 0;
                                                   var newArray = [];

                                                   $.each(digits, function (i, digit)
                                                   {
                                                       if (i < totalDigits)
                                                       {
                                                           total += parseInt(digits[i], 10);
                                                       }
                                                       else
                                                       {
                                                           newArray.push(digits[i]);
                                                       }
                                                   });

                                                   if (total === 0)
                                                   {
                                                       return newArray;
                                                   }

                                                   return digits;
                                               },

                                               /**
                                                * Adds X second to the current time
                                                */

                                               addSeconds: function (x)
                                               {
                                                   this.time += x;
                                               },

                                               /**
                                                * Adds 1 second to the current time
                                                */

                                               addSecond: function ()
                                               {
                                                   this.addSeconds(1);
                                               },

                                               /**
                                                * Substracts X seconds from the current time
                                                */

                                               subSeconds: function (x)
                                               {
                                                   this.time -= x;
                                               },

                                               /**
                                                * Substracts 1 second from the current time
                                                */

                                               subSecond: function ()
                                               {
                                                   this.subSeconds(1);
                                               },

                                               /**
                                                * Converts the object to a human readable string
                                                */

                                               toString: function ()
                                               {
                                                   return this.getTimeSeconds().toString();
                                               }

                                               /*
                                                getYears: function() {
                                                return Math.floor(this.time / 60 / 60 / 24 / 7 / 52);
                                                },

                                                getDecades: function() {
                                                return Math.floor(this.getWeeks() / 10);
                                                }*/
                                           });

}(jQuery));

/*jshint smarttabs:true */

/**
 * FlipClock.js
 *
 * @author     Justin Kimbrell
 * @copyright  2013 - Objective HTML, LLC
 * @licesnse   http://www.opensource.org/licenses/mit-license.php
 */

(function ($)
{

    "use strict";

    /**
     * The FlipClock.Timer object managers the JS timers
     *
     * @param    object  The parent FlipClock.Factory object
     * @param    object  Override the default options
     */

    FlipClock.Timer = FlipClock.Base.extend({

                                                /**
                                                 * Callbacks
                                                 */

                                                callbacks: {
                                                    destroy: false,
                                                    create: false,
                                                    init: false,
                                                    interval: false,
                                                    start: false,
                                                    stop: false,
                                                    reset: false
                                                },

                                                /**
                                                 * FlipClock timer count (how many intervals have passed)
                                                 */

                                                count: 0,

                                                /**
                                                 * The parent FlipClock.Factory object
                                                 */

                                                factory: false,

                                                /**
                                                 * Timer interval (1 second by default)
                                                 */

                                                interval: 1000,

                                                /**
                                                 * The rate of the animation in milliseconds
                                                 */

                                                animationRate: 1000,

                                                /**
                                                 * Constructor
                                                 *
                                                 * @return    void
                                                 */

                                                constructor: function (factory, options)
                                                {
                                                    this.base(options);
                                                    this.factory = factory;
                                                    this.callback(this.callbacks.init);
                                                    this.callback(this.callbacks.create);
                                                },

                                                /**
                                                 * This method gets the elapsed the time as an interger
                                                 *
                                                 * @return    void
                                                 */

                                                getElapsed: function ()
                                                {
                                                    return this.count * this.interval;
                                                },

                                                /**
                                                 * This method gets the elapsed the time as a Date object
                                                 *
                                                 * @return    void
                                                 */

                                                getElapsedTime: function ()
                                                {
                                                    return new Date(this.time + this.getElapsed());
                                                },

                                                /**
                                                 * This method is resets the timer
                                                 *
                                                 * @param    callback  This method resets the timer back to 0
                                                 * @return    void
                                                 */

                                                reset: function (callback)
                                                {
                                                    clearInterval(this.timer);
                                                    this.count = 0;
                                                    this._setInterval(callback);
                                                    this.callback(this.callbacks.reset);
                                                },

                                                /**
                                                 * This method is starts the timer
                                                 *
                                                 * @param    callback  A function that is called once the timer is destroyed
                                                 * @return    void
                                                 */

                                                start: function (callback)
                                                {
                                                    this.factory.running = true;
                                                    this._createTimer(callback);
                                                    this.callback(this.callbacks.start);
                                                },

                                                /**
                                                 * This method is stops the timer
                                                 *
                                                 * @param    callback  A function that is called once the timer is destroyed
                                                 * @return    void
                                                 */

                                                stop: function (callback)
                                                {
                                                    this.factory.running = false;
                                                    this._clearInterval(callback);
                                                    this.callback(this.callbacks.stop);
                                                    this.callback(callback);
                                                },

                                                /**
                                                 * Clear the timer interval
                                                 *
                                                 * @return    void
                                                 */

                                                _clearInterval: function ()
                                                {
                                                    clearInterval(this.timer);
                                                },

                                                /**
                                                 * Create the timer object
                                                 *
                                                 * @param    callback  A function that is called once the timer is created
                                                 * @return    void
                                                 */

                                                _createTimer: function (callback)
                                                {
                                                    this._setInterval(callback);
                                                },

                                                /**
                                                 * Destroy the timer object
                                                 *
                                                 * @param    callback  A function that is called once the timer is destroyed
                                                 * @return    void
                                                 */

                                                _destroyTimer: function (callback)
                                                {
                                                    this._clearInterval();
                                                    this.timer = false;
                                                    this.callback(callback);
                                                    this.callback(this.callbacks.destroy);
                                                },

                                                /**
                                                 * This method is called each time the timer interval is ran
                                                 *
                                                 * @param    callback  A function that is called once the timer is destroyed
                                                 * @return    void
                                                 */

                                                _interval: function (callback)
                                                {
                                                    this.callback(this.callbacks.interval);
                                                    this.callback(callback);
                                                    this.count++;
                                                },

                                                /**
                                                 * This sets the timer interval
                                                 *
                                                 * @param    callback  A function that is called once the timer is destroyed
                                                 * @return    void
                                                 */

                                                _setInterval: function (callback)
                                                {
                                                    var t = this;

                                                    t._interval(callback);

                                                    t.timer = setInterval(function ()
                                                                          {
                                                                              t._interval(callback);
                                                                          }, this.interval);
                                                }

                                            });

}(jQuery));

(function ($)
{


    FlipClock.CounterFace = FlipClock.Face.extend({

                                                      minimumDigits: 2,

                                                      constructor: function (factory, options)
                                                      {
                                                          //factory.timer.interval = 0;
                                                          factory.autoStart = options.autoStart ? true : false;
                                                          //factory.running  	   = true;

                                                          factory.increment = function ()
                                                          {
                                                              factory.countdown = false;
                                                              factory.setTime(factory.getTime().getTimeSeconds() + 1);
                                                          };

                                                          factory.decrement = function ()
                                                          {
                                                              factory.countdown = true;
                                                              var time = factory.getTime().getTimeSeconds();
                                                              if (time > 0)
                                                              {
                                                                  factory.setTime(time - 1);
                                                              }
                                                          };

                                                          factory.setValue = function (digits)
                                                          {
                                                              factory.setTime(digits);
                                                          };

                                                          factory.setCounter = function (digits)
                                                          {
                                                              factory.setTime(digits);
                                                          };

                                                          this.base(factory, options);
                                                      },


                                                      build: function ()
                                                      {
                                                          var t = this;
                                                          var children = this.factory.$el.find('ul');
                                                          var lists = [];
                                                          var time = this.factory.getTime().digitize([this.factory.getTime().time]);

                                                          if (time.length > children.length)
                                                          {
                                                              $.each(time, function (i, digit)
                                                              {
                                                                  var list = t.createList(digit, {
                                                                      minimumDigits: t.minimumDigits
                                                                  });

                                                                  list.select(digit);
                                                                  lists.push(list);
                                                              });

                                                          }

                                                          $.each(lists, function (i, list)
                                                          {
                                                              list.play();
                                                          });

                                                          this.factory.lists = lists;
                                                      },

                                                      /**
                                                       * Flip the clock face
                                                       */

                                                      flip: function (time, doNotAddPlayClass)
                                                      {
                                                          if (!time)
                                                          {
                                                              time = this.factory.getTime().digitize([this.factory.getTime().time]);
                                                          }

                                                          if (this.autoStart)
                                                          {
                                                              this.autoIncrement();
                                                          }

                                                          this.base(time, doNotAddPlayClass);
                                                      },

                                                      /**
                                                       * Reset the clock face
                                                       */

                                                      reset: function ()
                                                      {
                                                          this.factory.time = new FlipClock.Time(
                                                              this.factor,
                                                              this.factory.original ? Math.round(this.factory.original) : 0
                                                          );

                                                          this.flip();
                                                      }
                                                  });

}(jQuery));
(function ($)
{


    FlipClock.DailyCounterFace = FlipClock.Face.extend({

                                                           showSeconds: true,

                                                           /**
                                                            * Constructor
                                                            *
                                                            * @param  object  The parent FlipClock.Factory object
                                                            * @param  object  An object of properties to override the default
                                                            */

                                                           constructor: function (factory, options)
                                                           {
                                                               this.base(factory, options);
                                                           },

                                                           /**
                                                            * Build the clock face
                                                            */

                                                           build: function (excludeHours, time)
                                                           {
                                                               var t = this;
                                                               var children = this.factory.$el.find('ul');
                                                               var lists = [];
                                                               var offset = 0;

                                                               time = time ? time : this.factory.time.getDayCounter(this.showSeconds);

                                                               if (time.length > children.length)
                                                               {
                                                                   $.each(time, function (i, digit)
                                                                   {
                                                                       lists.push(t.createList(digit));
                                                                   });
                                                               }

                                                               this.factory.lists = lists;

                                                               if (this.showSeconds)
                                                               {
                                                                   $(this.createDivider('Seconds')).insertBefore(this.factory.lists[this.factory.lists.length - 2].$el);
                                                               }
                                                               else
                                                               {
                                                                   offset = 2;
                                                               }

                                                               $(this.createDivider('Minutes')).insertBefore(this.factory.lists[this.factory.lists.length - 4 + offset].$el);
                                                               $(this.createDivider('Hours')).insertBefore(this.factory.lists[this.factory.lists.length - 6 + offset].$el);
                                                               $(this.createDivider('Days', true)).insertBefore(this.factory.lists[0].$el);

                                                               // this._clearExcessDigits();

                                                               if (this.autoStart)
                                                               {
                                                                   this.start();
                                                               }
                                                           },

                                                           /**
                                                            * Flip the clock face
                                                            */

                                                           flip: function (time, doNotAddPlayClass)
                                                           {
                                                               if (!time)
                                                               {
                                                                   time = this.factory.time.getDayCounter(this.showSeconds);
                                                               }

                                                               this.autoIncrement();

                                                               this.base(time, doNotAddPlayClass);
                                                           }

                                                           /**
                                                            * Clear the excess digits from the tens columns for sec/min
                                                            */

                                                           /*
                                                            _clearExcessDigits: function() {
                                                            var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
                                                            var tenMinutes = this.factory.lists[this.factory.lists.length - 4];

                                                            for(var x = 6; x < 10; x++) {
                                                            tenSeconds.$el.find('li:last-child').remove();
                                                            tenMinutes.$el.find('li:last-child').remove();
                                                            }
                                                            }
                                                            */

                                                       });

}(jQuery));
(function ($)
{

    /**
     * Hourly Counter Clock Face
     *
     * This class will generate an hourly counter for FlipClock.js. An
     * hour counter will track hours, minutes, and seconds. If number of
     * available digits is exceeded in the count, a new digit will be
     * created.
     *
     * @param  object  The parent FlipClock.Factory object
     * @param  object  An object of properties to override the default
     */

    FlipClock.HourlyCounterFace = FlipClock.Face.extend({

                                                            // clearExcessDigits: true,

                                                            /**
                                                             * Constructor
                                                             *
                                                             * @param  object  The parent FlipClock.Factory object
                                                             * @param  object  An object of properties to override the default
                                                             */

                                                            constructor: function (factory, options)
                                                            {
                                                                this.base(factory, options);
                                                            },

                                                            /**
                                                             * Build the clock face
                                                             */

                                                            build: function (excludeHours, time)
                                                            {
                                                                var t = this;
                                                                var children = this.factory.$el.find('ul');
                                                                var lists = [];

                                                                time = time ? time : this.factory.time.getHourCounter();

                                                                if (time.length > children.length)
                                                                {
                                                                    $.each(time, function (i, digit)
                                                                    {
                                                                        lists.push(t.createList(digit));
                                                                    });
                                                                }

                                                                this.factory.lists = lists;

                                                                $(this.createDivider('Seconds')).insertBefore(this.factory.lists[this.factory.lists.length - 2].$el);
                                                                $(this.createDivider('Minutes')).insertBefore(this.factory.lists[this.factory.lists.length - 4].$el);

                                                                if (!excludeHours)
                                                                {
                                                                    $(this.createDivider('Hours', true)).insertBefore(this.factory.lists[0].$el);
                                                                }

                                                                /*
                                                                 if(this.clearExcessDigits) {
                                                                 this._clearExcessDigits();
                                                                 }
                                                                 */

                                                                if (this.autoStart)
                                                                {
                                                                    this.start();
                                                                }
                                                            },

                                                            /**
                                                             * Flip the clock face
                                                             */

                                                            flip: function (time, doNotAddPlayClass)
                                                            {
                                                                if (!time)
                                                                {
                                                                    time = this.factory.time.getHourCounter();
                                                                }

                                                                this.autoIncrement();

                                                                this.base(time, doNotAddPlayClass);
                                                            }

                                                            /**
                                                             * Clear the excess digits from the tens columns for sec/min
                                                             */

                                                            /*
                                                             _clearExcessDigits: function() {
                                                             var tenSeconds = this.factory.lists[this.factory.lists.length - 2];
                                                             var tenMinutes = this.factory.lists[this.factory.lists.length - 4];

                                                             for(var x = 6; x < 10; x++) {
                                                             tenSeconds.$el.find('li:last-child').remove();
                                                             tenMinutes.$el.find('li:last-child').remove();
                                                             }
                                                             }
                                                             */

                                                        });

}(jQuery));
(function ($)
{

    /**
     * FlipClock English Language Pack
     *
     * This class will used to translate tokens into the English language.
     *
     */

    FlipClock.Lang.English = {

        'years': 'Years',
        'months': 'Months',
        'days': 'Days',
        'hours': 'Hours',
        'minutes': 'Minutes',
        'seconds': 'Seconds'

    };

    /* Create various aliases for convenience */

    FlipClock.Lang['en'] = FlipClock.Lang.English;
    FlipClock.Lang['en-us'] = FlipClock.Lang.English;
    FlipClock.Lang['english'] = FlipClock.Lang.English;

}(jQuery));

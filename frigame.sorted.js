/*global friGame */
/*jshint bitwise: true, curly: true, eqeqeq: true, esversion: 3, forin: true, freeze: true, funcscope: true, futurehostile: true, iterator: true, latedef: true, noarg: true, nocomma: true, nonbsp: true, nonew: true, notypeof: false, shadow: outer, singleGroups: false, strict: true, undef: true, unused: true, varstmt: false, eqnull: false, plusplus: true, browser: true, laxbreak: true, laxcomma: true */

// Copyright (c) 2011-2017 Franco Bugnano

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Uses ideas and APIs inspired by:
// gameQuery Copyright (c) 2008 Selim Arsever (gamequery.onaluf.org), licensed under the MIT

(function (fg) {
	'use strict';

	var
		overrides = {},
		sortedGroupMakers,
		sortedBaseSpriteMethods
	;

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	// Extend the Animation object in order to support originx and originy

	overrides.PAnimation = fg.pick(fg.PAnimation, [
		'init',
		'onLoad'
	]);

	fg.extend(fg.PAnimation, {
		init: function (imageURL, options) {
			var
				my_options,
				new_options = options || {}
			;

			if (this.options) {
				my_options = this.options;
			} else {
				my_options = {};
				this.options = my_options;
			}

			overrides.PAnimation.init.apply(this, arguments);

			// Set default options
			fg.extend(my_options, {
				// Public options
				originx: null,
				originy: null

				// Implementation details
			});

			new_options = fg.extend(my_options, fg.pick(new_options, [
				'originx',
				'originy'
			]));
		},

		onLoad: function () {
			var
				options = this.options,
				originx = options.originx,
				originy = options.originy,
				round = fg.truncate
			;

			overrides.PAnimation.onLoad.apply(this, arguments);

			// If the origin is not specified it defaults to the bottom center of the frame
			if (originx === null) {
				options.originx = options.halfWidth;
			} else if (typeof originx === 'string') {
				options.originx = this[originx];

				if (window.console) {
					if (!((originx === 'halfWidth') || (originx === 'width'))) {
						console.error('Invalid originx: ' + originx);
						console.trace();
					}
				}
			} else {
				options.originx = round(originx) || 0;
			}

			if (originy === null) {
				options.originy = options.frameHeight;
			} else if (typeof originy === 'string') {
				options.originy = this[originy];

				if (window.console) {
					if (!((originy === 'halfHeight') || (originy === 'height'))) {
						console.error('Invalid originy: ' + originy);
						console.trace();
					}
				}
			} else {
				options.originy = round(originy) || 0;
			}

			this.originx = options.originx;
			this.originy = options.originy;
		}
	});

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	// Extend the Base Sprite object in order to support originx and originy

	function sortedBaseSpriteInit(name, options, parent) {
		/*jshint validthis: true */
		var
			my_options,
			new_options = options || {},
			originx = new_options.originx,
			originy = new_options.originy,
			round = fg.truncate
		;

		if (this.options) {
			my_options = this.options;
		} else {
			my_options = {};
			this.options = my_options;
		}

		if (originx === undefined) {
			my_options.originx = 'halfWidth';
		} else if (typeof originx === 'string') {
			my_options.originx = originx;

			if (window.console) {
				if (!((originx === 'halfWidth') || (originx === 'width'))) {
					console.error('Invalid originx: ' + originx);
					console.trace();
				}
			}
		} else {
			my_options.originx = round(originx) || 0;
		}

		if (originy === undefined) {
			my_options.originy = 'height';
		} else if (typeof originy === 'string') {
			my_options.originy = originy;

			if (window.console) {
				if (!((originy === 'halfHeight') || (originy === 'height'))) {
					console.error('Invalid originy: ' + originy);
					console.trace();
				}
			}
		} else {
			my_options.originy = round(originy) || 0;
		}
	}

	sortedBaseSpriteMethods = {
		origin: function (originx, originy) {
			var
				options = this.options,
				round = fg.truncate
			;

			if (originx === undefined) {
				return options.originx;
			}

			fg.s[this.parent].needsSorting = true;

			if (typeof originx === 'string') {
				if (window.console) {
					if (!((originx === 'halfWidth') || (originx === 'width'))) {
						console.error('Invalid originx: ' + originx);
						console.trace();
					}
				}
			} else {
				originx = round(originx) || 0;
			}

			options.originx = originx;

			if (originy === undefined) {
				// If originy isn't specified, it is assumed to be equal to originx.
				if (originx === 'halfWidth') {
					options.originy = 'halfHeight';
				} else if (originx === 'width') {
					options.originy = 'height';
				} else {
					options.originy = originx;
				}
			} else {
				if (typeof originy === 'string') {
					options.originy = originy;

					if (window.console) {
						if (!((originy === 'halfHeight') || (originy === 'height'))) {
							console.error('Invalid originy: ' + originy);
							console.trace();
						}
					}
				} else {
					options.originy = round(originy) || 0;
				}
			}

			return this;
		},

		originx: function (originx) {
			var
				options = this.options
			;

			if (originx === undefined) {
				return options.originx;
			}

			fg.s[this.parent].needsSorting = true;

			if (typeof originx === 'string') {
				options.originx = originx;

				if (window.console) {
					if (!((originx === 'halfWidth') || (originx === 'width'))) {
						console.error('Invalid originx: ' + originx);
						console.trace();
					}
				}
			} else {
				options.originx = fg.truncate(originx) || 0;
			}

			return this;
		},

		originy: function (originy) {
			var
				options = this.options
			;

			if (originy === undefined) {
				return options.originy;
			}

			fg.s[this.parent].needsSorting = true;

			if (typeof originy === 'string') {
				options.originy = originy;

				if (window.console) {
					if (!((originy === 'halfHeight') || (originy === 'height'))) {
						console.error('Invalid originy: ' + originy);
						console.trace();
					}
				}
			} else {
				options.originy = fg.truncate(originy) || 0;
			}

			return this;
		}
	};

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	// Extend the Sprite object in order to support originx and originy

	fg.PSortedSprite = Object.create(fg.PSprite);
	fg.extend(fg.PSortedSprite, sortedBaseSpriteMethods);
	fg.extend(fg.PSortedSprite, {
		init: function (name, options, parent) {
			sortedBaseSpriteInit.apply(this, arguments);
			fg.PSprite.init.apply(this, arguments);
		},

		// Public functions

		move: function (options) {
			fg.s[this.parent].needsSorting = true;

			return fg.PSprite.move.apply(this, arguments);
		},

		setAnimation: function (options) {
			var
				my_options = this.options,
				new_options = options || {},
				originx = new_options.originx,
				originy = new_options.originy,
				animation,
				animation_redefined = new_options.animation !== undefined,
				parent = fg.s[this.parent],
				round = fg.truncate
			;

			if (animation_redefined) {
				animation = fg.r[new_options.animation];
			} else {
				animation = this.options.animation;
			}

			// The origin must be updated only if explicitly set, or if the animation gets redefined
			if (originx !== undefined) {
				parent.needsSorting = true;
				if (typeof originx === 'string') {
					my_options.originx = originx;

					if (window.console) {
						if (!((originx === 'halfWidth') || (originx === 'width'))) {
							console.error('Invalid originx: ' + originx);
							console.trace();
						}
					}
				} else {
					my_options.originx = round(originx) || 0;
				}
			} else {
				if (animation_redefined) {
					parent.needsSorting = true;
					if (animation) {
						my_options.originx = animation.originx;
					} else {
						my_options.originx = 'halfWidth';
					}
				}
			}

			if (originy !== undefined) {
				parent.needsSorting = true;
				if (typeof originy === 'string') {
					my_options.originy = originy;

					if (window.console) {
						if (!((originy === 'halfHeight') || (originy === 'height'))) {
							console.error('Invalid originy: ' + originy);
							console.trace();
						}
					}
				} else {
					my_options.originy = round(originy) || 0;
				}
			} else {
				if (animation_redefined) {
					parent.needsSorting = true;
					if (animation) {
						my_options.originy = animation.originy;
					} else {
						my_options.originy = 'height';
					}
				}
			}

			return fg.PSprite.setAnimation.apply(this, arguments);
		}
	});

	fg.SortedSprite = fg.Maker(fg.PSortedSprite);

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	// Extend the Sprite Group object in order to support originx and originy

	fg.extend(fg.PSpriteGroup, sortedBaseSpriteMethods);

	fg.PSortedSpriteGroup = Object.create(fg.PSpriteGroup);
	fg.extend(fg.PSortedSpriteGroup, sortedBaseSpriteMethods);
	fg.extend(fg.PSortedSpriteGroup, {
		init: function (name, options, parent) {
			sortedBaseSpriteInit.apply(this, arguments);

			this.needsSorting = false;

			fg.PSpriteGroup.init.apply(this, arguments);
		},

		// Public functions

		move: function (options) {
			fg.s[this.parent].needsSorting = true;

			return fg.PSpriteGroup.move.apply(this, arguments);
		},

		addSprite: function (name, options) {
			var
				sprite = fg.SortedSprite(name, options, this.name)
			;

			this.layers.push({name: name, obj: sprite});

			this.checkUpdate();

			return this;
		},

		insertSprite: function (name, options) {
			var
				sprite = fg.SortedSprite(name, options, this.name)
			;

			this.layers.unshift({name: name, obj: sprite});

			this.checkUpdate();

			return this;
		},

		addGroup: function (name, options) {
			var
				group = Object.create(fg.PSpriteGroup)
			;

			group.init = this.init;
			group.move = this.move;

			group.init(name, options, this.name);

			this.layers.push({name: name, obj: group});

			this.checkUpdate();

			return group;
		},

		insertGroup: function (name, options) {
			var
				group = Object.create(fg.PSpriteGroup)
			;

			group.init = this.init;
			group.move = this.move;

			group.init(name, options, this.name);

			this.layers.unshift({name: name, obj: group});

			this.checkUpdate();

			return group;
		},

		// Functions for depth sorting of the sprites
		sortLayers: function () {
			var
				i,
				j,
				obj1,
				obj2,
				y,
				originy,
				layers = this.layers,
				len_layers = layers.length,
				len_layers_3 = len_layers / 3,
				gap,
				temp1,
				temp2,
				sort_i1,
				sort_y1,
				sort_y2
			;

			// Save the drawing order of the layers in order to make a stable sort,
			// and the computed y value, in order to speed up sorting
			for (i = 0; i < len_layers; i += 1) {
				obj1 = layers[i].obj;

				originy = obj1.options.originy;
				if (typeof originy === 'string') {
					originy = obj1[originy];
				}

				y = obj1.top + originy;
				obj1.sort_y = y;
				obj1.sort_i = i;
			}

			// Generate Knuth's gap sequence
			gap = 1;
			while (gap < len_layers_3) {
				gap = (3 * gap) + 1;
			}

			// Start with the largest gap and work down to a gap of 1
			while (gap >= 1) {
				// Do a gapped insertion sort for this gap size.
				// The first gap elements a[0..gap-1] are already in gapped order
				// keep adding one more element until the entire array is gap sorted
				for (i = gap; i < len_layers; i += 1)
				{
					// add a[i] to the elements that have been gap sorted
					// save a[i] in temp1 and make a hole at position i
					temp1 = layers[i];
					obj1 = temp1.obj;
					sort_i1 = obj1.sort_i;
					sort_y1 = obj1.sort_y;

					// shift earlier gap-sorted elements up until the correct location for a[i] is found
					j = i;
					while (j >= gap) {
						temp2 = layers[j - gap];
						obj2 = temp2.obj;

						sort_y2 = obj2.sort_y;

						if (!((sort_y2 > sort_y1) || ((sort_y2 === sort_y1) && (obj2.sort_i > sort_i1)))) {
							break;
						}

						layers[j] = temp2;
						j -= gap;
					}

					// put temp1 (the original a[i]) in its correct location
					layers[j] = temp1;
				}

				gap = (gap - 1) / 3;
			}

			return this;
		},

		// Implementation details

		draw: function (interp) {
			if (this.needsSorting) {
				this.needsSorting = false;
				this.sortLayers();
			}

			fg.PSpriteGroup.draw.apply(this, arguments);
		}
	});

	fg.SortedSpriteGroup = fg.Maker(fg.PSortedSpriteGroup);

	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //
	// ******************************************************************** //

	sortedGroupMakers = {
		addSortedGroup: function (name, options) {
			var
				group = fg.SortedSpriteGroup(name, options, this.name)
			;

			this.layers.push({name: name, obj: group});

			this.checkUpdate();

			return group;
		},

		insertSortedGroup: function (name, options) {
			var
				group = fg.SortedSpriteGroup(name, options, this.name)
			;

			this.layers.unshift({name: name, obj: group});

			this.checkUpdate();

			return group;
		}
	};

	fg.extend(fg.PSortedSpriteGroup, sortedGroupMakers);
	fg.extend(fg.PSpriteGroup, sortedGroupMakers);

	if (fg.fx) {
		fg.extend(fg.fx.hooks, {
			origin: {
				get: function (s) {
					var
						origin = s.origin()
					;

					if (typeof origin === 'string') {
						origin = s[origin];
					}

					return origin;
				},
				set: function (s, value) {
					s.origin(value);
				}
			},
			originx: {
				get: function (s) {
					var
						origin = s.originx()
					;

					if (typeof origin === 'string') {
						origin = s[origin];
					}

					return origin;
				},
				set: function (s, value) {
					s.originx(value);
				}
			},
			originy: {
				get: function (s) {
					var
						origin = s.originy()
					;

					if (typeof origin === 'string') {
						origin = s[origin];
					}

					return origin;
				},
				set: function (s, value) {
					s.originy(value);
				}
			}
		});
	}
}(friGame));


/**
 * @constructor
 */
function Button(group, onclick) {
	this.group = group;
	this.onclick = onclick;
	this.hover = false;
	this.down = false;
	this.enabled = !!onclick;
}
Button.prototype.draw = function() {
	var g = this.group;
	var ctx = g.manager.vis.main.ctx;
	var loc = this.getLocation();
	ctx.save();
	ctx.fillStyle = '#fff';
	ctx.fillRect(loc.x, loc.y, loc.w, loc.h);
	ctx.beginPath();
	ctx.moveTo(loc.x, loc.y);
	ctx.lineTo(loc.x + loc.w, loc.y);
	ctx.lineTo(loc.x + loc.w, loc.y + loc.h);
	ctx.lineTo(loc.x, loc.y + loc.h);
	ctx.closePath();
	ctx.clip();
	var r = 0.2 * Math.min(loc.w, loc.h);
	if (this.onclick) {
		if (this.hover || this.down) {
			shapeRoundedRect(ctx, loc.x, loc.y, loc.w, loc.h, 1, r);
			ctx.fillStyle = /*this.down
					? 'rgb(255, 200, 0)'
					: */'rgb(255, 230, 200)';
			ctx.fill();
		}
		if (this.down) {
			ctx.shadowBlur = 1;
		} else {
			ctx.shadowBlur = 4;
			ctx.shadowOffsetX = -2;
			ctx.shadowOffsetY = +2;
		}
		ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
	}
	ctx.save();
	ctx.translate(loc.x, (this.down) ? loc.y + 1 : loc.y - 1);
	this.drawInternal(ctx, loc.w, loc.h);
	ctx.restore();
	if (this.onclick && (this.hover || this.down)) {
		ctx.shadowColor = 'rgba(0, 0, 0, 0)';
		ctx.lineWidth = 2;
		ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
		ctx.stroke();
	}
	ctx.restore();
};
Button.prototype.mouseDown = function() {
	switch (this.group.mode) {
		case ButtonGroup.MODE_RADIO:
			if (this.down) return;
			var btns = this.group.buttons;
			for (var i = 0; i < btns.length; i++) {
				if (btns[i].down) {
					btns[i].down = false;
					btns[i].draw();
				}
			}
		case ButtonGroup.MODE_NORMAL:
			this.down = true;
			this.draw();
			break;
	}
};
Button.prototype.mouseUp = function() {
	switch (this.group.mode) {
		case ButtonGroup.MODE_NORMAL:
			this.down = false;
			this.draw();
			break;
	}
};


/**
 * @constructor
 */
function ButtonGroup(manager, border) {
	this.buttons = [];
	this.manager = manager;
	this.border = border ? border : 0;
}
ButtonGroup.MODE_HIDDEN = 0;
ButtonGroup.MODE_NORMAL = 1;
ButtonGroup.MODE_RADIO = 2;
ButtonGroup.prototype.draw = function() {
	for (var i = 0; i < this.buttons.length; i++) {
		if (this.buttons[i].draw) this.buttons[i].draw();
	}
};
ButtonGroup.prototype.mouseMove = function(mx, my) {
	for (var i = 0; i < this.buttons.length; i++) {
		if (this.buttons[i].getLocation) {
			if (this.buttons[i].getLocation().contains(mx, my)) {
				return (this.buttons[i].enabled) ? this.buttons[i] : null;
			}
		}
	}
	return null;
};


/**
 * @constructor
 */
function ImageButton(group, offset, delta, onclick) {
	Button.apply(this, [group, onclick]);
	this.offset = offset;
	this.delta = delta;
}
ImageButton.prototype.draw = Button.prototype.draw;
ImageButton.prototype.drawInternal = function(ctx, w, h) {
	var b = this.group.border;
	var bs = this.group.size - 2 * this.group.border;
	ctx.drawImage(this.group.img, this.offset, 0, bs, bs, b, b, bs, bs);
};
ImageButton.prototype.getLocation = function() {
	return new Location(
		this.group.x + (this.group.vertical ? 0 : this.delta),
		this.group.y + (this.group.vertical ? this.delta : 0),
		this.group.size, this.group.size);
};
ImageButton.prototype.mouseUp = Button.prototype.mouseUp;
ImageButton.prototype.mouseDown = Button.prototype.mouseDown;


/**
 * @constructor
 */
function ImageButtonGroup(manager, img, layout, mode, border) {
	ButtonGroup.apply(this, [manager, border]);
	this.img = img;
	this.vertical = layout;
	this.mode = mode;
	this.size = img.height + 2 * this.border;
	this.x = 0;
	this.y = 0;
	this.w = (this.vertical) ? this.size : 0;
	this.h = (this.vertical) ? 0 : this.size;
}
ImageButtonGroup.HORIZONTAL = false;
ImageButtonGroup.VERTICAL = true;
ImageButtonGroup.prototype.addButton = function(idx, onclick) {
	var btn = new ImageButton(this, (this.size - 2 * this.border) * idx, (this.vertical) ? this.h : this.w, onclick);
	this.buttons.push(btn);
	this.vertical ? this.h += this.size : this.w += this.size;
	return btn;
};
ImageButtonGroup.prototype.addSpace = function(size) {
	this.buttons.push({
		delta: (this.vertical) ? this.h : this.w,
		size: size
	});
	this.vertical ? this.h += size : this.w += size;
};
ImageButtonGroup.prototype.draw = ButtonGroup.prototype.draw;
ImageButtonGroup.prototype.mouseMove = ButtonGroup.prototype.mouseMove;

/**
 * @constructor
 */
function TextButton(group, text, color, onclick) {
	Button.apply(this, [group, onclick]);
	this.text = text;
	this.color = color;
	var ctx = this.group.manager.vis.main.ctx;
	this.x = 0;
	this.y = 0;
	ctx.font = 'bold 20px Arial';
	this.w = ctx.measureText(text).width + 8;
	this.h = 28;
}
TextButton.prototype.draw = Button.prototype.draw;
TextButton.prototype.drawInternal = function(ctx) {
	ctx.shadowColor = 'rgba(255,255,255,1)';
	ctx.textAlign = 'left';
	ctx.textBaseline = 'bottom';
	ctx.font = 'bold 20px Arial';
	ctx.fillStyle = this.color;
	ctx.fillText(this.text, 4, 25);
};
TextButton.prototype.getLocation = function() {
	return new Location(this.group.x + this.x, this.group.y + this.y,
			this.w, this.h);
};
TextButton.prototype.mouseUp = Button.prototype.mouseUp;
TextButton.prototype.mouseDown = Button.prototype.mouseDown;


/**
 * @constructor
 */
function TextButtonGroup(manager, layout, mode, border) {
	ButtonGroup.apply(this, [manager, border]);
	this.layout = layout;
	this.mode = mode;
	this.x = 0;
	this.y = 0;
	this.h = undefined;
	this.w = undefined;
}
TextButtonGroup.FLOW = false;
TextButtonGroup.BLOCK = true;
TextButtonGroup.prototype.addButton = function(text, color, onclick) {
	var btn = new TextButton(this, text, color, onclick);
	this.buttons.push(btn);
	return btn;
};
TextButtonGroup.prototype.draw = ButtonGroup.prototype.draw;
TextButtonGroup.prototype.cascade = function(width) {
	this.w = width;
	var addX = 0;
	var addY = 0;
	for (var i = 0; i < this.buttons.length; i++) {
		var btn = this.buttons[i];
		if (addX && addX + btn.w > this.w) {
			addX = 0;
			addY += btn.h + 2;
		}
		btn.x = addX;
		btn.y = addY;
		addX += btn.w + 2;
	}
	return this.h = btn ? addY + btn.h : 0;
};
TextButtonGroup.prototype.mouseMove = ButtonGroup.prototype.mouseMove;


/**
 * Manages buttons and their mouse events.
 * @param {Visualizer} vis the visualizer
 * @constructor
 */
function ButtonManager(vis) {
	this.vis = vis;
	this.groups = {};
	this.hover = null;
	this.nailed = null;
}
/**
 * @returns {ImageButtonGroup} the created button group
 */
ButtonManager.prototype.addImageGroup = function(name, img, layout, mode, border) {
	return this.groups[name] = new ImageButtonGroup(this, img, layout, mode, border);
};
ButtonManager.prototype.addTextGroup = function(name, layout, mode, border) {
	return this.groups[name] = new TextButtonGroup(this, layout, mode, border);
};
ButtonManager.prototype.draw = function() {
	for (var name in this.groups) {
		if (this.groups[name].mode !== ButtonGroup.MODE_HIDDEN) {
			this.groups[name].draw();
		}
	}
};
ButtonManager.prototype.mouseMove = function(mx, my) {
	var result = null;
	for (var name in this.groups) {
		var bg = this.groups[name];
		if (bg.mode != ButtonGroup.MODE_HIDDEN && my >= bg.y && my < bg.y + bg.h && mx >= bg.x && mx < bg.x + bg.w) {
			result = bg.mouseMove(mx, my);
			if (result !== null) {
				break;
			}
		}
	}
	if (this.hover !== result) {
		if (this.hover) {
			if (this.hover.hover || this.hover.down) {
				this.hover.hover = false;
				this.hover.down &= this.hover.group.mode == ButtonGroup.MODE_RADIO;
				this.hover.draw();
			}
		}
		if (result && (!this.nailed || this.nailed === result)) {
			if (!result.hover) {
				result.hover = true;
				result.down = (result === this.nailed) || (result.down && (!this.hover || this.hover.group.mode == ButtonGroup.MODE_RADIO));
				result.draw();
			}
		}
		this.hover = result;
		this.repaintCheck();
	}
	return result;
};
ButtonManager.prototype.mouseUp = function() {
	if (this.nailed) {
		this.nailed.mouseUp();
		if (this.nailed == this.hover) {
			this.nailed.onclick();
		}
		this.nailed = null;
		this.repaintCheck();
	}
};
ButtonManager.prototype.mouseDown = function() {
	if (this.hover) {
		this.hover.mouseDown();
		this.nailed = this.hover;
		this.repaintCheck();
	}
};
/**
 * @private
 */
ButtonManager.prototype.repaintCheck = function() {
	if (this.vis.options['java']) {
		this.vis.main.element['repaint']();
	}
};

function shapeRoundedRect(ctx, x, y, w, h, margin, r) {
	var d = 0.5 * Math.PI;
	ctx.beginPath();
	ctx.moveTo(x + r + margin, y + margin);
	ctx.lineTo(x + w - r - margin, y + margin);
	ctx.arc(x + w - r - margin, y + r + margin, r, -d, 0, false);
	ctx.lineTo(x + w - margin, y + h - r - margin);
	ctx.arc(x + w - r - margin, y + h - r - margin, r, 0, d, false);
	ctx.lineTo(x + r + margin, y + h - margin);
	ctx.arc(x + r + margin, y + h - r - margin, r, d, 2 * d, false);
	ctx.lineTo(x + margin, y + r + margin);
	ctx.arc(x + r + margin, y + r + margin, r, 2 * d, 3 * d, false);
}
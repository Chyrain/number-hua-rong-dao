/*
 * Jqlite v1.0.0
 * ---------------------------------------------------------
 * Date: 2016-05-11T01:51Z
 * Author: Xiao-Bo Li <xiaoboleee@gmail.com> (http://www.yearnio.com)
 */
(function(global, factory) {
	if (typeof module === 'object') {
		module.exports = factory(global);
	} else if (typeof define === 'function') {
		define(function() {
			return factory(global);
		});
	} else {
		factory(global);
	}
}((typeof window !== 'undefined' ? window : this), function(window) {
	// ## var/extend ##
	var extend = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = false,
			isArray = Array.isArray || function(obj) {
				return /Array/i.test(typeof obj === 'object' ? ({}).toString.call(obj) : typeof obj);
			},
			isPlainObject = function(obj) {
				return (typeof obj === 'object' || /Object/i.test(({}).toString.call(obj))) &&
					!obj.nodeType && !(obj !== null && obj === obj.window) &&
					!(obj.constructor && !({}).hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf'));
			};
		// 第一个参数可以是深度复制标记
		if (typeof target === 'boolean' ||
			(typeof target === 'object' && /boolean/i.test(({}).toString.call(target)))) {
			deep = target;
			target = arguments[ i ] || {};
			i++;
		}
		// 支持针对对象和函数的扩充
		if ( typeof target !== 'object' &&
			typeof target !== 'function' &&
			!/Function/i.test({}.toString.call(target))) {
			target = {};
		}
		// 只有一个参数扩充this对象
		if ( i === length ) {
			target = this;
			i--;
		}
		// 执行扩充
		for ( ; i < length; i++ ) {
			if ( (options = arguments[ i ]) !== null ) {
				for ( name in options ) {
					if (options.hasOwnProperty(name)) {
						src = target[ name ];
						copy = options[ name ];
						if ( target === copy ) { // 避免无尽的循环
							continue;
						}
						if ( deep && copy && ( isPlainObject(copy) || (copyIsArray = isArray(copy)) ) ) {
							// 对简单对象或数组，执行克隆后再复制
							if ( copyIsArray ) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}
							target[ name ] = extend( deep, clone, copy );
						} else if ( copy !== undefined ) {
							// 对其他直接复制，忽略undefined类型数据
							target[ name ] = copy;
						}
					}
				}
			}
		}
		// 返回
		return target;
	};
	// ## var/type ##
	var type = function(obj) {
		// 处理 undefined null
		if (obj == null) {
			return obj + '';
		}
		// 处理 object (广义：包括函数、数组...)
		if (typeof obj === 'object' || typeof obj === 'function') {
			// Object.prototype.toString.call(obj)
			// 兼容所有
			// 返回 [object Xxxxx]
			// 其中Xxxxx取：Boolean Number String Function Array Date RegExp Object Error Symbol
			// HTMLDocument , HTMLBodyElement, HTMLDivElement,
			// 
			// 可以独立使用，注意：
			// - 字符串建议 typeof obj === 'string'
			// - DOM建议 obj.nodeType 为真
			var otype = Object.prototype.toString.call(obj).slice(8, -1);
			if (otype) {
				// 仅返回特定范围的值，其他的一律返回Object类型
				// 因为otype是内部产生，此处不需要太强的比对，单纯看是否存在即可
				if (!~('Boolean Number String Function Array Date RegExp Object Error Symbol').indexOf(otype)) {
					otype = 'Object';
				}
				return otype.toLowerCase();
			}
		}
		// 其他的类型：string ...
		return typeof obj;
	};
	// ## var/_arr ##
	var _arr = (function() {
		var arr = [];
		arr.isArray = Array.isArray || isArray; // 原生 兼容IE9+
		arr.isArraylike = isArraylike;
		arr.indexOf = indexOf;
		arr.inArray = inArray;
		arr.toArray = toArray;
		arr.merge = merge;
		arr.cull = cull;
		arr.pend = pend;
		arr.slice || (arr.slice = slice);
		arr.splice || (arr.splice = splice);
		arr.reduce || (arr.reduce = reduce);
		arr.insert = insert;
		arr.tile = tile;
		return arr;
		function isArray(obj) {
			return type(obj) === 'array';
		}
		function isArraylike(obj) {
			var length = !!obj && 'length' in obj && obj.length,
				tp = type( obj );
			if ( tp === 'function' || obj === obj.window ) {
				return false;
			}
			return type === 'array' || length === 0 ||
				typeof length === 'number' && length > 0 && ( length - 1 ) in obj;
		}
		function indexOf(arr, obj) {
			for (var i = 0, l = arr.length; i < l; i++) {
				if (arr[i] === obj) {
					return i;
				}
			}
			return -1;
		}
		function inArray() {
			// body...
		}
		/**
		 * 类数组的一部分转化为真正的数组，或者克隆一个数组
		 * @param  {Arraylike} list
		 * @param  {Number} start list的此序号开始
		 * @return {Array}
		 */
		function toArray(list, start) {
			start = start || 0;
			var i = list.length - start,
				ret = new Array(i);
			while (i--) {
				ret[i] = list[i + start];
			}
			return ret;
		}
		/**
		 * 按顺序对数组进行操作，并逐项传递操作结果
		 * @param  {Array}   arr      待处理的数组
		 * @param  {Function} callback 处理函数
		 * @param  {*}   initVal  初始值
		 * @return {*}            返回值
		 */
		function reduce(arr, callback, initVal) {
			if (arr.reduce) {
				return arr.reduce(callback, initVal);
			} else {
				var i = 0;
				if (!initVal) {
					// 如果没有指定initVal，则使用数组第一个元素作为initVal
					initVal = arr[i++];
				}
				for (; i < arr.length; i++) {
					initVal = callback(initVal, arr[i], i, arr);
				}
				return initVal;
			}
		}
		/**
		 * 从数组中剔除与指定数据相同的所有项
		 * @param  {Array} array 被处理数组
		 * @param  {*} item  数组项
		 * @return {Boolean}  true表示至少有一项匹配并已被剔除
		 */
		function cull(array, item) {
			var f = false, ff = true, it;
			for (var i = array.length - 1; i >= 0; i--) {
				it = array[i];
				if (it === item) {
					array.splice(i, 1);
					f = true;
				}/* else if (isPlainObject(item)) {
					for (var key in item) {
						if (it[key] !== item[key]) {
							ff = false;
						}
					}
					if (ff) {
						array.splice(i, 1);
						f = true;
					} else {
						ff = true;
					}
				}*/
			}
			return f;
		}
		function pend(array, item) {
			cull(array, item);
			array.push(item);
		}
		function merge(first, second) {
			var len = +second.length,
				j = 0,
				i = first.length;
			for ( ; j < len; j++ ) {
				first[ i++ ] = second[ j ];
			}
			first.length = i;
			return first;
		}
		function slice(argument) {
			// body...
		}
		function splice(argument) {
			// body...
		}
		function reduce(argument) {
			// body...
		}
		/**
		 * 按序号或排序或函数返回结果 向数组中插入数据
		 * 
		 * @param  {Array} arr
		 * @param  {Array|*} items 带插入元素
		 * @param  {Number|String|Function} sn 插入方式
		 *       eg. 2 在第2个位置原样插入items
		 *       eg. 'sequ[+]' 按item.sequ的升序排序
		 *       eg. 'sequ-' 按item.sequ的降序排序
		 *       eg. function(it, item){return 1;} 1正向 -1反向 0原序
		 * @return {Array} 生成的arr
		 *
		 * insert([1, 2], [3,4,5], 1) => [1,3,4,5,2]
		 * insert([1, 2, 4], 3, '+') => [1,2,3,4]
		 * insert([4, 2, 1], 3, '-') => [4,3,2,1]
		 */
		function insert(arr, items, sn) {
			if (!sn) {
				console.warn('insert方法需要三个参数');
				return ;
			}
			// 支持插入一个或多个item
			if (type(items) !== 'array') {
				items = [items];
			}
			// 依据不同的sn 选择插入方式
			var snType = type(sn)
			if (snType === 'number') { // 在sn对应的位置 将items整个插入
				arr.splice.apply(arr, [sn, 0].concat(items));
			} else { // 其他类型，将sn转为判断方法，返回true时，插入
				var snFunc, snDir;
				switch (snType) {
					case 'string':
						if (/-$/.test(sn)) {
							sn = sn.replace(/-$/, '');
							if (sn) {
								snFunc = function(it, item) {return it[sn] === item[sn] ? 0 : (it[sn] < item[sn] ? 1 : -1);};
							} else {
								snFunc = function(it, item) {return it === item ? 0 : (it < item ? 1 : -1);};
							}
						} else {
							sn = sn.replace(/\+$/, '');
							if (sn) {
								snFunc = function(it, item) {return it[sn] === item[sn] ? 0 : (it[sn] > item[sn] ? 1 : -1);};
							} else {
								snFunc = function(it, item) {return it === item ? 0 : (it > item ? 1 : -1);};
							}
						}
						break;
					case 'function':
						snFunc = sn;
						break;
					default:
						console.warn('未知的排序方法：' + sn);
				}
				if (snFunc) {
					arr.splice.apply(arr, [0, 0].concat(items));
					arr.sort(snFunc);
				}
			}
			return arr;
		}
		// 数组降维操作
		function tile(arr) {
			var ret = [], it;
			for (var i = 0, len = arr.length; i < len; i++) {
				it = arr[i];
				if (isArray(it)) {
					it = tile(it);
					ret = ret.concat(it);
				} else {
					ret.push(it);
				}
			}
			return ret;
		}
	}());
	// ## var/_str ##
	var _str = (function() {
		var str = {};
		// str.slice(3, -1) 兼容所有 
		str.trim || (str.trim = trim); // IE9+
		str.camelCase = camelCase;
		str.format = format;
		str.fString = fString;
		str.fNumber = fNumber;
		str.fTime = fTime;
		str.fLink = fLink;
		return str;
		/**
		 * 清除字符串首尾的空字符
		 * 不改变原字符串
		 * 原生接口 支持到IE9+
		 * 
		 * @return {String}
		 */
		function trim() {
			return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
		}
		/**
		 * 将xxx-yy_zz转化为xxxYyZz
		 * @param  {String} str 被转化的字符串
		 * @return {String}      转化后的字符串
		 */
		function camelCase(str) {
			if (typeof str !== 'string') {
				throw new Error('camelCase函数只处理String类型数据，不支持：' + str);
			}
			return str.replace(/(_|-)(\w)/g, function(full, line, charactor) {
				return charactor.toUpperCase();
			});
		}
		/**
		 * 数字格式化
		 *
		 * 000.00000 表示整数部分至少三位小数部分五位
		 * 必须指定小数点
		 */
		function fNumber(data, f) {
			if (/^[0\.]+$/.test(f)) {
				/\./.test(f) || (f += '.');
				f.replace(/^(0*)(\.)(0*)$/, function(f, inter, dot, deci) {
					// 四舍五入保留指定精度小数、转字符串
					data = parseFloat(data).toFixed(deci.length);
					// 补零
					var total = inter.length + (deci.length > 0 ? deci.length + 1 : 0);
					while (data.length < total) {
						data = '0' + data;
					}
				});
				return data;
			} else {
				console.warn('您指定了不规范的格式：' + f);
				return data;
			}
		}
		/**
		 * 字符串格式化
		 *
		 * 将长度超出的字符串的部分字符转成特定字符
		 */
		function fString(data, f) {
			var head, tail, text;
			text = f.replace(/^(\d*)/g, function(f, num) {
				head = num ? parseInt(num) : 0;
				return '';
			}).replace(/(\d*)$/, function(f, num) {
				tail = num ? parseInt(num) : 0;
				return '';
			});
			return (head + tail >= data.length) ?
				data :
				data.substr(0, head) + text + data.substr(data.length - tail);
		}
		/**
		 * 时间格式化 支持本地时间 不支持UTC时间
		 * 
		 * @param  {String || Timestamp} data 表示时间的数据
		 * @param  {String} f    格式标示 ‘dur’ 125:06 时长
		 * @return {String}      格式化后的时间
		 */
		function fTime(data, f) {
			if (/dur/.test(f)) {
				return Math.floor(data/60000) + ':' + Math.floor(data%60000/1000);
			}
			// 时间格式化函数
			var dt;
			if (typeof data === 'string' && /^\d{13}$/.test(data)) {
				dt = new Date(parseInt(data));
			} else {
				// 为了兼容IE，需要将2015-01-02变为2015/01/02
				dt = new Date(/-/.test(data) ? data.replace(/-/g, '/') : data);
			}
			if (dt.toJSON()) { // 如果是可用的时间对象
				if (/smart/.test(f)) {
					// 
					f = f.replace(/smart/, function() {
						var stamp = dt.getTime(),
							refer = new Date();
						// 今天
						refer.setHours(0);
						refer.setMinutes(0);
						refer.setSeconds(0);
						refer.setMilliseconds(0);
						if (stamp >= refer.getTime()) {
							refer.setDate(refer.getDate() + 1);
							if (stamp < refer.getTime()) {
								return '今天';
							}
							refer.setDate(refer.getDate() + 1);
							if (stamp < refer.getTime()) {
								return '明天';
							}
							refer.setDate(1);
							refer.setMonth(12);
							if (stamp < refer.getTime()) {
								return 'M月D日';
							}
							return 'Y年M月D日';

							// refer.setDate(1);
							// refer.setMonth(0);
							// refer.setYear(refer.getYear() + 1);
							// if (stamp >= refer.getTime()) {
							// 	return 'Y年M月D日';
							// }
							// return 'M月D日';
						}
						// 昨天
						refer.setDate(refer.getDate() - 1);
						if (stamp >= refer.getTime()) {
							return '昨天';
						}
						// 今年
						refer.setDate(1);
						refer.setMonth(0);
						if (stamp >= refer.getTime()) {
							return 'M月D日';
						}
						// 更早
						return 'Y年M月D日';
					});
				}
				return f.replace(/YYYY/, dt.getFullYear())
					.replace(/MM/, fNumber(dt.getMonth() + 1, '00'))
					.replace(/DD/, fNumber(dt.getDate(), '00'))
					.replace(/hh/, fNumber(dt.getHours(), '00'))
					.replace(/mm/, fNumber(dt.getMinutes(), '00'))
					.replace(/ss/, fNumber(dt.getSeconds(), '00'))
					.replace(/Y/, dt.getFullYear())
					.replace(/M/, dt.getMonth() + 1)
					.replace(/D/, dt.getDate())
					.replace(/h/, dt.getHours())
					.replace(/m/, dt.getMinutes())
					.replace(/s/, dt.getSeconds());
			} else {
				// 如果无法转化为时间对象，原样返回
				console.warn('不是可用的时间对象：' + data);
				return data;
			}
		}
		/**
		 * 将字符串中的连接转化为html的a标签
		 * 不处理本来在a标签中的html字符串
		 * 
		 * @param  {String} str 待处理的字符串
		 * @param {String} f 链接的格式 默认 <a href="$" target="_blank">$</a>
		 * @return {String} 处理后得到的字符串
		 */
		function fLink(str, f) {
			(!f || f === 'def') && (f = '<a href="$" target="_blank">$</a>');
			if (!/<a[^>]*>[\w\W]*?<\/a>/i.test(str)) {
				// 不含有a标签的字符串
				return str.replace(/(^|[^'":]{1})(((ht|f)tps?:)?\/\/[\w\d@:%_\-\+.~#?&//=]+)/ig,
					('$1' + f.replace(/\$/g, '\$2')));
			} else {
				// 含有a标签的字符串
				return str.replace(/(.+?)(?=<a[^>]*>[\w\W]*?<\/a>)/g, function(str, l) {
					if (l) {
						// console.log(l);
						return fLink(l, f);
					} else {
						return '';
					}
				});
			}
		}
		/**
		 * 格式化
		 */
		function format(type, data, f) {
			if (f) {
				switch (type) {
					case 'number':
						return fNumber(data, f);
					case 'time':
						return fTime(data, f);
					case 'string':
						return fString(data, f);
					case 'link':
						return fLink(data, f);
				}
			}
			return data;
		}
	}());
	// ## var/_obj ##
	var _obj = (function() {
		var obj = {};
		obj.isPlainObject = isPlainObject;
		obj.isEmptyObject = isEmptyObject;
		obj.setProp = setProp;
		obj.radioKeys = radioKeys;
		obj.keys = Object.keys || keys; // 原生兼容 IE9+
		obj.altKey = altKey;
		obj.deep = deep; // 通过 'xx.yy.zz' 深入提取子对象
		obj.flat = flat;
		return obj;
		/**
		 * 判断是否是普通的对象
		 * 
		 * @param  {*}  obj
		 * @return {Boolean}
		 */
		function isPlainObject(obj) {
			// 排除非对象、DOM对象、window对象
			if (type(obj) !== 'object' || obj.nodeType || obj.window === obj) {
				return false;
			}
			// 排除Function对象
			if (obj.constructor && !obj.constructor.prototype.hasOwnProperty('isPrototypeOf')) {
				return false;
			}
			// 剩下的为普通的对象
			return true;
		}
		function isEmptyObject(obj) {
			if (!obj) {
				return true;
			}
			if (!isPlainObject(obj)) {
				return false;
			}
			for (var key in obj) {
				return false;
			}
			return true;
		}
		/**
		 * 从对象中提取指定一组key中第一个存在的值
		 * @param  {Object} obj
		 * @param  {String|Array} keys 如：'aa bb cc dd.ee.ff'
		 * @return {*}
		 */
		function radioKeys(obj, keys) {
			if (typeof keys === 'string') {
				keys = keys.replace(/^\s+|\s+$/, '').split(/\s+/);
			}
			var i, l, val;
			for (i = 0, l = keys.length; i < l; i++) {
				if (val = deep(obj, keys[i])) {
					return val;
				}
			}
		}
		/**
		 * 为对象配置属性
		 * 
		 * @param  {Number} mask 1-enumerable 2-configurable 4-writable 8-getter/setter
		 * @param  {Object} obj  被配置的对象
		 * @param  {String} key  obj的新属性名
		 * @param  {Function||*} get  get操作回调函数 或 属性的值
		 * @param  {Function} set  set操作的回调函数
		 * @return {Object}   返回配置后的对象
		 */
		function setProp(mask, obj, key, getter, setter) {
			var desc = {};
			if (mask & 8) {
				getter && (desc.get = getter);
				setter && (desc.set = setter);
			} else {
				arguments.length > 3 && (desc.value = getter);
				desc.writable = Boolean(mask & 4);
			}
			desc.enumerable = Boolean(mask & 1);
			desc.configurable = Boolean(mask & 2);
			Object.defineProperty(obj, key, desc);
			return obj;
		}
		function keys(obj) {
			var keyArr = [], key,
				has = Object.prototype.hasOwnProperty;
			for (key in obj) {
				if (obj.hasOwnProperty(key)) {
					has.call(obj, key) && keyArr.push(key);
				}
			}
			return keyArr;
		}
		/**
		 * 对象内键名替换
		 * @param  {Object} obj     待处理对象
		 * @param  {[type]} pairs   [description]
		 * @param  {[type]} reverse [description]
		 * @return {[type]}         [description]
		 */
		function altKey(obj, pairs, reverse) {
			var key, newkey;
			for (key in pairs) {
				if (pairs.hasOwnProperty(key)) {
					// 新旧key的调换
					if (reverse && pairs[key]) {
						newkey = key;
						key = pairs[newkey];
					} else {
						newkey = pairs[key];
					}
					// 新旧key相同时，不做操作
					if (key && key != newkey && (key in obj)) {
						// 如果旧key存在，则将其值引至新key
						newkey && (obj[newkey] = obj[key]);
						// 删除旧key
						delete obj[key];
					}
				}
			}
			return obj;
		}
		// 深入提取子对象 key 'xx.yy.zz'
		function deep(obj, key) {
			switch (type(key)) {
				case 'string':
					key = key.split('.');
					break;
				case 'array':
					break;
				default:
					console.warn('不支持的Key：' + key);
					return null;
			}
			for (var i = 0; i < key.length; i++) {
				if (obj) {
					obj = obj[key[i]];
				} else {
					return null;
				}
			}
			return obj;
		}
		// 将多级对象按路径转化为单级对象
		function flat(obj, ret, path) {
			ret || (ret = {});
			for (var key in obj) {
				if (obj.hasOwnProperty(key)) {
					if (isPlainObject(obj[key])) {
						flat(obj[key], ret, path + key + '.');
					} else {
						ret[path + key] = obj[key];
					}
				}
			}
			return ret;
		}
	}());
	// ## var/traverse ##
	var traverse = (function() {
		var queue = [], running;
		trav.preTreat = preTreat;
		return trav;
		/**
		 * JSON树的遍历
		 * 	每个节点必须是一个JSON对象
		 * 需求:
		 * 	1 先序-先根后子: mode = 0
		 * 	2 后序-先子后根: mode = 'len' 除了 undefined\null\数字 其他任何输入都可以
		 * 	3 中序-先子后根再子: mode = (0,length)
		 * 	4 广度-所有根所有子: mode = null
		 * 方向:
		 * 	1 从首到尾 dir = false
		 * 	2 从尾到首 dir = true
		 * 参数:
		 * 	nd 当前被处理的节点或即将被处理的节点的数组, 对子组为hash表的情况需要dispatch支持
		 * 	handler 每一个节点的处理方式, 接受一个JSON对象nd为参数
		 * 	dispatch 可选的分发方式定义 字符串或函数(nd, [trav])
		 * 	mode 可选递归模式
		 * 	dir 可选遍历方向
		 * 	runner 内部使用
		 * 接口:
		 * 	traverse.preTreat(obj) → arr
		 */
		// 深度优先遍历
		function trav(nd, handler, dispatch, mode, dir, runner, middle) {
			if (!nd) { return ; }
			if (mode === null) {
				return travWide(nd, handler, dispatch, dir, runner, middle);
			}
			var i, flag;
			typeof mode === typeof undefined && (mode = 0);
			if (Object.prototype.toString.call(nd) === '[object Array]') {
				if (!dir) { // 默认从首到尾
					for (i = 0; i < nd.length; i++) {
						if (Object.prototype.toString.call(mode) === '[object Number]' && !flag && i >= mode && runner) {
							flag = true;
							if (runner()) {
								break;
							}
						}
						trav(nd[i], handler, dispatch, mode, dir, void 0, middle);
					}
				} else { // true时从尾到首
					for (i = nd.length - 1; i >= 0; i--) {
						if (Object.prototype.toString.call(mode) === '[object Number]' && !flag && i <= nd.length - mode - 1 && runner) {
							flag = true;
							if (runner()) {
								break;
							}
						}
						trav(nd[i], handler, dispatch, mode, dir, void 0, middle);
					}
				}
			} else {
				var mid = extend({}, middle),
					run = function() {
						if (mode !== 'len') {
							// 如果返回true, 则中断遍历
							return handler(nd, mid);
						} else {
							var flag = handler(nd, mid);
							extend(middle, mid);
							return flag;
						}
					};
				dispatch || (dispatch = 'list');
				if (typeof dispatch === 'string') {
					// 支持通过属性名查找下一级目录,以同步递归
					trav(preTreat(nd[dispatch]) || [], handler, dispatch, mode, dir, run, mid);
				} else if (Object.prototype.toString.call(dispatch) === '[object Function]') {
					// 支持通过回调函数查找下一级, 以支持异步递归
					var arr = dispatch(nd, function(arr) {
						trav(preTreat(arr) || [], handler, dispatch, mode, dir, run, mid);
					});
					// 支持通过返回下一级数组向下同步递归
					// dispatch没有回调函数,就必须返回一个数据,可以是空数组或可转化为数组的对象
					// 否则本节点将不能处理
					if (arr) {
						trav(preTreat(arr), handler, dispatch, mode, dir, run, mid);
					}
				}
			}
			// 如果没有执行runner, 则在最后执行
			!flag && runner && runner();
		}
		// 广度优先遍历
		function travWide(nd, handler, dispatch, dir, runner) {
			if (Object.prototype.toString.call(nd) === '[object Array]') {
				queue = queue.concat(dir ? nd.slice(0).reverse() : nd);
				if (!running) {
					running = true;
					while(queue.length) {
						if (travWide(queue.shift(), handler, dispatch, dir, runner)) {
							queue = [];
							break;
						}
					}
					if (queue.length === 0) {
						running = void 0;
					}
				}
			} else {
				var res = handler(nd);
				dispatch || (dispatch = 'list');
				if (typeof dispatch === 'string') {
					// 支持通过属性名查找下一级目录,以同步递归
					travWide(preTreat(nd[dispatch]) || [], handler, dispatch, dir);
				} else if (Object.prototype.toString.call(dispatch) === '[object Function]') {
					// 支持通过回调函数查找下一级, 以支持异步递归
					var arr = dispatch(nd, function(arr) {
						travWide(preTreat(arr) || [], handler, dispatch, dir);
					});
					// 支持通过返回下一级数组向下同步递归
					// dispatch没有回调函数,就必须返回一个数据,可以是空数组或可转化为数组的对象
					// 否则本节点将不能处理
					if (arr) {
						travWide(preTreat(arr), handler, dispatch, dir);
					}
				}
				return res;
			}
		}
		// hash表转化为数组, key以hash_key为键填入对象
		function preTreat(arr) {
			if (Object.prototype.toString.call(arr) === '[object Array]') {
				return arr;
			}
			if (Object.prototype.toString.call(arr) === '[object Object]') {
				if (arr.window !== arr && (!arr.constructor ||
					arr.constructor.prototype.hasOwnProperty('isPrototypeOf'))) {
					var newarr = [];
					for (var key in arr) {
						if (arr.hasOwnProperty(key)) {
							newarr.push(extend(arr[key], {
								hash_key: key
							}));
						}
					}
					return newarr;
				}
			}
		}
	})();
	// ## var/dom ##
	var dom = (function() {
		var ret = {
			query: query,
			html: html,
			text: text,
			val: val,
			src: src,
			attr: attr,
			addClass: addClass,
			rmClass: rmClass,
			toggleClass: toggleClass,
			tabClass: tabClass,
			radioClass: radioClass,
			parent: parent,
			previousSibling: previousSibling,
			nextSibling: nextSibling,
			firstChild: firstChild,
			lastChild: lastChild,
			children: children,
			child: child,
			before: before,
			after: after,
			append: append,
			prepend: prepend,
			insertBefore: before,
			insertAfter: after,
			appendChild: append,
			prependChild: prepend,
			css: css,
			on: on,
			off: off,
			emit: emit,
			proxy: proxy,
			clickback: clickback,
			extract: extract,
			frag: frag
		};
		var evs = (
			'click dblclick mousedown mousemove mouseup mouseleave focus blur wheel keyup keydown'
		).split(/\s+/);
		while (evs.length) {
			set(evs.shift());
		}
		var clickBackFuncs = [];
		document.onclick = cbClicked;
		return ret;
		function set( ev ) {
			if (ev) {
				ret[ev] = function(dom, cb) {
					on(dom, ev, cb);
				};
			}
		}
		function query(selector, context, results) {
			results || (results = []);
			context || (context = document);
			if (context.querySelectorAll) {
				_arr.merge(results, context.querySelectorAll(selector));
			} else if (context.nodeType === 1 ||
				context.nodeType === 9 || context.nodeType === 11) {
				selector = selector.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
				// 仅支持三种：#id .classname tagname
				if (/^#[\w\d-_]+/.test(selector)) {
					var elem = document.getElementById(selector.substr(1));
					elem && _arr.merge(results, [elem]);
				} else if (/^\.[\w\d-_]+/.test(selector)) {
					selector = new RegExp('\\b' + selector.substr(1) + '\\b');
					traverse(context, function(node) {
						node.nodeType === 1 && selector.test(node.className) && results.push(node);
					});
				} else if (/^\w[\w\d]{0,9}/.test(selector)) {
					return context.getElementsByTagName(selector);
				}
			}
			return results;
		}
		/**
		 * 
		 */
		function html(dom, html) {
			return (typeof html === typeof undefined) ? dom.innerHTML : (dom.innerHTML = html);
		}
		function text(dom, text) {
			return (typeof text === typeof undefined) ? dom.innerText : (dom.innerText = text);
		}
		function val(dom, val) {
			return (typeof val === typeof undefined) ? dom.value : (dom.value = val);
		}
		function src(dom, src) {
			return (typeof src === typeof undefined) ? dom.src : (dom.src = src);
		}
		function attr(dom, key, val) {
			return (typeof val === typeof undefined) ? dom.getAttribute(key) : dom.setAttribute(key, val);
		}
		/**
		 * $.addClass(dom, className) 为dom对象添加类名
		 * @param {DOM} dom 被添加类名的dom
		 * @param {String} className 新加入的类名(可以是多个)
		 * @return {String} 添加后dom所有的类名
		 */
		function addClass(dom, className) {
			if (dom && dom.nodeType === 1) {
				var classNames = _arr.isArray(className) ? className : className.split(' ');
				// 添加新类名，并避免重复
				dom.className = dom.className
					.replace((new RegExp('\\b' + classNames.join('\\b|\\b') + '\\b', 'g')), '') +
					' ' + classNames.join(' ');
				// 清理多余的空格
				return dom.className = dom.className
					.replace(/(\s+)/g, ' ')
					.replace(/(^\s+)|(\s+)$/g, '');
			}
		}
		/**
		 * $.rmClass(dom, className) 移除指定的类名
		 * @param  {DOM} dom       被处理的DOM对象
		 * @param  {String|Array} className 计划移除的类名
		 * @return {String}           DOM对象剩余的所有类名
		 */
		function rmClass(dom, className) {
			if (dom && dom.nodeType === 1) {
				var classNames = _arr.isArray(className) ? className : className.split(' ');
				for (var i = 0; i < classNames.length; i++){
					dom.className = dom.className.replace((new RegExp('(\\s|^)' + classNames[i] + '(\\s|$)', 'g')), ' ');
				}
				return dom.className = dom.className
					// .replace((new RegExp('\\b' + classNames.join('\\b|\\b') + '\\b', 'g')), '')
					// .replace((new RegExp('((\\s|^)' + classNames.join('(\\s|$))|((^|\\s)') + '(\\s|$))', 'g')), ' ')
					.replace(/(\s+)/g, ' ')
					.replace(/(^\s+)|(\s+)$/g, '');
			}
		}
		/**
		 * $.toggleClass(dom, className, className1)
		 * @param  {DOM} dom        被处理的dom对象
		 * @param  {String} className  类名，有变无或无变有
		 * @param  {String} className1 可选，有时在两个类名之间切换
		 * @return {boolean}            处理成className则返回1，className1或清除则显示0
		 */
		function toggleClass(dom, className, className1) {
			if (dom && dom.nodeType === 1 && className) {
				var cn = dom.className, f,
					re = new RegExp('\\b' + className + '\\b', 'g'),
					re1 = className1 ? new RegExp('\\b' + className1 + '\\b', 'g') : null;
				// 只有className是切换className的有无
				// 有className1时，切换两个className
				if (re.test(cn)) {
					cn = cn.replace(re, '') + ' ' + (className1 || '');
					f = 0;
				} else if (re1 && re1.test(cn)) {
					cn = cn.replace(re1, '') + ' ' + className;
					f = 1;
				} else {
					cn += ' ' + className;
					f = 1;
				}
				cn = cn
					.replace(/(\s+)/g, ' ')
					.replace(/(^\s+)|(\s+)$/g, '');
				dom.className = cn;
				return f; // 0：className1或空，1：className
			}
		}
		/**
		 * $.tabClass(dom, className, flag) 在dom和其兄弟dom间切换
		 * @param  {DOM} dom       指定的DOM对象
		 * @param  {String} className 类名从dom删除并为其所有兄弟对象添加
		 * @param  {Boolean} flag      标记，true时添加到dom并从所有兄弟对象移除
		 * @return {String}           返回dom当前所有类名
		 */
		function tabClass(dom, className, reverse) {
			if (dom && dom.nodeType === 1 && className) {
				// 清理
				var child = dom.parentElement.firstChild;
				while(child) {
					if (child.nodeType === 1) {
						(reverse ? addClass : rmClass)(child, className);
					}
					child = child.nextElementSibling || child.nextSibling;
				}
				// 设置
				~reverse && (reverse ? rmClass : addClass)(dom, className);
				// 返回
				return dom.className;
			}
		}
		/**
		 * 保留className，移除classNames中其他的className
		 * @param  {DOM} dom
		 * @param  {String} className
		 * @param  {Array|String} classNames 支持空格分割的多个类名
		 * @param {Boolean} reverse true从classNames中排除className
		 * @return {String}
		 */
		function radioClass(dom, className, classNames, reverse) {
			if (dom && dom.nodeType === 1 && className) {
				(reverse ? addClass : rmClass)(dom, classNames);
				(reverse ? rmClass : addClass)(dom, className);
				// 返回
				return dom.className;
			}
		}
		function parent(dom) {
			return dom.parentElement;
		}
		function previousSibling(dom) {
			var sibling = dom.previousSibling;
			while (sibling && sibling.nodeType !== 1) {
				sibling = sibling.previousSibling;
			}
			return sibling;
		}
		function nextSibling(dom) {
			var sibling = dom.nextSibling;
			while (sibling && sibling.nodeType !== 1) {
				sibling = sibling.nextSibling;
			}
			return sibling;
		}
		function firstChild(dom) {
			var child = dom.firstChild;
			while (child && child.nodeType !== 1) {
				child = child.nextSibling;
			}
			return child;
		}
		function lastChild(dom) {
			var child = dom.lastChild;
			while (child && child.nodeType !== 1) {
				child = child.previousSibling;
			}
			return child;
		}
		function children(dom) {
			var child = dom.firstChild,
				arr = [];
			while (child) {
				if (child.nodeType === 1) {
					arr.push(child);
				}
				child = child.nextSibling;
			}
			return arr;
		}
		function child(dom, cb, reverse) {
			var childNode = (reverse ? dom.lastChild : dom.firstChild), i = 0;
			while (childNode) {
				if (childNode.nodeType === 1) {
					cb(i, childNode);
					i++;
				}
				childNode = (reverse ? childNode.previousSibling : childNode.nextSibling);
			}
			return dom;
		}
		function before(node, sibling) {
			sibling && (sibling.nodeType === 1 || sibling.nodeType === 11) &&
				sibling.parentNode.insertBefore(node, sibling);
		}
		function after(node, sibling) {
			sibling && (sibling.nodeType === 1 || sibling.nodeType === 11) &&
				(sibling.nextSibling ?
					before(node, sibling.nextSibling) :
					sibling.parentNode.appendChild(node));
		}
		function prepend(parent, child) {
			if (child && (child.nodeType === 1 || child.nodeType === 11)) {
				var sibling = firstChild(parent);
				sibling ? parent.insertBefore(child, sibling) : parent.appendChild(child);
			}
		}
		function append(parent, child) {
			child && (child.nodeType === 1 || child.nodeType === 11) && parent.appendChild(child);
		}
		/**
		 * 修改、删除、读取DOM的样式或样式集
		 * @param  {DOM} dom   被处理的DOM对象
		 * @param  {String || Object || Array} name  样式名或样式名集
		 * @param  {String} value 当name为String时的值
		 * @param  {Boolean} rm    是否删除指定的样式
		 * @return {String || Object || Array}  对应样式的值或值集
		 */
		function css(dom, name, value, rm) {
			var dict = {}, one, names, key, Name;
			if (_obj.isPlainObject(name)) {
				dict = name;
			} else if (_arr.isArray(name)) {
				dict = {};
				while (name.length) {
					dict[name.shift()] = void 0;
				}
			} else {
				one = name;
				dict[one] = value;
			}
			for (key in dict) {
				if (dict.hasOwnProperty(key)) {
					value = dict[key];
					// 调整样式值
					if (!rm && value) {
						switch (name) {
							case 'backgroundImage':
								/^url(.+)$/i.test(value) || (value = 'url(' + value + ')');
								break;
						}
					}
					// 调整样式名
					name = _str.camelCase(key);
					names = [ name ];
					if (!(name in dom.style)) {
						if (name === 'float') {
							names.push('cssFloat');
						} else {
							Name = _str.camelCase('_' + name);
							if (('webkit' + Name) in dom.style) {
								names.push('webkit' + Name);
							} else if (('moz' + Name) in dom.style) {
								names.push('moz' + Name);
							} else if (('ms' + Name) in dom.style) {
								names.push('ms' + Name);
							} else if (('o' + Name) in dom.style) {
								names.push('o' + Name);
							} else {
								throw new Error('无法处理的样式名：' + name);
							}
						}
					}
					// 操作
					var i;
					if (rm) { // 删除
						for (i = 0; i < names.length; i++) {
							value = dom.style[names[i]];
							dom.style[names[i]] = '';
						}
						dict[key] = value;
					} else if (type(value) !== 'undefined') { // 修改
						for (i = 0; i < names.length; i++) {
							dom.style[names[i]] = value;
						}
						dict[key] = value;
					} else { // 读取
						for (i = 0; i < names.length; i++) {
							value = dom.style[names[i]];
							if (value) {
								dict[key] = value;
								break;
							}
						}
					}
				}
			}
			return one ? dict[one] : dict;
		}
		function on(dom, evs, callback) {
			if (!_arr.isArray(evs)) {
				evs = [evs];
			}
			var attach = !!dom.attachEvent;
			while (evs.length) {
				var ev = evs.shift();
				switch (ev) {
					case 'visibilitychange':
						if (!attach) {
							document.addEventListener('visibilitychange', callback);
							document.addEventListener('mozvisibilitychange', callback);
							document.addEventListener('msvisibilitychange', callback);
							document.addEventListener('webkitvisibilitychange', callback);
						}
						break;
					default:
						attach ? dom.attachEvent('on' + ev, callback) :
							dom.addEventListener(ev, callback);
				}
			}
		}
		function off(dom, ev, callback) {
			var detach = !!dom.detachEvent;
			switch (ev) {
				case 'visibilitychange':
					dom.removeEventListener('visibilitychange', callback);
					dom.removeEventListener('webkitvisibilitychange', callback);
					dom.removeEventListener('mozvisibilitychange', callback);
					dom.removeEventListener('msvisibilitychange', callback);
					break;
				default:
					detach ? dom.detachEvent('on' + ev, callback) :
						dom.removeEventListener(ev, callback);
			}
		}
		function emit(dom, ev) {
			ev = new Event(ev, {
				view: window,
				bubble: true,
				cancelable: true
			});
			// false表示至少一个回调函数执行了preventDefault()
			return dom.dispatchEvent(ev);
		}
		/**
		 * 绑定事件代理
		 * 
		 * @param  {DOM} dom 最外层的DOM对象
		 * @param  {String} ev 事件名
		 * @param  {Function} cb 回调函数 返回 true 退出循环
		 * @param  {Function|Object} req 执行条件（必须左键单击） 返回 -1 不执行
		 */
		function proxy(dom, ev, cb, req) {
			if (type(ev) === 'function') {
				req = cb;
				cb = ev;
				ev = 'click';
			}
			on(dom, ev, function(e) {
				// 执行条件 不满足拒绝执行
				if (type(req) === 'function') {
					if (!~req(e)) { return ; }
				} else if (_obj.isPlainObject(req)) {
					for (var key in req) {
						if (req.hasOwnProperty(key)) {
							if (e[key] !== req[key]) {
								return ;
							}
						}
					}
				}
				var target = e.target || e.srcElement;
				while(target && target !== this) {
					// 执行操作 返回 true 退出循环
					if (cb(target, e)) { break ; }
					target = target.parentElement;
				}
			});
		}
		/**
		 * clickBack 带有还原的click操作
		 * @param  {DOM} dom 被操作的dom
		 * @param  {Func} cb 操作方法 返回 true 时 注册还原操作
		 * @param  {Func} restore 还原操作 注册到clickBackFuncs内 返回 true 时 解除注册
		 * cb 和 restore 共用 this、e
		 * 
		 * cbClicked 还原操作 监听document的click事件
		 * 每次触发 依次执行所有已经注册的还原操作
		 */
		function clickback(dom, cb, restore) {
			on(dom, 'click', function(e) {
				if (cb.call(this, e)) {
					// 注册 还原操作
					e.stopPropagation();
					var that = this;
					clickBackFuncs.push(function() {
						return restore.call(that, e);
					});
				}
			});
		}
		function cbClicked(e) {
			var i = clickBackFuncs.length;
			while (i--) {
				// 如果此处注册的回调函数返回 1,
				// 表示成功执行，可以清理
				if (clickBackFuncs[i](e)) {
					clickBackFuncs.splice(i, 1);
				}
			}
		}
		/**
		 * 从dom及起子树中抽取带有特定属性的一系列dom
		 * @param  {DOM} dom   被检索的DOM树的根
		 * @param  {Object|Array|String} attrs 属性集 数组默认class属性
		 * @return {Object}  以各个属性为键，以对应dom组成的数组为值
		 */
		function extract(dom, attrs) {
			if (typeof attrs === 'string') {
				attrs = attrs.split(/\s+/);
			}
			var ret = {}, attr, swap = {};
			if (_arr.isArray(attrs)) {
				for (var i = 0; i < attrs.length; i++) {
					attr = attrs[i];
					ret[attr] = [];
					if (/^#/.test(attr)) {
						swap[attr] = {
							re: new RegExp('(^|\\s)' + attr.substr(1) + '(\\s|$)'),
							attr: 'id'
						};
					} else if (/^\./.test(attr)) {
						swap[attr] = {
							re: new RegExp('(^|\\s)' + attr.substr(1) + '(\\s|$)')
						};
					} else {
						swap[attr] = {
							re: new RegExp('(^|\\s)' + attr + '(\\s|$)')
						};
					}
				}
			} else if (_obj.isPlainObject(attrs)) {
				for (var key in attrs) {
					if (attrs.hasOwnProperty(key)) {
						ret[key] = [];
						swap[key] = {
							re: new RegExp('(^|\\s)' + key + '(\\s|$)'),
							attr: attrs[key]
						};
					}
				}
			}
			// 遍历dom树
			traverse(dom, function(node) {
				for (var key in swap) {
					if (swap.hasOwnProperty(key)) {
						var re = swap[key],
							attr = re.attr;
						re = re.re;
						attr = attr ? node.getAttribute(attr) : node.className;
						re.test(attr) && ret[key].push(node);
					}
				}
			}, function(node, cb) {
				cb(children(node));
			});
			// 返回
			return ret;
		}
		// 准备丢弃的接口
		function frag(text) {
			var div = document.createElement('div'),
				fragNode = document.createDocumentFragment(),
				childArr;
			div.innerHTML = text;
			childArr = children(div);
			for (var i = 0, len = childArr.length; i < len; i++) {
				fragNode.appendChild(childArr[i]);
			}
			return fragNode;
		}
	})();
	// ## core ##
	// 核心接口
	var $ = function(selector, context) {
		return new $.fn.init(selector, context);
	};
	$.fn = $.prototype = {
		jq: '1.0.0',
		constructor: $,
		selector: '',
		length: 0,
		splice: Array.prototype.splice
	};
	/**
	 * 实例化 构造dom数组对象，并具备fn的功能
	 */
	$.fn.init = function(selector, context, root) {
		// 处理 $(''), $(null), $(undefined), $(false)
		if (!selector) { return this; }
		// ?
		root = root || $;
		// 分别处理 string DOM function
		if (typeof selector === 'string') {
			selector = selector.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			if (selector[0] === '<' &&
				selector[selector.length - 1] === '>' &&
				selector.length >= 3) {
				return _arr.merge(this, dom.children(dom.frag(selector)));
			} else {
				return _arr.merge(this, dom.query(selector, context));
			}
		} else if (selector.nodeType) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		} else if (Object.prototype.toString.call(selector) === '[object Function]') {
			return $.ready !== undefined ? $.ready(selector) : selector($);
		}
		this.selector = selector;
		return this;
	};
	$.fn.init.prototype = $.fn;
	/**
	 * 核心操作
	 */
	$.extend = $.fn.extend = extend;
	$.extend({
		ui: {},
		mdl: {},
		ready: (function() {
			var list = [];
			return function(fn) {
				if (document.readyState === 'complete' && list.length <= 0) {
					fn();
				} else {
					if (list.length <= 0) {
						if (document.addEventListener) {
							document.addEventListener('DOMContentLoaded', completed, false);
							window.addEventListener('load', completed, false);
						} else {
							document.attachEvent('onreadystatechange', completed);
							window.attachEvent('onload', completed);
						}
					}
					list.push(fn);
				}
			};
			function completed() {
				if (document.addEventListener) {
					document.removeEventListener('DOMContentLoaded', completed, false);
					window.removeEventListener('load', completed, false);
				} else {
					document.detachEvent('onreadystatechange', completed);
					window.detachEvent('onload', completed);
				}
				var fn = list.shift();
				while (fn) {
					fn();
					fn = list.shift();
				}
			}
		})()
	});
	// ## var/emitter ## 事件触发与监听功能
	var emitter = (function() {
		return function(obj) {
			obj.on =
			obj.adEventListener = on;
			obj.once = once;
			obj.off =
			obj.removeListener =
			obj.removeAllListeners =
			obj.removeEventListener = off;
			obj.emit = emit;
			obj.listeners = listeners;
			obj.hasListeners = hasListeners;
		};
		function on(event, cb) {
			this._callbacks || (this._callbacks = {});
			(this._callbacks['$' + event] || (this._callbacks['$' + event] = [])).push(cb);
			return this;
		}
		function off(event, cb) {
			this._callbacks || (this._callbacks = {});
			// 删除所有
			if (arguments.length === 0) {
				this._callbacks = {};
				return this;
			}
			var callbacks = this._callbacks['$' + event];
			// 删除指定事件名的所有回调函数
			if (!callbacks) {
				return this;
			} else if (arguments.length === 1) {
				delete this._callbacks['$' + event];
				return this;
			}
			// 删除指定事件名的指定回调函数
			var hdl;
			for (var i = 0, len = callbacks.length; i < len; i++) {
				hdl = callbacks[i];
				if (cb === hdl || cb === hdl.cb) {
					callbacks.splice(i, 1);
					return this;
				}
			}
		}
		function once(event, cb) {
			function on() {
				this.off(event, on);
				cb.apply(this, arguments);
			}
			on.cb = cb;
			this.on(event, on);
			return this;
		}
		function emit(event) {
			this._callbacks || (this._callbacks = {});
			var args = [], i = arguments.length,
				callbacks = this._callbacks['$' + event];
			if (callbacks) {
				while (i-- > 1) {
					args.unshift(arguments[i]);
				}
				for (var j = 0, len = callbacks.length; j < len; j++) {
					callbacks[j].apply(this, args);
				}
			}
			return this;
		}
		function listeners(event) {
			this._callbacks || (this._callbacks = {});
			return this._callbacks['$' + event] || [];
		}
		function hasListeners(event) {
			return !! this.listeners[event].length;
		}
	})();
	// ## var/nextTick ##
	var nextTick = (function() {
		var head = { // 单向链表
				task: void 0,
				next: null
			},
			tail = head,
			flushing = false,
			requestTick = void 0,
			isNodeJS = false,
			nextTick;
		function flush() {
			while (head.next) {
				head = head.next;
				var task = head.task;
				head.task = void 0;
				var domain = head.domain;
				if (domain) {
					head.domain = void 0;
					domain.enter();
				}
				try {
					task(); // 执行task
				} catch (e) {
					if (isNodeJS) {
						// 在node中未捕获的异常会被视为致命错误，重新同步抛出以中断flushing
						// Ensure continuation if the uncaught exception is suppressed
						// listening 'uncaughtException' events (as domains does).
						// Continue in next event to avoid tick recursion.
						if (domain) {
							domain.exit();
						}
						setTimeout(flush, 0);
						if (domain) {
							domain.enter();
						}
						throw e;
					} else {
						// 浏览器中，没有捕获的异常并不致命，重新抛出以避免速度变慢
						setTimeout(function() {
							throw e;
						}, 0);
					}
				}
				if (domain) {
					domain.exit();
				}
			}
			flushing = false;
		}
		nextTick = function(task) {
			tail = tail.next = {
				task: task,
				domain: isNodeJS && process.domain,
				next: null
			};
			if (!flushing) {
				flushing = true;
				requestTick();
			}
		};
		if (typeof process !== 'undefined' && process.nextTick) {
			// Node.js 0.9- 注意一些伪Node环境，如Mocha test runner，提供了不带nextTick的process
			isNodeJS = true;
			requestTick = function() {
				process.nextTick(flush);
			};
		} else if (typeof setImmediate === 'function') {
			// In IE10, Node.js 0.9+, 以及 https://github.com/NobleJS/setImmediate
			if (typeof window !== 'undefined') {
				requestTick = setImmediate.bind(window, flush);
			} else {
				requestTick = function() {
					setImmediate(flush);
				};
			}
		} else if (typeof MessageChannel !== 'undefined') {
			// 现代浏览器 及 http://www.nonblocking.io/2011/06/windownexttick.html
			var channel = new MessageChannel();
			// At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
			// working message ports the first time a page loads.
			channel.port1.onmessage = function() {
				requestTick = requestPortTick;
				channel.port1.onmessage = flush;
				flush();
			};
			var requestPortTick = function() {
				channel.port2.postMessage(0);
			};
			requestTick = function() {
				setTimeout(flush, 0);
				requestPortTick();
			};
		} else {
			// 旧浏览器
			requestTick = function() {
				setTimeout(flush, 0);
			};
		}
		return nextTick;
	})();
	// ## var/_iter ##
	var _iter = (function() {
		var iter = {};
		iter.each = each;
		iter.map = map;
		iter.equal = equal;
		return iter;
		/**
		 * $.each() 遍历数组或字典，并对每一项进行操作
		 * @param  {Object|Array}   obj      被遍历的数组或字典
		 * @param  {Function} callback 对每一项的处理函数
		 * @param  {Array}   args     可选，如果有则作为callback的参数，每一项作为callback的this
		 * @return {Object}            返回被处理的对象
		 */
		function each(obj, callback, args) {
			if (typeof obj === typeof undefined) { return obj; }
			// 声明变量
			var i = 0,
				length = obj.length,
				isArray = _arr.isArraylike(obj);
			if (args) {
				if (isArray) {
					for (; i < length; i++) {
						if (callback.apply(obj[i], args)) {break;}
					}
				} else {
					for (i in obj) {
						if (obj.hasOwnProperty(i)) {
							if (callback.apply(obj[i], args)) {break;}
						}
					}
				}
			} else {
				if (isArray) {
					for (; i < length; i++) {
						if (callback.call(obj, i, obj[i])) {break;}
					}
				} else {
					for (i in obj) {
						if (obj.hasOwnProperty(i)) {
							if (callback.call(obj, i, obj[i])) {break;}
						}
					}
				}
			}
			// 返回
			return obj;
		}
		/**
		 * 对数组的每一项执行操作得到结果组成一个新的数组
		 * @param  {Array}   arr  待操作数组
		 * @param  {Function} callback 操作函数
		 * @param {*} thisArg 用于指定callback内的this变量指向的对象
		 * @return {Array}   操作结果数组
		 */
		function map(arr, callback, thisArg) {
			if (Array.prototype.map) {
				return Array.prototype.map.call(arr, callback, thisArg);
			} else {
				var resArr = new Array(arr.length);
				each(arr, function(i, item) {
					resArr[i] = callback.call(thisArg, item, i, arr);
				});
				return resArr;
			}
		}
		/**
		 * bug: 仅比较了a中存在的元素
		 */
		function equal(a, b) {
			switch (type(a)) {
				case 'object':
				case 'array':
					if (a !== null) {
						var flag = true;
						each(a, function(i, item) {
							return !(flag = equal(item, b[i]));
						});
						return flag;
					}
					/* falls through */
				default: // string number undefined
					return a === b;
			}
		}
	}());
	// ## var/_date ##
	var _date = (function() {
		var ret = {
			now: Date.now || now,
			days: days,
			utc: utc
		};
		// var timeOrigin = (new Date('1970/1/1 0:00:00')).getTime();
		return ret;
		function now() {
			return (new Date()).getTime();
		}
		/**
		 * 获取当前或指定时间相对 UTC 1970/1/1 0:00:00的天数（0开始）
		 * 或从天数逆向出Date （Date本身是一个客观的状态 无所谓UTC和本地）
		 * 
		 * @param  {Number|String|Date} date 本地日期
		 * @param  {Boolean} reverse true时逆向运算
		 * @return {Number|Date}
		 *
		 * new Date() 得到的是本地时间 不是UTC时间
		 * getTime() 和 now() 得到的是相对于UTC 1970/1/1 0:00:00 的毫秒数
		 */
		function days(date, rev) {
			if (rev) {
				return new Date(date * 86400000);
			} else {
				typeof date === typeof undefined && (date = new Date());
				if (!(date instanceof Date)) {
					date = new Date(date.replace ? date.replace(/\-/g, '/') : date);
				}
				if (date && date.toJSON()) {
					return Math.floor((date.getTime()) / 86400000);
				}
			}
		}
		/**
		 * 将本地时间字符串转化为UTC日期 或 反向
		 * 
		 * @param  {String} str 可以转化为日期的字符串
		 * @param {Boolean} rev true时反向 表示将UTC时间转化为本地时间
		 * @return {Date}  日期对象
		 */
		function utc(str, rev) {
			if (!str) {
				return ;
			}
			var date;
			if (str instanceof Date) {
				date = str;
			} else {
				if (/^\d+$/.test(str)) {
					str = parseInt(str);
				} else if (typeof str === 'string') {
					str = str.replace(/-/g, '\/');
				}
				date = new Date(str);
			}
			if (!date.toJSON()) {
				console.warn('您输入的日期不可用');
				return ;
			}
			if (rev) { // UTC时间字符串 转 本地日期
				return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(),
					date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
			} else { // 本地日期字符串 转 UTC日期
				var newDate = new Date();
				newDate.setFullYear(date.getUTCFullYear());
				newDate.setMonth(date.getUTCMonth());
				newDate.setDate(date.getUTCDate());
				newDate.setHours(date.getUTCHours());
				newDate.setMinutes(date.getUTCMinutes());
				newDate.setSeconds(date.getUTCSeconds());
				newDate.setMilliseconds(date.getUTCMilliseconds());
				return newDate;
			}
		}
	}());
	// ## var/ua ##
	/**
	 * 改写自： jquery.ua.js
	 * http://festatic.aliapp.com/js/jquery.ua/
	 * 
	 * @author 云淡然
	 * @version 1.3
	 */
	var ua = (function() {
		var win = window,
			nav = win.navigator,
			navua = nav.userAgent,
			appVersion = nav.appVersion,
			doc = win.document,
			parseRule = _getRules(),
			ret = {};
		getStatic();
		return getDyna();
		function getStatic() {
			// IE
			var ieAX = win.ActiveXObject,
				ieMode = doc.documentMode,
				ieVer = _getIeVersion() || ieMode || 0;
			ret.isIe = !!ieVer;
			ret.isIe6 = ieAX && ieVer == 6 || ieMode == 6;
			ret.isIe7 = ieAX && ieVer == 7 || ieMode == 7;
			ret.isIe8 = ieAX && ieVer == 8 || ieMode == 8;
			ret.isIe9 = ieAX && ieVer == 9 || ieMode == 9;
			ret.isIe10 = ieMode === 10;
			ret.isIe11 = ieMode === 11;
			ret.ie = ieVer;
			// 遨游
			ret.isMaxthon = !!ieVer && /\bmaxthon\b/i.test(appVersion);
			// QQ
			ret.isQQ = !!ieVer && /\bqqbrowser\b/i.test(appVersion);
			// Edge
			ret.isEdge = !ieVer && /\bEdge\b/i.test(appVersion);
			// Firefox
			ret.isFirefox = win.scrollMaxX !== undefined;
			// Chrome
			var chromeType = _getChromiumType();
			ret.isChrome = chromeType === 'chrome';
			ret.is360ee = chromeType === '360ee';
			ret.is360se = chromeType === '360se';
			ret.isSougou = chromeType === 'sougou';
			ret.isLiebao = chromeType === 'liebao';
			// 
			return ret;
		}
		function _getIeVersion() {
			var v = 3,
				p = doc.createElement('p'),
				all = p.getElementsByTagName('i');
			while (p.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->', all[0]) {}
			return v > 4 ? v : 0;
		}
		/**
		 * 获取 Chromium 内核浏览器类型
		 * @link http://www.adtchrome.com/js/help.js
		 * @link https://ext.chrome.360.cn/webstore
		 * @link https://ext.se.360.cn
		 * @return {String}
		 *         360ee 360极速浏览器
		 *         360se 360安全浏览器
		 *         sougou 搜狗浏览器
		 *         liebao 猎豹浏览器
		 *         chrome 谷歌浏览器
		 *         ''    无法判断
		 * @version 1.0
		 * 2014年3月12日20:39:55
		 */
		function _getChromiumType() {
			if (ret.isIe || ret.isEdge || win.scrollMaxX !== undefined) { return ''; }
			var isOriginalChrome = _mime('type', 'application/vnd.chromium.remoting-viewer');
			// 原始 chrome
			if (isOriginalChrome) {
				return 'chrome';
			} else if (win.chrome) { // 谷歌、火狐、ie的某些版本也有 window.chrome 属性
				var _track = 'track' in doc.createElement('track'),
					_style = 'scoped' in doc.createElement('style'),
					_v8locale = 'v8Locale' in win,
					external = win.external;
				// 搜狗浏览器
				if (external && 'SEVersion' in external) { return 'sougou'; }
				// 猎豹浏览器
				if (external && 'LiebaoGetVersion' in external) { return 'liebao'; }
				// 360极速浏览器
				if (_track && !_style && !_v8locale && /Gecko\)\s+Chrome/.test(appVersion)) { return '360ee'; }
				// 360安全浏览器
				if (_track && _style && _v8locale) { return '360se'; }
				// 其他
				return 'other chrome';
			}
			return '';
		}
		// 测试mime
		function _mime(where, value, name, nameReg) {
			var mimeTypes = win.navigator.mimeTypes,
				i;
			for (i in mimeTypes) {
				if (mimeTypes[i][where] == value) {
					if (name !== undefined && nameReg.test(mimeTypes[i][name])) { return !0; }
					else if (name === undefined) { return !0; }
				}
			}
			return !1;
		}
		function getDyna(ua) {
			ua = (ua || navua).toLowerCase();
			ret.ua = ua;
			// 分析
			var objPlatform = _parse(parseRule.platforms, ua),
				objBrowser = _parse(parseRule.browsers, ua, !0),
				objEngine = _parse(parseRule.engines, ua);
			// 操作平台、外壳、内核
			objPlatform.os = win.navigator.platform.toLowerCase();
			ret.platform = objPlatform;
			ret.browser = objBrowser;
			ret.engine = objEngine;
			// UA内核
			ret.isWebkit = !!objEngine.isWebkit;
			ret.isGecko = !!objEngine.isGecko;
			ret.isTrident = !!objEngine.isTrident;
			// UA类型
			ret.isMobile = objPlatform.isMobile;
			ret.isTablet = objPlatform.isTablet;
			ret.isDesktop = objPlatform.isDesktop;
			ret.isWechat = objPlatform.isWechat;
			// 
			return ret;
		}
		/**
		 * 解析
		 * 参考：https://github.com/terkel/jquery-ua
		 * @param  {Array} 需要解析的数据
		 * @param  {String} 需要解析的ua字符串
		 * @param  {Boolean} 是否为解析浏览器数据
		 * @return {Object} 解析后的对象
		 * @version 1.0
		 * 2013年9月27日13:36:47
		 */
		function _parse(rule, ua, isBrowser) {
			var item = {},
				name,
				versionSearch,
				flags,
				versionNames,
				i,
				is,
				ic,
				j,
				js,
				jc;
			if (isBrowser && ret.ieVer) {
				return {
					name: 'ie',
					ie: !0,
					version: ret.ieVer,
					isIe: !0
				};
			}
			for (i = 0, is = rule.length; i < is; i++) {
				ic = rule[i];
				name = ic.name;
				versionSearch = ic.versionSearch;
				flags = ic.flags;
				versionNames = ic.versionNames;
				if (ua.indexOf(name) !== -1) {
					item.name = name.replace(/\s/g, '');
					if (ic.slugName) {
						item.name = ic.slugName;
					}
					item['is' + _upperCase1st(item.name)] = !0;
					item.version = ('' + (new RegExp(versionSearch + '(\\d+((\\.|_)\\d+)*)').exec(ua) || [, 0])[1]).replace(/_/g, '.');
					if (flags) {
						for (j = 0, js = flags.length; j < js; j++) {
							item['is' + _upperCase1st(flags[j])] = !0;
						}
					}
					if (versionNames) {
						for (j = 0, js = versionNames.length; j < js; j++) {
							jc = versionNames[j];
							var reg = new RegExp('^' + jc.number + '([^0-9]|$)');
							if (reg.test(item.version)) { //item.version.indexOf(jc.number) === 0) {
								item.fullname = item.name + ' ' + item.version + ' ' + jc.name;
								item['is' + _upperCase1st(item.fullname)] = !0;
								break;
							}
						}
					}
					if (rule === parseRule.platforms) {
						item.isMobile = /mobile|phone/.test(ua) || item.isBlackberry;
						item.isMobile = !!item.isMobile;
						item.isTablet = /tablet/.test(ua) || item.isIpad || (item.isAndroid && !/mobile/.test(ua));
						item.isTablet = !!item.isTablet;
						if (item.isTablet) { item.isMobile = !1; }
						item.isDesktop = !item.isMobile && !item.isTablet ? !0 : !1;
						if (item.ios) {
							item.fullname = 'ios' + parseInt(item.version, 10);
							item['is' + _upperCase1st(item.fullname)] = !0;
						}
						item.isWechat = /micromessenger|wechat/.test(ua);
					}
					break;
				}
			}
			if (!item.name) {
				item.isUnknown = !0;
				item.name = '';
				item.version = '';
			}
			return item;
		}
		// 大写第一个字母
		function _upperCase1st(string) {
			return string.replace(/^(\w)/, function(w) {
				return w.toUpperCase();
			});
		}
		// 解析规则
		function _getRules() {
			return {
				platforms: [
					// windows phone
					{
						name: 'windows phone',
						versionSearch: 'windows phone os ',
						versionNames: [ // windows phone must be tested before win
							{
								number: '7.5',
								name: 'mango'
							}
						]
					},
					// windows
					{
						name: 'win',
						slugName: 'windows',
						versionSearch: 'windows(?: nt)? ',
						versionNames: [
							{
								number: '6.4',
								name: 'windows 10'
							},
							{
								number: '6.3',
								name: 'windows 8.1'
							},
							{
								number: '6.2',
								name: 'windows 8'
							},
							{
								number: '6.1',
								name: 'windows 7'
							},
							{
								number: '6.0',
								name: 'windows vista'
							},
							{
								number: '5.2',
								name: 'windows xp'
							},
							{
								number: '5.1',
								name: 'windows xp'
							},
							{
								number: '5.0',
								name: 'windows 2000'
							}
						]
					},
					// ipad
					{
						name: 'ipad',
						versionSearch: 'cpu os ',
						flags: ['ios']
					},
					// ipad and ipod must be tested before iphone
					{
						name: 'ipod',
						versionSearch: 'iphone os ',
						flags: ['ios']
					},
					// iphone
					{
						name: 'iphone',
						versionSearch: 'iphone os ',
						flags: ['ios']
					},
					// iphone must be tested before mac
					{
						name: 'mac',
						versionSearch: 'os x ',
						versionNames: [
							{
								number: '10.12',
								name: 'Sierra'
							},
							{
								number: '10.11',
								name: 'El Capitan'
							},
							{
								number: '10.10',
								name: 'Yosemite'
							},
							{
								number: '10.9',
								name: 'Mavericks'
							},
							{
								number: '10.8',
								name: 'mountainlion'
							},
							{
								number: '10.7',
								name: 'lion'
							},
							{
								number: '10.6',
								name: 'snowleopard'
							},
							{
								number: '10.5',
								name: 'leopard'
							},
							{
								number: '10.4',
								name: 'tiger'
							},
							{
								number: '10.3',
								name: 'panther'
							},
							{
								number: '10.2',
								name: 'jaguar'
							},
							{
								number: '10.1',
								name: 'puma'
							},
							{
								number: '10.0',
								name: 'cheetah'
							}
						]
					},
					// android
					{
						name: 'android',
						versionSearch: 'android ',
						versionNames: [
							// android must be tested before linux
							{
								number: '5.1',
								name: 'lollipop'
							},
							{
								number: '5.0',
								name: 'lollipop'
							},
							{
								number: '4.4',
								name: 'kitkat'
							},
							{
								number: '4.3',
								name: 'jellybean'
							},
							{
								number: '4.2',
								name: 'jellybean'
							},
							{
								number: '4.1',
								name: 'jellybean'
							},
							{
								number: '4.0',
								name: 'icecream sandwich'
							},
							{
								number: '3.',
								name: 'honey comb'
							},
							{
								number: '2.3',
								name: 'ginger bread'
							},
							{
								number: '2.2',
								name: 'froyo'
							},
							{
								number: '2.',
								name: 'eclair'
							},
							{
								number: '1.6',
								name: 'donut'
							},
							{
								number: '1.5',
								name: 'cupcake'
							}
						]
					},
					// blackberry
					{
						name: 'blackberry',
						versionSearch: '(?:blackberry\\d{4}[a-z]?|version)/'
					},
					// blackberry
					{
						name: 'bb',
						slugName: 'blackberry',
						versionSearch: '(?:version)/'
					},
					// blackberry
					{
						name: 'playbook',
						slugName: 'blackberry',
						versionSearch: '(?:version)/'
					},
					// linux
					{
						name: 'linux'
					},
					// nokia
					{
						name: 'nokia'
					}
				],
				browsers: [
					{
						name: 'iemobile',
						versionSearch: 'iemobile/'
					}, // iemobile must be tested before msie
					{
						name: 'msie',
						slugName: 'ie',
						versionSearch: 'msie '
					},
					{
						name: 'edge',
						versionSearch: 'edge/'
					},
					{
						name: 'firefox',
						versionSearch: 'firefox/'
					},
					{
						name: 'chrome',
						versionSearch: 'chrome/'
					}, // chrome must be tested before safari
					{
						name: 'safari',
						versionSearch: '(?:browser|version)/'
					},
					{
						name: 'opera',
						versionSearch: 'version/'
					}
				],
				engines: [
					{
						name: 'trident',
						versionSearch: 'trident/'
					},
					{
						name: 'edge',
						versionSearch: 'edge/'
					}, // edge需要在webkit前测试
					{
						name: 'webkit',
						versionSearch: 'webkit/'
					}, // webkit需要在gecko前测试
					{
						name: 'gecko',
						versionSearch: 'rv:'
					},
					{
						name: 'presto',
						versionSearch: 'presto/'
					}
				]
			};
		}
	})();
	// ## var/cache ##
	var cache = (function() {
		/**
		 * 浏览器本地缓存的读写
		 * @param  {String || Object || Array} name  待读写的内容
		 * @param  {String} value 存储的值
		 * @param  {Boolean} rm    如果为true则删除
		 * @return {String || Object || Array}  缓存的值或一系列值
		 */
		return function(name, value, rm) {
			var res, key, i;
			if (typeof name === 'string') {
				rm && (value = void 0);
				value = ioCache(name, value);
				rm && rmCache(name);
				return value;
			} else if (_obj.isPlainObject(name)) {
				res = {};
				for (key in name) {
					rm && (name[key] = void 0);
					res[key] = ioCache(key, name[key]);
					rm && rmCache(key);
				}
				return res;
			} else if (Object.prototype.toString.call(name) === '[object Array]') {
				res = {};
				for (i = 0; i < name.length; i++) {
					res[name[i]] = ioCache(name[i]);
					rm && rmCache(name[i]);
				}
				return res;
			} else {
				throw new Error('无法处理的缓存名类型：' + name);
			}
		};
		function ioCache(name, value) {			
			if (window.localStorage) {
				try {
					return Object.prototype.toString.call(value) !== '[object Undefined]' ? (window.localStorage.setItem(name, value), value) : window.localStorage.getItem(name);
				} catch (e) {
					console.warn(e);
				}
			}
			return ioCookie(name, value);
		}
		function rmCache(name) {
			if (window.localStorage) {
				window.localStorage.removeItem(name);
			} else {
				var exdate = new Date();
				exdate.setDate(exdate.getDate() - 10); // 10天前已到期
				document.cookie = encodeURIComponent(name) + '=removed' +
					';expires=' + exdate.toGMTString();
			}
		}
		function ioCookie(name, value) {
			if (Object.prototype.toString.call(value) !== '[object Undefined]') {
				// 存入
				var exdate = new Date();
				exdate.setDate(exdate.getDate() + 1000); // 1000天后到期
				document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value) +
					';expires=' + exdate.toGMTString();
				return value;
			} else {
				// 取出
				var ck_idx = document.cookie.indexOf(name + '='),
					ck_end;
				if (ck_idx !== -1) {
					ck_idx += name.length + 1;
					ck_end = document.cookie.indexOf(';', ck_idx);
					ck_end === -1 && (ck_end = document.cookie.length);
					return decodeURIComponent(document.cookie.substring(ck_idx, ck_end));
				}
				// 没有值时，返回null，同window.localStorage.getItem
				return null;
			}
		}
	})();
	// ## util/base ##
	var interfaces = {
		type: type,
		emitter: emitter,
		nextTick: nextTick,
		ua: ua,
		cache: cache
	};
	$.extend(interfaces, _arr, _iter, _obj, _str, _date);
	// 静态方法
	$.extend(interfaces);
	// 成员方法
	$.fn.map = function(cb) {
		// 为每个elem分别执行cb，得到结果
		var that = this,
			ret = _iter.map(this, function(elem, i) {
				return cb.call(elem, i, elem, that);
			});
		// 数组降维
		ret = _arr.tile(ret);
		// push stack 将结果生成新的$对象
		ret = _arr.merge(this.constructor(), ret);
		ret.prevObject = this;
		ret.context = this.context;
		// 返回新的对象
		return ret;
	};
	// $.fn.extend((function() {
	// 	var fn = {}, key;
	// 	/**
	// 	 * /var/dom.js 中定义的参数
	// 	 *
	// 	 * query、class、sibling、insert、append
	// 	 * css、on、off、emit
	// 	 */
	// 	for (key in interfaces) {
	// 		if (interfaces.hasOwnProperty(key) && interfaces[key] &&
	// 			(new RegExp('\\b'+key+'\\b')).test('map')) {
	// 			regFn(key, interfaces[key]);
	// 		}
	// 	}
	// 	return fn;
	// 	function regFn(key, func) {
	// 		fn[key] = function() {
	// 			var args = _arr.toArray(arguments);
	// 			return this.map(function(i, elem, thisArg) {
	// 				return func.apply(thisArg, [elem].concat(args));
	// 			});
	// 		};
	// 	}
	// })());
	// ## var/jsonp ##
	var jsonp = (function() {
		var jsonp_iid_cursor = 0;
		/**
		 * JSONPRequest类
		 */
		function JSONPRequest() {
			this.isJPR = true;
			this.io = window.__jsonp_io__ || (window.__jsonp_io__ = {cursor: 0});
			// this.ioKey = this.io.cursor++;
		}
		JSONPRequest.prototype = {
			open: function(method, url, async, options) {
				var that = this;
				this.method = method;
				if (/get/i.test(method)) {
					this.ioKey = options.iokey || this.io.cursor++;
					if (this.script) {
						this.script.parentNode.removeChild(this.script);
						this.script = null;
					}
					var script = document.createElement('script');
					script.async = typeof async === 'undefined' ? true : !!async;
					script.src = url + (this.jsonp === 'exec' ? ((/\?.+$/.test(url) ? '&' : '?') + 'iokey=' + this.ioKey) : '');
					this.script = script;
					if (script.attachEvent) {
						script.attachEvent('onerror', function(err) {
							that.onerror && that.onerror(err);
							that.done && that.done(err);
						});
						this.jsonp !== 'exec' && script.attachEvent('onload', function(e) {
							that.onload && that.onload(e);
							that.done && that.done(e);
						});
					} else {
						script.onerror = function(err) {
							that.onerror && that.onerror(err);
							that.done && that.done(err);
						};
						this.jsonp !== 'exec' && (script.onload = function(e) {
							that.onload && that.onload(e);
							that.done && that.done(e);
						});
					}
					this.jsonp === 'exec' && this.onload && (this.io[this.ioKey] = function(ret) {
						try {
							if (ret instanceof Error) {
								that.onerror && that.onerror(ret);
							} else {
								that.onload.apply(that, arguments);
							}
						} catch (e) {
							console.error('JSONP无法处理数据');
						}
						delete that.io[that.ioKey];
						that.script && (that.script.parentElement.removeChild(that.script), that.script = null);
						that.done && that.done();
					});
				} else if (/post/i.test(method)) {
					if (!this.form) {
						var form = this.form = document.createElement('form');
						form.style.display = 'none';
						form.method = 'POST';
						form.setAttribute('accept-charset', 'utf-8');
						form.action = url;
						document.body.appendChild(form);
					}
					if (this.iframe) {
						try {
							this.form.removeChild(this.iframe);
						} catch (err) {
							this.onerror && this.onerror(err);
						}
					}
					var iframe, iid = 'iId' + jsonp_iid_cursor++;
					try {
						var html = '<iframe src="javascript:0" name="'+ iid +'">';
						iframe = document.createElement(html);
					} catch (e) {
						iframe = document.createElement('iframe');
						iframe.name = iid;
						iframe.src = 'javascript:void(0)';
					}
					iframe.id = iid;
					this.form.appendChild(iframe);
					this.form.target = iid;
					this.iframe = iframe;
					if (this.done) {
						var onload = function() {
							that.form.parentElement.removeChild(that.form);
							that.form = null;
							that.done();
						};
						if (iframe.attachEvent) {
							iframe.onreadystatechange = function() {
								if (iframe.readyState === 'complete') {
									onload();
								}
							};
						} else {
							iframe.onload = onload;
						}
					}
				} else {
					throw new Error('JSONP不支持的请求方法：' + method);
				}
				return this;
			},
			send: function(data) {
				if (/get/i.test(this.method)) {
					this.script && document.body.appendChild(this.script);
				} else if (/post/i.test(this.method)) {
					this.fillForm(data);
					this.form && this.form.submit();
				}
			},
			abort: function() {
				var that = this;
				if (this.script) {
					that.script.onload = null;
					that.script.onerror = null;
					that.script.parentElement.removeChild(that.script);
					that.script = null;
					that.io[that.ioKey] = function() { that.abortedOnload(); };
				}
				if (this.form) {
					that.form.parentElement.removeChild(that.form);
					that.form = null;
				}
				that.done && that.done();
			},
			fillForm: function(data) {
				if (this.form) {
					var form = this.form,
						key, area, val, arrs, items = [];
					form.items || (form.items = {});
					if (typeof data === 'object') {
						for (key in data) {
							if (data.hasOwnProperty(key)) {
								if (!(area = form.items[key])) {
									area = document.createElement('textarea');
									area.name = key;
									form.appendChild(area);
									form.items[key] = area;
								}
								items.push(key);
								val = data[key];
								area.val = encodeURIComponent(typeof val === 'object' ? JSON.stringify(val) : val);
							}
						}
					} else if (typeof data === 'string') {
						arrs = data.split('&');
						for (var i = 0; i < arrs.length; i++) {
							val = arrs[i].split('=');
							key = val.shift();
							if (!(area = form.items[key])) {
								area = document.createElement('textarea');
								area.name = key;
								form.appendChild(area);
								form.items[key] = area;
							}
							items.push(key);
							area.val = encodeURIComponent(val.join('='));
						}
					}
					// 清理
					items = new RegExp('^('+items.join('|')+')$');
					for (key in form.items) {
						if (form.items.hasOwnProperty(key) && !items.test(key)) {
							form.removeChild(form.items[key]);
							delete form.items[key];
						}
					}
				}
			},
			abortedOnload: function() {
				delete this.io[this.ioKey];
			}
		};
		/**
		 * jsonp接口
		 * @param  {String|Object} url 链接或包含链接的配置对象
		 * @param  {Object} options 配置对象
		 * @return {XMLHttpRequest|JSONPRequest}
		 */
		return function jsonp(url, options) {
			var arr, key, val, jpr;
			try {
				// 配置
				if (typeof url === 'object') {
					options = url;
				} else {
					options.url = url;
				}
				if (!options.url) {
					throw new Error('您为指定请求的链接地址！');
				}
				options.method || (options.method = 'GET');
				'async' in options || (options.async = true);
				options.data || (options.data = '');
				options.backType || (options.backType = '');
				/**
				 * 构造及发出请求
				 */
				// jpr对象可以重复使用
				jpr = options.jpr || new JSONPRequest();
				jpr.jsonp = options.jsonp;
				// 监听
				options.success && (jpr.onload = options.success);
				options.error && (jpr.onerror = options.error);
				options.done && (jpr.done = options.done);
				// 开启
				if (/post/i.test(options.method)) {
					jpr.open(options.method.toUpperCase(), options.url, options.async);
				} else if (/get/i.test(options.method)) {
					// 数据拼接
					if (typeof options.data === 'object') {
						arr = ['method=jsonp'];
						for (key in options.data) {
							if (options.data.hasOwnProperty(key)) {
								val = options.data[key];
								typeof val === 'object' && (val = JSON.stringify(val));
								arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
							}
						}
						options.data = arr.join('&');
					}
					options.data = options.data ? '?' + options.data : '';
					jpr.open(options.method.toUpperCase(), options.url + options.data, options.async, options);
				}
				// 发送数据
				if (/get/i.test(options.method)) {
					jpr.send();
				} else if (/post/i.test(options.method)) {
					jpr.send(options.data);
				}
				// 结束
				return jpr;
			} catch (err) {
				options.error && options.error(err);
				options.done && options.done();
			}
		};
	})();
	// ## var/ajax ##
	// 参考：https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest#xmlhttprequest-responsetype
	var ajax = (function() {
		/**
		 * ajax接口
		 * @param  {String|Object} url 链接或包含链接的配置对象
		 * @param  {Object} options 配置对象
		 * @return {XMLHttpRequest|JSONPRequest}
		 */
		return function ajax(url, options) {
			var arr, key, val, xhr;
			try {
				// 配置
				if (typeof url === 'object') {
					options = url;
				} else {
					options.url = url;
				}
				if (!options.url) {
					throw new Error('您未指定请求的链接地址！');
				}
				// encodeURI 不转 ? & / 和 =
				// encodeURIComponent 会转化 ? & / 和 =
				options.url = options.url.replace(/^([\w\W]+?)(\?|#|$)([\w\W]*)/, function(url, p, b, t) {
					var search, hash;
					if (t) {
						if (b === '?') {
							t = t.split('#');
							search = t.shift();
							hash = t.join('#');
						} else if (b === '#') {
							t = t.split('?');
							hash = t.shift();
							search = t.join('?');
						}
						if (hash) {
							hash = encodeURIComponent(hash);
						}
						if (search) {
							search = search.split('&');
							for (var i = 0, len = search.length; i < len; i++) {
								var it = search[i];
								search[i] = it.replace(/([\w\W]+?)=([\w\W]*)/, function(t, k, v) {
									return encodeURIComponent(k) + '=' + encodeURIComponent(v);
								});
							}
							search = search.join('&');
						}
					}
					return encodeURI(p) +
						(search ? '?' + search : '') +
						(hash ? '#' + hash : ''); // path部分使用encodeURI
				});
				options.method || (options.method = 'GET');
				'async' in options || (options.async = true);
				options.data || (options.data = '');
				options.backType || (options.backType = '');
				// 普通AJAX方式
				if (!options.jsonp) {
					// 数据拼接
					if (typeof options.data === 'object') {
						if (!(window.FormData && options.data instanceof window.FormData)) {
							arr = [];
							for (key in options.data) {
								if (options.data.hasOwnProperty(key)) {
									val = options.data[key];
									typeof val === 'object' && (val = JSON.stringify(val));
									arr.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
								}
							}
							options.data = arr.join('&');
						}
					}
					// 适用IE 8/9 跨域时 origin不可为ip数字，可以是localhost
					if (window.XDomainRequest) {
						if (/(:|^)\/\//.test(url) &&
							!(new RegExp('(:|^)\\/\\/' + window.location.host + '\\/')).test(url)) {
							var xdr = new XDomainRequest();
							// xdr.open(options.method, options.url);
							xdr.onload = function() {
								// alert(xdr.responseText);
								options.success && options.success(xdr.responseText);
								options.done && options.done();
							};
							xdr.onerror = function() {
								// alert('错误')
								options.error && options.error('错误！请确保请求的Origin不是IP数值，否则open会报错');
								options.done && options.done();
							};
							if (/post/i.test(options.method)) {
								xdr.open(options.method.toUpperCase(), options.url);
								xdr.send(options.data);
							} else if (/get/i.test(options.method)) {
								options.data = options.data ? '?' + options.data : '';
								xdr.open(options.method.toUpperCase(), options.url + options.data);
								xdr.send();
							}
							return xdr;
						}
					}
					xhr = typeof(XMLHttpRequest) !== 'undefined' ?
						new XMLHttpRequest() :
						(typeof(ActiveXObject) !== 'undefined' ?
							new window.ActiveXObject('Microsoft.XMLHTTP') :
							null);
					if (!xhr) {
						console.warn('您的浏览器不支持普通的AJAX传输!');
					} else {
						// 监听
						xhr.onreadystatechange = function() {
							if (this.readyState === 4) {
								try {
									if (this.status >= 200 && this.status < 300) {
										if (options.success) {
											var contentType;
											try {
												contentType = this.getResponseHeader('Content-Type').split(';')[0];
											} catch (err) {}
											if (this.responseType === 'text' ||
												this.responseType === '' ||
												typeof this.responseType === 'undefined') {
												options.success(this.responseText, this.status);
											} else {
												options.success(this.response || this.responseText, this.status);
											}
											// if (contentType === 'application/octet-stream') {
											// 	options.success(this.response, this.status);
											// } else {
											// 	options.success(this.responseText, this.status);
											// }
										}
									} else {
										options.error && options.error({
											type: 'error',
											code: this.status
										});
									}
								} catch (err) {
									console.error(err);
								}
								options.done && options.done();
							}
						};
						// 开启
						if (/post/i.test(options.method)) {
							xhr.open(options.method.toUpperCase(), options.url, options.async);
						} else if (/get/i.test(options.method)) {
							options.data = options.data ? '?' + options.data : '';
							xhr.open(options.method.toUpperCase(), options.url + options.data, options.async);
						}
						// 设置
						options.timeout && (xhr.timeout = parseInt(options.timeout));
						options.backType && (xhr.responseType = options.backType);
						// ('withCredentials' in xhr) && (xhr.withCredentials = true); // 默认允许跨域，IE10+
						if (/post/i.test(options.method) && typeof options.data === 'string') {
							xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
						}
						if (options.headers) {
							for (key in options.headers) {
								if (options.headers.hasOwnProperty(key)) {
									xhr.setRequestHeader(key, options.headers[key]);
								}
							}
						}
						// 发送数据
						if (/get/i.test(options.method)) {
							xhr.send();
						} else if (/post/i.test(options.method)) {
							xhr.send(options.data);
						}
						// 结束
						return xhr;
					}
				}
				// 使用jsonp方式
				if (jsonp) {
					return jsonp(options);
				} else {
					console.warn('您未引入jsonp程序');
				}
			} catch (err) {
				options.error && options.error(err);
			}
		};
	})();
	// ## util/conn ##
	$.extend({ ajax: ajax });
	// ## util/dom ##
	$.extend(dom);
	$.fn.extend((function() {
		var fn = {}, key;
		/**
		 * /var/dom.js 中定义的参数
		 *
		 * query、class、sibling、insert、append
		 * css、on、off、emit
		 */
		for (key in dom) {
			if (dom.hasOwnProperty(key) && dom[key]) {
				regFn(key, dom[key]);
			}
		}
		return fn;
		function regFn(key, func) {
			fn[key] = function() {
				var args = _arr.toArray(arguments);
				return this.map(function(i, elem, thisArg) {
					return func.apply(thisArg, [elem].concat(args)) || elem;
					// return elem;
				});
			};
		}
	})());
	// ## var/q ##
	var q = (function() {
		function Promise(resolver) {
			this.status = 0;
			this.val = null;
			this.pending = [];
			// 构造
			if (typeof resolver !== 'undefined') {
				var that = this;
				if (typeof resolver === 'function') {
					resolver(function(val) {
						that.exec(1, val);
					}, function(reason) {
						that.exec(2, reason);
					});
				} else {
					this.exec(1, resolver);
				}
			}
		}
		Promise.prototype = {
			then: function(onfulfilled, onrejected, onprogress) {
				var that, node, promise;
				// 创建子节点对象
				promise = new Promise();
				node = [
					promise,
					onfulfilled,
					onrejected,
					onprogress
				];
				promise.node = node;
				// 依据本节点状态处理此处新构造的子节点
				if (this.status && !this.pending.length) {
					that = this;
					nextTick(function() {
						promise.exec(that.status, that.val);
					});
				} else {
					this.pending.push(node);
				}
				// 返回子节点的promise
				return promise;
			},
			exec: function(status, val) {
				if (this.status) { return this; }
				var that = this, then, lock, func;
				try {
					// 本节点解析
					func = this.node && this.node[status];
					if (typeof func === 'function') {
							val = func(val);
							status = 1;
					}
					// 结果分析
					if (val === this) { // 2.3.1
						throw new TypeError('val === promise');
					} else if (status === 1 && val instanceof Promise) { // 2.3.2
						if (val.status && !val.pending.length) { // 2.3.2.2 和 2.3.2.3
							nextTick(function() {
								that.node = null;
								that.exec(val.status, val.val);
							});
						} else { // 2.3.2.1
							this.node = [this, null, null, null ];
							val.pending.push(this.node);
						}
					} else if ((typeof val === 'object' ||
								typeof val === 'function') &&
								status === 1 && val !== null && 'then' in val) { // 2.3.3
						try {
							// 2.3.3.1
							then = val.then;
							// 2.3.3.3
							if (typeof then === 'function') {
								lock = 0;
								try {
									then.call(val, function resolvePromise(y) {
										// 2.3.3.3.1
										if (lock === 0) {
											that.node = null;
											that.exec(1, y);
											lock = 1;
										}
									}, function rejectPromise(r) {
										// 2.3.3.3.2
										if (lock === 0) {
											that.node = null;
											that.exec(2, r);
											lock = 1;
										}
									});
								} catch (e) {
									if (lock === 0) { // 2.3.3.3.4
										throw e;
									}
								}
							} else { // 2.3.3.4
								this.status = 1;
								this.val = val;
								this.dispatch();
							}
						} catch(e) { // 2.3.3.2
							throw e;
						}
					} else if (typeof status !== 'undefined') { // 2.3.4
						this.status = status;
						this.val = val;
						this.dispatch();
					} else {
						throw new Error('Promise处于未知的状态');
					}
				} catch (e) {
					this.status = 2;
					this.val = e;
					this.dispatch();
				}
				return this;
			},
			dispatch: function(nonFirst) {
				// 按顺序将pending内操作推入执行列表
				var that = this,
					node = this.pending.shift(),
					promise;
				if (node) {
					promise = node[0];
					nextTick(function() {
						promise.exec(that.status, that.val);
						that.dispatch(true);
					});
				} else if ((that.status === 2) && !nonFirst) {
					// 任务出错后，如果没有在后续注册onrejected,则输出异常
					console.warn(that.val);
					// 由于promise可以在任何时间绑定新的onrejected，所以此处不使用throw
				}
			}
		};
		// 更多接口
		/**
		 * 返回一个resolved的Promise对象
		 * @param  {*} val 以此为解析值
		 * @return {Promise}
		 */
		Promise.prototype.resolve = function(val) {
			return this.exec(1, val);
		};
		/**
		 * 返回一个rejected的Promise对象
		 * @param  {*} reason 以此为原因
		 * @return {Promise}
		 */
		Promise.prototype.reject = function(reason) {
			return this.exec(2, reason);
		};
		/**
		 * 错误处理接口的封装 在IE8- 会报错
		 * @param  {Function} onrejected 错误处理函数
		 * @return {Promise}
		 */
		Promise.prototype['catch'] = function(onrejected) {
			return this.then(void 0, onrejected, void 0);
		};
		/**
		 * 最后执行接口的封装
		 * @param  {Function} done
		 * @return {Promise}
		 */
		Promise.prototype.done = function(cb) {
			return this.then(cb, cb, void 0);
		};
		/**
		 * 按顺序执行所有指定的操作
		 * @param  {Array || *} arr
		 * @return {Promise}
		 */
		Promise.prototype.chain = function() {
			var p = this,
				arr = arguments[0];
			Object.prototype.toString.call(arr) === '[object Array]' || (arr = arguments);
			function exec(item) {
				if ((item && item.then && typeof item.then === 'function') ||
					typeof item !== 'function') {
					p = p.then(function() {
						return item;
					});
				} else {
					p = p.then(function(val) {
						while (typeof item === 'function') {
							item = item(val);
						}
						return item;
					});
				}
			}
			for (var i = 0; i < arr.length; i++) {
				exec(arr[i]);
			}
			return p;
		};
		/**
		 * 当所有的子Promise执行后，继续下一步
		 * @param  {Array || *} arr
		 * @return {Promise}
		 */
		Promise.prototype.all = function() {
			var arr = arguments[0];
			Object.prototype.toString.call(arr) === '[object Array]' || (arr = arguments);
			return this.then(function(val) {
				if (!arr.length) { return val; }
				var count = 0, p = new Promise();
				function exec(item, i, p) {
					if (item && item.then && typeof item.then === 'function') {
						item.then(function(val) {
							count++;
							arr[i] = val;
							count >= arr.length && p.resolve(arr);
						}, function(reason) {
							p.reject(reason);
						});
					} else if (typeof item === 'function') {
						// 递归，任务返回函数或promise时不视其为值，执行完后才继续
						exec((arr[i] = item(val)), i, p);
					} else {
						count++;
						count >= arr.length && p.resolve(arr);
					}
				}
				try {
					for (var i = 0, len = arr.length; i < len; i++) {
						exec(arr[i], i, p);
					}
				} catch (err) {
					p.reject(err);
				}
				return p;
			});
		};
		/**
		 * 竞争
		 * @param  {Array || *} arr 待竞争的对象组
		 * @return {Promise}
		 */
		Promise.prototype.race = function() {
			var arr = arguments[0];
			Object.prototype.toString.call(arr) === '[object Array]' || (arr = arguments);
			return this.then(function() {
				var p = new Promise(function(resolve) {
					for (var i = 0; i < arr.length; i++) {
						var item = arr[i];
						if ((item && item.then && typeof item.then === 'function') ||
							typeof item !== 'function') {
							resolve(item);
						} else {
							while (typeof item === 'function') {
								item = item();
							}
							resolve(item);
						}
					}
				});
				return p;
			});
		};
		/**
		 * Promise对象的接口函数
		 * @param {Function} resolver 解析函数用于resolve或reject对象
		 */
		return function Q(resolver) {
			return new Promise(resolver);
		};
	})();
	// ## util/q ##
	$.extend({ q: q });
	$.extend($.q, {
		ajax: function(url, options) {
			options || (options = {});
			if (typeof url === "object") {
				options = url;
			} else {
				options.url = url;
			}
			return $.q(function(resolve, reject) {
				var s = options.success,
					e = options.error;
				options.success = !s ? function(text/*, status*/) {
					// resolve({ text: text, status: status });
					resolve(text);
				} : function(text, status) {
					s(text, status);
					// resolve({ text: text, status: status });
					resolve(text);
				};
				options.error = !e ? function(text/*, status*/) {
					// reject({ text: text, status: status });
					reject(text);
				} : function(text) {
					e(text, status);
					// reject({ text: text, status: status });
					reject(text);
				};
				$.ajax(url, options);
			});
		}
	});
	// ## util/traverse ##
	$.extend((function() {
		return {
			traverse: traverse,
			trav: traverse,
			tree: tree
		};
		/**
		 * 通过遍历生成目录DOM树
		 * 适用于[
		 * 	{
		 * 		id: "",
		 * 		text: "",
		 * 		children: []
		 * 	},{},
		 * ...]
		 * nd: 数据节点 或 数据节点数组
		 * sup: dom容器
		 * tags: ["id", "text", "children"]
		 *
		 * 如果第一次输入的sup为空,则会创建一个新的sup并在最后返回
		 */
		function tree(nd, sup, tags, adj) {
			if (!sup) {
				sup = document.createElement('ul');
				sup.className = 'tree';
			}
			$.trav(nd, function(nd, mid) {
				var supDiv, id, text, node, leaf;
				if (mid && mid.sup) {
					supDiv = mid.sup;
				} else {
					supDiv = sup;
				}
				// 构造节点
				id = nd[tags[0]];
				text = nd[tags[1]];
				node = document.createElement('li');
				leaf = document.createElement('label');
				node.className = 'node';
				node.id = id;
				supDiv.appendChild(node);
				leaf.className = 'leaf';
				leaf.innerHTML = text;
				node.appendChild(leaf);
				adj && adj(nd, node, leaf);
				// 构造中间件
				if (nd[tags[2]]) {
					var tree = node.getElementsByTagName('ul')[0];
					if (!tree) {
						tree = document.createElement('ul');
						tree.className = 'tree';
						node.appendChild(tree);
					}
					mid = $.extend(mid, {
						sup: tree
					});
				}
			}, (tags && tags[2]));
			return sup;
		}
	})());
	// ## var/timer ##
	var timer = (function() {
		window.requestAnimationFrame = window.requestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.msRequestAnimationFrame;
		window.cancelAnimationFrame = window.cancelAnimationFrame ||
			window.mozCancelAnimationFrame ||
			window.webkitCancelAnimationFrame ||
			window.msCancelAnimationFrame;
		Date.now || (Date.now = function() {
			return (new Date()).getTime();
		});
		var tickId = 0,
			clock = {
				id: null,
				now: undefined,
				listeners: [],
				// 处理clock
				start: function() {
					if (!clock.id) {
						clock.id = window.requestAnimationFrame ?
							window.requestAnimationFrame(clock.raft) :
							setInterval(clock.tick, 1000/60);
					}
				},
				stop: function() {
					if (clock.id) {
						if (window.cancelAnimationFrame) {
							window.cancelAnimationFrame(clock.id);
						} else {
							clearInterval(clock.id);
						}
						clock.id = null;
					}
				},
				tick: function() {
					var listener, i = 0,
						listeners = clock.listeners;
					clock.now = Date.now();
					for (i = 0; i < listeners.length; i++) {
						listener = listeners[i];
						if (!(listener()) && listeners[i] === listener) {
							listeners.splice(i--, 1);
						}
					}
					if (!listeners.length) {
						clock.stop();
					}
					clock.now = undefined;
				},
				raft: function() {
					if (clock.id) {
						clock.id = window.requestAnimationFrame(clock.raft);
						clock.tick();
					}
				},
				// 处理listeners
				append: function(listener) {
					clock.listeners.push(listener);
					listener.id = tickId++;
					if (listener()) {
						clock.start();
					} else {
						clock.listeners.pop();
					}
				},
				query: function(tick) {
					var i, listener,
						listeners = clock.listeners;
					for (i = listeners.length - 1; i >= 0; i--) {
						listener = listeners[i];
						if (listener.id === tick) {
							return listener.timer;
						}
					}
					// 
					return null;
				}
			};
		// 一个定时过程的抽象
		function Timer() {
			this.idle = true; // true：闲置中，false：已挂载
			this.duration = 0; // timer持续的长度
			this.done = null;
			this.intable = true; // 默认定时器可以中断
			this.tweens = {};
			this.liveup = true; // 在线更新，默认允许
			// 
			this.tick = null; // 定时器的时间监听器的id
			this.start = null; // timer开始执行的时间
		}
		Timer.prototype = {
			// 将timer挂靠到时钟上
			attach: function() {
				if (!this.idle) {
					return this;
				}
				this.idle = false;
				this.start = (clock.now || Date.now()) + (this.delay || 0);
				var timer = this,
					tick = function() {
						if (!timer.idle && tick.id === timer.tick) {
							var current = clock.now || Date.now(),
								duration = timer.duration,
								remain, pos, i;
							if (duration === 0) {
								pos = 0; // 当duration为0时，无线循环，pos一直为0
								if (timer.start > current) { return true; } // 延迟执行
							} else {
								remain = Math.max(0, timer.start + duration - current);
								pos = 1 - remain / duration;
								if (pos < 0) { return true; } // 延迟执行
							}
							try {
								for (i = 0; i < timer.tweens.length; i++) {
									if (timer.tweens[i](pos) === false) {
										timer.tweens.splice(i--, 1);
									}
								}
							} catch (e) {
								console.warn(e);
							} finally {
								if (pos < 1 && timer.tweens.length) {
									// 当过程还未完成时，返回剩余的时间长度，以ms为单位
									return true; // 保持监听
								}
							}
						}
						// 当过程已经完成或由外界中断时，修改状态，执行done方法，然后返回false
						timer.idle = true;
						timer.tick = null;
						if (timer.done) {
							timer.done();
						}
						return false; // 退出监听
					};
				tick.id = tickId;
				tick.timer = this;
				this.tick = tickId; // 避免循环引用
				// 推入时钟
				clock.append(tick);
			},
			/**
			 * 增、删、改
			 */
			// 构建， 支持在线更新，在线更新不会构造新的tick
			construct: function(options) {
				if (!this.idle && !this.liveup) {
					return this;
				}
				/**
				 * options = {
				 * 	duration: 300, 可选 默认500
				 * 	intable: true, 可选 默认true
				 * 	tweens: [], 可以是函数， 空时，timer不会开启
				 * 	done: function(){} 可选 在timer结束后执行
				 * }
				 */
				options = options || {};
				this.duration = (Object.prototype.toString.call(options.duration) === '[object Number]' ? options.duration : 500);
				this.done = options.done || null;
				this.intable = (options.intable !== false);
				this.liveup = (options.liveup !== false);
				this.delay = (options.delay && options.delay > 0 ? options.delay : 0);
				this.tweens = options.tweens || options.tween || [];
				// 支持单个tweens
				if (Object.prototype.toString.call(this.tweens) === '[object Function]') {
					this.tweens = [ this.tweens ];
				}
				// 挂载
				if (this.idle && (this.tweens.length || typeof options.delay !== 'undefined')) { // 输入delay时至少执行一次
					this.attach();
				} else {
					this.start = Date.now();
				}
				// 返回
				return this;
			},
			// 中断
			interrupt: function(gotoEnd) {
				if (this.idle) {
					return this;
				}
				this.idle = true;
				// 调整补间
				if (gotoEnd || !this.intable) {
					for (var i = 0; i < this.tweens.length; i++) {
						this.tweens[i](1);
					}
					this.tweens = [];
				}
				// 返回
				return this;
			}
		};
		return function(options, done) {
			// 2.2.1
			if (!options || typeof options !== 'object') {
				return new Timer();
			}
			if (done && typeof done === 'function') {
				options.done = done;
			}
			// 2.2.2
			if (typeof options.tick === 'number') { // 2.2.2.1
				var timer = clock.query(options.tick);
				if (timer) {
					return timer.construct(options);
				}
			}
			return (new Timer()).construct(options); // 2.2.2.2
		};
	})();
	// ## util/timer ##
	$.extend({ timer: timer });
	// ## util ##
	// ## jqlite ##
	return (window['$'] = $);
}));

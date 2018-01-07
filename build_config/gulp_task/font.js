/**
 * 从svg构造webfont，读取 app/assets/fonts/svg 目录并生成字体文件和字体CSS样式，
 * 功能与用法类似font-awesome，svg文件命名规则：<code>-<name>.svg
 * 例如：uE80B-warn.svg
 * 使用时引入css：icon-warn 即可
 * 亦可应用在HTML CSS content 内容中，使用code代码："\E80B"
 */

var gulp = require('gulp'),
	path = require('path'),
	iconfont = require('gulp-iconfont'),
	consolidate = require('gulp-consolidate'),
	rename = require('gulp-rename'),
	SRC_PATH = 'src/'; // 相对于项目根目录

// key值为字体名称（这里是'hyfont'）
regTasks({
	icon: 'assets/fonts'
});

function regTasks(options) {
	var taskArr = [];
	for (var key in options) {
		if (options.hasOwnProperty(key)) {
			var val = options[key];
			if (typeof val === 'string') {
				val = {
					dir: val
				};
			}
			regTask(key, val);
			taskArr.push('font:' + key);
		}
	}
	gulp.task('font', taskArr);
}
function regTask(name, val) {
	gulp.task('font:' + name, function() {
		const outputPath = path.resolve(SRC_PATH, val.dir || name);
		return gulp.src((val.dir || name) + '/svg/*.svg', {
				cwd: SRC_PATH
			})
			.pipe(iconfont({
				fontName: name, // 字体的family名
				formats: [ 'ttf', 'eot', 'woff', 'woff2', 'svg' ],
				fixedWidth: true, // true 等宽字体
				centerHorizontally: true, // true 横向居中
				normalize: true, // 将svg拉伸为同样的高度
				fontHeight: 1000, // 字体高度 默认为输入图片中最高图片的高度
				descent: 140, // 生成的字体下边线相对baseline的偏移 向下为正
				// ascent: 820, // 生成的字体上边线相对baseline的偏移 向上为正
				metadata: 'Copyright © 2018 by V5KF. All rights reserved.', // 元数据 可用于存储版权信息
				startUnicode: 59905,
				prependUnicode: true // true会将生成的编码添加到svg文件名前，用于保证下次使用相同的编码
			}))
			.on('glyphs', function(glyphs/*, options*/) {
				// 生成样例html、stylus、scss、css、json
				gulp.src('tpl.*', {
						cwd: 'build_config/gulp_task/font'
					})
					.pipe(consolidate('lodash', {
						glyphs: glyphs,
						fontName: name,	// 字体名
						fontRefer: '../assets/fonts', // @font-face引用字体文件路径
						fontPath: outputPath,
						className: (val.className || name)
					}))
					.pipe(rename({basename: name}))
					.pipe(gulp.dest(outputPath));
			})
			.pipe(gulp.dest(outputPath));
	});
}

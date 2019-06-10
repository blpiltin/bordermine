var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var sass = require('gulp-sass');
var svgSprite = require("gulp-svg-sprites");

// Compile sass into CSS & auto-inject into browsers
//------------------------------------------------------
gulp.task('sass', function () {
	return gulp.src([
			'node_modules/bootstrap/scss/bootstrap.scss',
			'client/scss/*.scss'
		])
		.pipe(sass())
		.pipe(gulp.dest("client/css"))
		.pipe(browserSync.stream());
});

// Move the javascript files into our /client/js folder
//------------------------------------------------------
gulp.task('js', function () {
	return gulp.src(
			['node_modules/bootstrap/dist/js/bootstrap.min.js',
				'node_modules/jquery/dist/jquery.min.js',
				'node_modules/popper.js/dist/umd/popper.min.js'
			])
		.pipe(gulp.dest("client/js"))
		.pipe(browserSync.stream());
});

// Static Server + watching scss/html files
//------------------------------------------------------
gulp.task('serve', gulp.series('sass', function () {

	// For now start server using: node server/server.js (not nodemon!!!)
	browserSync.init({
		proxy: "localhost:3000"
	});

	gulp.watch([
		'node_modules/bootstrap/scss/bootstrap.scss',
		'client/scss/*.scss'
	], gulp.series('sass'));
	gulp.watch("client/*.html").on('change', browserSync.reload);
	gulp.watch("client/views/**/*.hbs").on('change', browserSync.reload);
}));

// Process .svg dashicons 
//------------------------------------------------------
gulp.task('sprites', function () {
    return gulp.src('client/assets/svg/*.svg')
        .pipe(svgSprite({mode: "symbols"}))
        .pipe(gulp.dest("client/assets"));
});

gulp.task('default', gulp.parallel('js', 'serve'));
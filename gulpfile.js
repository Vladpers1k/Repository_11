const { src, dest, task, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create()
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const csscomb = require('gulp-csscomb')

const PATH = {
  scssRoot: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  htmlFiles: './*.html',
  jsFiles: './assets/js/**/*.js',
  cssRoot: './assets/css'
}

const PLUGINS = [cssnano({ preset: 'default' })]

function scss() {
  return src(PATH.scssRoot).pipe(sass().on('error', sass.logError)).pipe(dest(PATH.cssRoot)).pipe(browserSync.stream())
}

function comb() {
  return src(PATH.scssFiles).pipe(csscomb()).pipe(dest(PATH.scssFolder))
}

function scssMin() {
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream())
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
}

function reload(done) {
  browserSync.reload()
  done()
}

function watchFiles() {
  syncInit()
  watch(PATH.scssFiles, series(scss, scssMin))
  watch(PATH.htmlFiles, reload)
  watch(PATH.jsFiles, reload)
}

task('scss', series(scss, scssMin))
task('watch', watchFiles)
task('comb', comb)

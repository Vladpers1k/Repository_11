const { src, dest, task, watch, series } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create()
const cssnano = require('cssnano')
const rename = require('gulp-rename')
const postcss = require('gulp-postcss')
const csscomb = require('gulp-csscomb')
const autoprefixer = require('autoprefixer')
const mqpacker = require('css-mqpacker')
const sortCSSmq = require('sort-css-media-queries')

const PATH = {
  scssRoot: './assets/scss/style.scss',
  scssFiles: './assets/scss/**/*.scss',
  scssFolder: './assets/scss',
  htmlFiles: './*.html',
  jsFiles: './assets/js/**/*.js',
  cssRoot: './assets/css'
}

const PLUGINS = [
  autoprefixer({
    overrideBrowserslist: ['> 0.1%', 'last 5 versions', 'ie 10', 'not dead']
  }),
  mqpacker({ sort: sortCSSmq })
]

async function scss() {
  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(PLUGINS))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream())
}

async function scssDev() {
  const pluginsForDevMode = [...PLUGINS]
  pluginsForDevMode.splice(0, 1)

  return src(PATH.scssRoot, { sourcemaps: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsForDevMode, { map: true }))
    .pipe(dest(PATH.cssRoot, { sourcemaps: '.' }))
    .pipe(browserSync.stream())
}

async function scssMin() {
  const pluginsForMinified = [...PLUGINS, cssnano({ preset: 'default' })]

  return src(PATH.scssRoot)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(pluginsForMinified))
    .pipe(rename({ suffix: '.min' }))
    .pipe(dest(PATH.cssRoot))
    .pipe(browserSync.stream())
}

async function comb() {
  return src(PATH.scssFiles).pipe(csscomb()).pipe(dest(PATH.scssFolder))
}

function syncInit() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  })
}

async function reload(done) {
  await browserSync.reload()
}

function watchFiles() {
  syncInit()
  watch(PATH.scssFiles, scss)
  watch(PATH.htmlFiles, reload)
  watch(PATH.jsFiles, reload)
}

function watchDevFiles() {
  syncInit()
  watch(PATH.scssFiles, scssDev)
  watch(PATH.htmlFiles, reload)
  watch(PATH.jsFiles, reload)
}

task('scss', series(scss, scssMin))
task('dev', scssDev)
task('watch', watchFiles)
task('watchDev', watchDevFiles)
task('comb', comb)

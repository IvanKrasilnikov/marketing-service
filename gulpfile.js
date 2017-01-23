"use strict";

// --- *** PACKAGES *** --------------------------------------------------------
const gulp = require('gulp');
const archiver = require('gulp-archiver');
const cheerio = require('gulp-cheerio');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const path = require('path');
const prettify = require('gulp-html-prettify');
const pug = require('gulp-pug');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const sassGlob = require('gulp-sass-glob');
const svgo = require('gulp-svgo');
const svgstore = require('gulp-svgstore');
const watch = require('gulp-watch');
// --- FOR BABEL ---------------------------------------------------------------
/** Реализует метод require */
const browserify = require('browserify');
/** Расширение Browserify для работы с Babel */
const babelify = require('babelify');
/** Browserify имеет API для работы с потоками напрямую из Gulp. Мы используем
  * vinyl-source-stream чтобы получить выходные данные Browserify и сохранить
  * их в файл с помощью Gulp.
  */
const source = require('vinyl-source-stream');
// --- FOR POSTCSS -------------------------------------------------------------
const postcss = require('gulp-postcss');
const alias = require('postcss-alias');
const assets  = require('postcss-assets');
const autoprefixer = require('autoprefixer');
const pe = require('postcss-pseudoelements');

// -----------------------------------------------------------------------------

// --- *** DIRECTORIES *** -----------------------------------------------------
const rootDir = '.';
const devDir = rootDir + '/dev';
const backEndDir = rootDir + '/back_end';
const prodDir = rootDir + '/prod';

// -----------------------------------------------------------------------------

// --- *** SETTINGS *** --------------------------------------------------------
const settings = {
  clean: {read: false},
  jsConcatVendors: {newLine: '\n\n/*** NEXT VENDOR ***/\n\n'},
  jsConcatBLOCKS: {newLine: '\n/*** NEXT BLOCK ***/\n\n'},
  prettify: {indent_char: ' ', indent_size: 2},
  pug: {pretty: true},
  sass: {outputStyle: 'expanded'},
  watchJsConcatBLOCKS: {name: 'js-concat-BLOCKS', verbose: true},
  watchJsConcatVendors: {name: 'js-concat-vendors', verbose: true},
  watchPug: {name: 'pug', verbose: true},
  watchSassAutopref: {name: 'sass-autopref', verbose: true},
  watchSassAutoprefVendors: {name: 'sass-autopref-vendors', verbose: true},
  // --- FOR SVG ---------------------------------------------------------------
  cheerioSvg: {
    run: ($) => {
      $('svg').attr('style', 'display:none');
    },
    parserOptions: {xmlMode: true}
  },
  renameSvg: {prefix: 'svg-'},
  svgstore: {inlineSvg: true},
  watchSvg: {name: 'svg', verbose: true},
  // --- FOR BABEL -------------------------------------------------------------
  browserify: {
    /** Откуда Browserify собирает */
    entries: './dev/js/es6/es6.js'
  },
  babelify: {
    presets: ['es2015']
  },
  watchBabel: {name: 'babel', verbose: true},
  // --- FOR POSTCSS -----------------------------------------------------------
  autoprefixer: {
    browsers: ['last 2 Chrome versions', '> 5%', 'Firefox ESR', 'ie >= 9']
  }
};

// -----------------------------------------------------------------------------

// --- *** SINGLE TASKS *** ----------------------------------------------------

// --- SASS TASKS --------------------------------------------------------------
gulp.task('sass-autopref', () => {
  sassAutopref(`${devDir}/scss/main.scss`);
});

gulp.task('sass-autopref-vendors', () => {
  sassAutopref(`${devDir}/scss/vendors/vendors.scss`);
});

gulp.task('sass-autopref:watch', ['sass-autopref'], () => {
  return watch([
    `${devDir}/scss/**/*.scss`,
    `${devDir}/BLOCKS/**/*.scss`,
    `!${devDir}/scss/vendors/**/*.scss`],
    settings.watchSassAutopref, () => {
    sassAutopref(`${devDir}/scss/main.scss`);
  });
});

gulp.task('sass-autopref-vendors:watch', ['sass-autopref-vendors'], () => {
  return watch(
    `${devDir}/scss/vendors/**/*.scss`,
    settings.watchSassAutoprefVendors, () => {
    sassAutopref(`${devDir}/scss/vendors/vendors.scss`);
  });
});

function sassAutopref(src) {
  const processors = [
    alias(),
    autoprefixer(settings.autoprefixer),
    assets({loadPaths: ['img/'], basePath: `${devDir}/`}),
    pe()
  ];

  return gulp.src(src)
    .pipe(sassGlob())
    .pipe(sass(settings.sass).on('error', sass.logError))
    .pipe(plumber())
    .pipe(postcss(processors))
    .pipe(gulp.dest(`${devDir}/css`));
}

// --- PUG TASKS ---------------------------------------------------------------
gulp.task('pug', () => {
  pugCompile();
});

gulp.task('pug:watch', ['pug'], () => {
  return watch([
    `${devDir}/BLOCKS/**/*.pug`,
    `${devDir}/pug/**/*.pug`,
    `${devDir}/svg/symbols.svg`],
    settings.watchPug,
    () => {
      pugCompile();
    }
  );
});

function pugCompile() {
  gulp.src(`${devDir}/pug/*.pug`)
    .pipe(plumber())
    .pipe(pug())
    .pipe(prettify(settings.prettify))
    .pipe(gulp.dest(`${devDir}/`));
}

// --- JS TASKS ----------------------------------------------------------------
gulp.task('js-concat-vendors', () => {
  jsConcatVendors();
});

gulp.task('js-concat-vendors:watch', ['js-concat-vendors'], () => {
  return watch(
    [`${devDir}/js/vendors/**/*.js`,
    `!${devDir}/js/vendors/not-concat/**/*.js`],
    settings.watchJsConcatVendors,
    () => {
    jsConcatVendors();
  });
  // gulp.watch(devDir + '/js/vendors/**/*.js', ['js-concat-vendors']);
});

gulp.task('js-concat-BLOCKS', () => {
  jsConcatBLOCKS();
});

gulp.task('js-concat-BLOCKS:watch', ['js-concat-BLOCKS'], () => {
  return watch([
    `${devDir}/js/global.js`,
    `${devDir}/js/es6-compile.js`,
    `${devDir}/BLOCKS/**/*.js`
  ], settings.watchJsConcatBLOCKS, () => {
    jsConcatBLOCKS();
  });
});

// --- BABEL ---
gulp.task('babel', () => {
  babelCompile();
});

gulp.task('babel:watch', ['babel'], () => {
  return watch(`${devDir}/js/es6/`, settings.watchBabel, () => {
    babelCompile();
  });
});

function babelCompile() {
  return browserify(settings.browserify)
    .transform('babelify', settings.babelify)
    .bundle()
    .on('error', (err) => { console.log(err.stack); })
    .pipe(source('es6-compile.js'))
    .pipe(gulp.dest(`${devDir}/js/`));
}
// -------------

function jsConcatVendors() {
  return gulp.src(
    [`${devDir}/js/vendors/**/*.js`,
    `!${devDir}/js/vendors/not-concat/**/*.js`])
    .pipe(concat('vendors.js', settings.jsConcatVendors))
    .pipe(gulp.dest(`${devDir}/js/`));
}

function jsConcatBLOCKS() {
  return gulp.src([
    `${devDir}/js/global.js`,
    `${devDir}/js/es6-compile.js`,
    `${devDir}/BLOCKS/**/*.js`
  ])
    .pipe(concat('main.js', settings.jsConcatBLOCKS))
    .pipe(gulp.dest(`${devDir}/js/`));
}

// --- SVG TASKS ---------------------------------------------------------------
gulp.task('svg', () => {
  svgCompile();
});

gulp.task('svg:watch', ['svg'], () => {
  return watch(`${devDir}/svg/symbols/**/*.svg`, settings.watchSvg, () => {
    svgCompile();
  });
});

function svgCompile() {
  return gulp.src(`${devDir}/svg/symbols/**/*.svg`)
    .pipe(rename(settings.renameSvg))
    .pipe(svgo())
    .pipe(svgstore(settings.svgstore))
    .pipe(cheerio(settings.cheerioSvg))
    .pipe(gulp.dest(`${devDir}/svg`));
}

// --- OTHER TASKS -------------------------------------------------------------
gulp.task('back_end-clean-folder', () => {
  return gulp.src(`${backEndDir}/**`, settings.clean)
  .pipe(clean());
});

gulp.task('back_end', ['back_end-clean-folder'], () => {
  gulp.src([
    `${devDir}/*.html`,
    `${devDir}/**/*.css`,
    `${devDir}/**/vendors.js`, `${devDir}/**/main.js`,
    `${devDir}/**/*.+(jpg|png)`,
    `${devDir}/**/*.+(eot|ttf|svg|woff|woff2)`
  ])
    .pipe(gulp.dest(backEndDir));
});

gulp.task('back_end-to-zip', () => {
  let curTime = new Date();
  let insertTime =
    curTime.getDate() + '-' +
    (curTime.getMonth() + 1) + '-' +
    curTime.getFullYear() + '-' +
    curTime.getTime().toString().slice(8);

  return gulp.src(`${backEndDir}/**`)
    .pipe(archiver(`back_end-${insertTime}.zip`))
    .pipe(gulp.dest(rootDir));
});

// -----------------------------------------------------------------------------


// --- UNITY TASKS -------------------------------------------------------------
gulp.task('default', [
  'svg:watch',
  'pug:watch',
  'sass-autopref:watch',
  'sass-autopref-vendors:watch',
  'js-concat-vendors:watch',
  'babel:watch',
  'js-concat-BLOCKS:watch'
]);

// -----------------------------------------------------------------------------

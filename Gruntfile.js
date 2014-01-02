module.exports = function(grunt) {
  grunt.initConfig({
    // package info
    pkg: grunt.file.readJSON('package.json'),

    // metadata
    meta: {
      banner:
'/*!\n' +
' * <%= pkg.title || pkg.name %> (v<%= pkg.version %>)\n' +
' *\n' +
' * <%= pkg.description %>\n' +
' * <%= pkg.homepage %>\n' +
' *\n' +
' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
' * Licensed under the <%= pkg.license %> license.\n' +
' */'
    },

    // lint
    jshint: {
      options: {
        curly: true,
        eqnull: true,
        eqeqeq: true,
        undef: true
      },
      node: {
        options: {
          node: true
        },
        src: ['Gruntfile.js']
      },
      src: {
        options: {
          browser: true,
          globals: {
            define: true,
            module: true
          }
        },
        src: ['event-emitter.js']
      },
      test: {
        options: {
          globals: {
            EventEmitter: true,
            describe: true,
            beforeEach: true,
            afterEach: true,
            it: true,
            expect: true,
            waits: true,
            runs: true,
            spyOn: true
          }
        },
        src: ['specs.js']
      }
    },

    // test
    karma: {
      options: {
        files: ['event-emitter.js', 'specs.js'],
        frameworks: ['jasmine'],
        browsers: ['PhantomJS'],
        reporters: ['dots']
      },
      test: {
        singleRun: true
      },
      coverage: {
        singleRun: true,
        reporters: ['dots', 'coverage'],
        preprocessors: {
          'event-emitter.js': ['coverage']
        },
        coverageReporter: {
          reporters: [
            { type: 'html', dir: 'coverage/' },
            { type: 'text-summary' }
          ]
        }
      },
      watch: {
        autoWatch: true
      }
    },

    // minify
    uglify: {
      dist: {
        options: {
          sourceMap: 'dist/event-emitter.min.map',
          banner: '<%= meta.banner %>'
        },
        files: {
          'dist/event-emitter.min.js': ['event-emitter.js']
        }
      }
    },

    // watch
    watch: {
      lint: {
        options: {
          atBegin: true
        },
        files: ['*.js'],
        tasks: ['jshint']
      },
      dev: {
        options: {
          atBegin: true
        },
        files: ['*.js'],
        tasks: ['jshint', 'karma:test'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('default', ['jshint', 'karma:test', 'uglify']);
  grunt.registerTask('test', ['karma:watch']);
  grunt.registerTask('cover', ['karma:coverage']);
  grunt.registerTask('ci', ['jshint', 'karma:test']);
};

module.exports = function(grunt) {
  grunt.initConfig({
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
          browser: true
        },
        src: ['EventEmitter.js']
      },
      test: {
        options: {
          globals: {
            EventEmitter: true,
            describe: true,
            beforeEach: true,
            afterEach: true,
            it: true,
            expect: true
          }
        },
        src: ['EventEmitterSpecs.js']
      }
    },
    karma: {
      options: {
        files: ['EventEmitter.js', 'EventEmitterSpecs.js'],
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
          'EventEmitter.js': ['coverage']
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('default', ['jshint', 'karma:test']);
  grunt.registerTask('test', ['karma:watch']);
  grunt.registerTask('cover', ['karma:coverage']);
};

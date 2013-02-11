module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',

  });

  grunt.loadNpmTask('grunt-jasmine-runner');

  // Default task.
  grunt.registerTask('default', '');

};
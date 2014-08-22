var child_process = require('child_process'),
    Promise = require('bluebird'),
    getSubmodules = require('./git-submodules'),

    // Get only the hash of the latest commit in the resulting log
    GIT_SHA_HEAD = 'git log -1 --format=%H',

    submodulePromise,
    getCachedSubmodules = function (callback) {
      if (!submodulePromise) {
        submodulePromise = new Promise(function (resolve, reject) {
          getSubmodules(function (err, resp) {
            return err ? reject(err) : resolve(resp);
          });
        });
      }

      return submodulePromise
        .then(callback.bind(null, null))
        .catch(callback);
    },
    callGit = function (gitCommand, callback) {
      child_process.exec(gitCommand, function (err, resp) {
        if (err) return callback(err);
        return callback(null, resp.trim());
      });
    };

/**
 * Get the SHA1 hash of the latest change in the current branch's history.
 *
 * @param {Array}    files    (optional) list of files to consider as the basis for
 *                            the last change. If passed, the resulting SHA1 reflects
 *                            the latest commit in which one of the files was modified.
 * @param {Boolean}  force    don't read any values from cache. For performance, some
 *                            data (like known submodule paths) are cached normally.
 * @param {Function} callback function that will receive the SHA1 as its first argument
 */
module.exports = function (/* [files,] [force,] callback */) {
  var args = Array.prototype.slice.call(arguments),
      cb = args.pop(),
      files = args.shift() || [],
      force = args.shift() || false;

  // just get the latest commit
  if (files.length === 0) {
    return callGit(GIT_SHA_HEAD, cb);
  }

  if (force) {
    // clear any closure caches
    submodulePromise = null;
  }

  getCachedSubmodules(function (err, submodules) {
    if (err) return cb(err);

    var submoduleRegex = new RegExp('^(' + submodules.join('|') + ')'),
        blobs = files.reduce(function (list, file) {
          list.push(file.replace(submoduleRegex, '$1'));
          return list;
        }, []);

    callGit(GIT_SHA_HEAD + ' -- ' + blobs.join(' '), cb);
  });
};

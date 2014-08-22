# git-bundle-sha

Retrieve the Git SHA of the latest commit that touched any number of files.
Useful in particular with bundling, when you want to identify a collection of files by
something like a hash, but tied to something more real (like a Git history.)

## Usage

Install using npm: `npm install git-bundle-sha`

And then require: `var gitsha = require('git-bundle-sha');`

### With a list of file paths

```javascript
gitsha(['lib/server.js', 'lib/common.js', 'helpers/handlebars.js'], function (err, sha) {
  if (err) throw err;
  console.log('Git SHA: ' + sha);
});
```

### Without a list (get HEAD SHA)

```javascript
gitsha(function(err, sha) {
  if (err) throw err;
  console.log('HEAD is at ' + sha);
});
```

## Notes

This works by sub-shelling out to a Git process, so your node process must be able to access
git. This also means that it is tied to your project directory at the moment.

## Questions

#### Is this submodule-aware?

Yes. If you are using submodules, any file nested under that submodule directory will have a last-modified SHA that corresponds to the commit that last updated the submodule in the parent project.

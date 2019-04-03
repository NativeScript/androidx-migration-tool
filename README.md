Tool that migrates Support Library namespaces to the new AndroidX namespaces.

By default it searches recursively .java,.js,.ts,.xml and .gradle files.
You can exclude files with specific extensions passing comma separated array at the end.

How to use:
  1. Install package globally `npm install ns-androidx-migrate -g`
  2. `ns-androidx-migrate <project-folder> <[ext1,ext2,..]>`
      This command will search and replace all Support Library namespace to the new AndroidX namespaces.
      It will also output suggestions, that should be made manually, for changing Support Library artifacts to AndroidX.
      Please do revise all changes manually after that!
      This operation may take a few minutes to execute (depends on your project structure size).

Examples:
    `ns-androidx-migrate test-plugin` - search and replace test-plugin folder for all default file types
    `ns-androidx-migrate test-plugin [js]` - search and replace test-plugin folder for all default files except `.js` ones.
    `ns-androidx-migrate test-plugin [ts,java]` - search and replace test-plugin folder for all default files except `.ts` and `.java` ones.
    Consider passing comma separated extensions with no `.` or whitespaces between them.
    

This tool does not migrate any 3rd party packages or plugins that your project relies on. 

Consider updating your project `package.json` dependencies with AndroidX versions.

Consider deleting your `node_modules` folder for faster migration.
Demo `test-plugin` included.
